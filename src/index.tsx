import { dbDatabase, dbPath, dbHost, dbPassword, dbPort, dbType, dbUsername, port, secret, loglevel, firehoseRelay } from './env.ts';
import { createClient } from './auth/client.ts';
import { type NodeOAuthClient } from '@atproto/oauth-client-node';
import { Agent } from '@atproto/api';
import { getIronSession } from 'iron-session';
import assert from 'node:assert';
import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { Fragment, type FC } from 'hono/jsx';
import { html } from 'hono/html';
import { createPostgresDb, createSQLiteDb, migrateToLatest } from '#/db/db.ts';
import * as Item from '#/db/item.ts';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'node:path';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { Firehose } from '@atproto/sync';
import { IdResolver, MemoryCache } from '@atproto/identity';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';
import { TID } from '@atproto/common';

type Session = { did: string }

const db = dbType === "sqlite" ?
  createSQLiteDb(dbPath) :
  createPostgresDb({
    database: dbDatabase,
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    max: 10 // Probably doesn't matter.
  });
migrateToLatest(db);

const oauthClient: NodeOAuthClient = await createClient(db);

const getSessionAgent = async (c: Context) => {
  const session = await getIronSession<Session>(c.req.raw, c.res, {
    cookieName: "sid",
    password: secret
  });
  if (!session.did) return null;
  try {
    const oauthSession = await oauthClient.restore(session.did);
    return oauthSession ? new Agent(oauthSession) : null;
  } catch (err) {
    await session.destroy();
    return null;
  }
}

const HOUR = 60e3 * 60;
const DAY = HOUR * 24;

const idResolver = new IdResolver({
  didCache: new MemoryCache(HOUR, DAY)
})

const firehose = new Firehose({
  idResolver,
  service: firehoseRelay,
  handleEvent: async (e) => {
    if (e.event === "create" || e.event === "update") {
      const now = new Date();
      const rec = e.record;
      if (e.collection === Item.RecordPath
        && ItemRecord.isRecord(rec) && ItemRecord.validateRecord(rec)
      ) {
        await Item.insert(db, {
          uri: e.uri.toString(),
          sellerDid: e.did,
          name: rec.name,
          description: rec.description,
          image: []
        });
      }
    } else if (e.event === "delete" && e.collection === Item.RecordPath) {
      await Item.del(db, e.uri.toString());
    }
  },
  onError: (err) => {
    console.error(err);
  },
  filterCollections: [Item.RecordPath],
})
// TODO, re-enable
if (firehoseRelay !== "") {
  firehose.start();
}

const server = new Hono();
if (loglevel !== "none") {
  server.use(logger());
}

server.use("/assets/*", serveStatic({
  root: "./client/dist",
}));

server.use("/", serveStatic({
  path: "./client/dist/index.html",
}))

let routes = server.get("/api/profile", async (c) => {
  const agent = await getSessionAgent(c);
  if (!agent) throw new HTTPException(401, { message: "Not logged in" });
  const { success, data } = await agent.getProfile({ actor: agent.assertDid });
  if (!success) throw new HTTPException(401, { message: "Invalid profile" });
  return c.json(data);


}).get("/api/items", async (c) => {
  const items = await db.selectFrom("item").selectAll().execute();
  return c.json(items.map((i) => {return {...i, image: []}}));

}).post("/api/addItem", zValidator("form", z.object({
  name: z.string(),
  description: z.string(),
  image: z.union([z.string(), z.instanceof(File)]),
})), async (c) => {
  const fData = c.req.valid('form');
  const i: Item.Item = {
    ...Item.create(),
    name: fData.name,
    description: fData.description,
  }
  const images: File[] = fData.image === "" ? [] : [(fData.image as File)];
  const agent = await getSessionAgent(c);
  if (!agent) throw new HTTPException(401, { message: "Not logged in" });

  const uploadedImages = await Promise.all(images.map(async (f) => {
    const res = await agent.com.atproto.repo.uploadBlob(f);
    return res.data.blob;
  }));

  try {
    const res = await agent.com.atproto.repo.putRecord({
      repo: agent.assertDid,
      collection: Item.RecordPath,
      record: { ...Item.toRecord(i), images: uploadedImages },
      rkey: TID.nextStr(),
    })
    const uri = res.data.uri;
    try {
      i.uri = uri;
      i.sellerDid = agent.assertDid;
      await Item.insert(db, i);
    } catch (e) {
      console.error("Failed to update database");
      console.error(e)
    }
  } catch (e) {
    console.error("Failed to write record");
    console.error(e);
    throw new HTTPException(500, { message: "Failed to write record" });
  }
  return c.json(i);
});

server.post("/login", async (c) => {
  const data = await c.req.formData();
  const handle: string = data.get('bskyid')?.toString() ?? "";
  const url = await oauthClient.authorize(handle, {
    scope: "atproto transition:generic"
  });
  return c.redirect(url.toString());
});

server.post("/logout", async (c) => {
  const session = await getIronSession<Session>(c.req.raw, c.res, {
    cookieName: "sid",
    password: secret
  });
  await session.destroy();
  return c.redirect("/");
})

server.get("/client-metadata.json", async (c) => {
  return c.json(oauthClient.clientMetadata)
});

server.get("/oauth/callback", async (c) => {
  const params = new URLSearchParams(c.req.url.split("?")[1])
  try {
    const { session } = await oauthClient.callback(params);
    const clientSession = await getIronSession<Session>(c.req.raw, c.res, {
      cookieName: "sid",
      password: secret
    });
    assert(!clientSession.did, "session already exists");
    clientSession.did = session.did;
    await clientSession.save();
    return c.redirect("/");
  } catch (err) {
    //server.log.error(err);
    console.error(err);
    return c.redirect("/?error");
  }
});

const onCloseSignal = () => {
  setTimeout(() => process.exit(1), 10e3).unref();
  if (firehoseRelay !== "") {
    firehose.destroy();
  }
  process.exit();
}

serve({ fetch: server.fetch, port });
process.on('SIGINT', onCloseSignal)
process.on('SIGTERM', onCloseSignal)


export type AppType = typeof routes;
