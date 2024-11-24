import { Hono, type Context } from 'hono';
import { getIronSession } from 'iron-session';
import { Agent } from '@atproto/api';
import * as env from '#/env';
import { oauthClient, db } from '#/globals';
import { serveStatic } from '@hono/node-server/serve-static';
import { logger } from 'hono/logger';
import * as Item from '#/db/item';
import * as Image from '#/db/image';
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

const login = async (c: Context) => {
  const agent = await getSessionAgent(c);
  if (!agent) throw new HTTPException(401, { message: "Not logged in" });
  return agent;
}

export const server = new Hono()
  .use("/assets/*", serveStatic({
    root: "./client/dist",
  })).use("/", serveStatic({
    path: "./client/dist/index.html",


  })).get("/api/profile", async (c) => {
    const agent = await login(c);
    if (!agent) throw new HTTPException(401, { message: "Not logged in" });
    const { success, data } = await agent.getProfile({ actor: agent.assertDid });
    if (!success) throw new HTTPException(401, { message: "Invalid profile" });
    return c.json(data);


  }).get("/api/items", async (c) => {
    const items = await db.selectFrom("item").selectAll().execute();
    return c.json(items.map((i) => { return { ...i, image: [] } }));


  }).post("/api/addItem", zValidator("form", z.object({
    name: z.string(),
    description: z.string(),
    image: z.union([z.string(), z.instanceof(File)]),
  })), async (c) => {
    const fData = c.req.valid('form');
    const images: File[] = fData.image === "" ? [] : [(fData.image as File)];
    const i = Item.create({
      name: fData.name,
      description: fData.description,
      image: fData.image === "" ? [] : await Promise.all(images.map(async (i) => Image.create({
        type: i.type,
        data: Buffer.from(await i.arrayBuffer()),
      })))
    })
    const agent = await login(c);

    const uploadedImages = await Promise.all(images.map(async (f) => {
      const res = await agent.com.atproto.repo.uploadBlob(f);
      return res.data.blob;
    }));

    let res;
    try {
      res = await agent.com.atproto.repo.putRecord({
        repo: agent.assertDid,
        collection: Item.RecordPath,
        record: { ...Item.toRecord(i), images: uploadedImages },
        rkey: TID.nextStr(),
      });
    } catch (e) {
      if (env.loglevel !== "none") {
        console.error("Failed to write record");
        console.error(e);
      }
      throw new HTTPException(500, { message: "Failed to write record" });
    }
    const uri = res.data.uri;
    try {
      i.uri = uri;
      i.sellerDid = agent.assertDid;
      await Item.insert(db, i);
    } catch (e) {
      if (env.loglevel !== "none") {
        console.error("Failed to update database");
        console.error(e)
      }
      throw new HTTPException(500, { message: "Failed to update database" });
    }
    return c.json(i);


  }).post("/login", zValidator("form", z.object({
    bskyid: z.string(),
  })), async (c) => {
    const { bskyid } = c.req.valid('form');
    const url = await oauthClient.authorize(bskyid, {
      scope: "atproto transition:generic"
    });
    return c.redirect(url.toString());


  }).post("/logout", async (c) => {
    const session = await getIronSession<Session>(c.req.raw, c.res, {
      cookieName: "sid",
      password: env.secret
    });
    await session.destroy();
    return c.redirect("/");


  }).get("/client-metadata.json", async (c) => {
    return c.json(oauthClient.clientMetadata)


  }).get("/oauth/callback", async (c) => {
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
      if (env.loglevel !== "none") {
        console.error(err);
      }
      return c.redirect("/?error");
    }
  });


if (env.loglevel !== "none") {
  server.use(logger());
}

export type AppType = typeof server;
