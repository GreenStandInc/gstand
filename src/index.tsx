import { dbDatabase, dbPath, dbHost, dbPassword, dbPort, dbType, dbUsername, port, secret, loglevel } from './env.ts';
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
import { createPostgresDb, createSQLiteDb, migrateToLatest } from './db.ts';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'node:path';

type Session = { did: string }

const run = async () => {

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

  const server = new Hono();
  if(loglevel !== "none") {
    server.use(logger());
  }

  server.use("/assets/*", serveStatic({
    root: "./client/dist",
  }));

  server.use("/", serveStatic({
    path: "./client/dist/index.html",
  }))

  server.get("/testIsLoggedIn", async (c) => {
    const agent = await getSessionAgent(c);

    if (agent) return c.text("LOGGED IN!");
    else return c.text("Logged Out!")
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

  serve({ fetch: server.fetch, port });

}

run()
