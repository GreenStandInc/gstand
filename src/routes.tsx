import { Hono, type Context } from 'hono';
import { getIronSession } from 'iron-session';
import { Agent } from '@atproto/api';
import * as env from '#/env';
import { oauthClient, db } from '#/globals';
import { serveStatic } from '@hono/node-server/serve-static';
import { logger } from 'hono/logger';
import * as Item from '#/db/item.ts';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { TID } from '@atproto/common';
import assert from 'node:assert';

export type Session = { did: string }

const getSessionAgent = async (c: Context) => {
  const session = await getIronSession<Session>(c.req.raw, c.res, {
    cookieName: "sid",
    password: env.secret
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

export const server = new Hono();
if (env.loglevel !== "none") {
  server.use(logger());
}

server.use("/assets/*", serveStatic({
  root: "./client/dist",
}));

server.use("/", serveStatic({
  path: "./client/dist/index.html",
}))


export const routes = server.get("/api/profile", async (c) => {
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
    password: env.secret
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
      password: env.secret
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

export type AppType = typeof routes;
export const _private = {getSessionAgent};