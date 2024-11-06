import { port, secret } from './env.ts';
import { createClient } from './auth/client.ts';
import { oauthClientCredentialsGrantTokenRequestSchema, type NodeOAuthClient } from '@atproto/oauth-client-node';
import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import { getIronSession } from 'iron-session';
import assert from 'node:assert';
import type { IncomingMessage, ServerResponse } from 'node:http'


type Session = { did: string }

// Templating like its 1999....please stop.
const index = () => {
  return `
    <!doctype html>
    <html>
      <head></head>
      <body>
        <form action="/login" method="post">
          <label for="bskyid">
            BlueSky ID: <input type="text" name="bskyid">
          </label>
          <input type="submit" value="Log In">
        </form>
      </body>
    </html>
  `;
}

const run = async () => {
  let oauthClient: NodeOAuthClient = await createClient();

  const server = Fastify({ logger: true });
  server.register(formbody);
  server.register(multipart);

  server.get("/", async (req, res) => { res.type("html").send(index()) });
  server.post("/login", async (req, res) => {
    let data = await req.body as { bskyid: string };
    const handle: string = data?.bskyid?.toString() ?? "";
    const url = await oauthClient.authorize(handle, {
      scope: "atproto transition:generic"
    })
    res.redirect(url.toString());
  });
  server.get("/client-metadata.json", async (req, res) => { res.send(oauthClient.clientMetadata) })
  server.get("/oauth/callback", async (req, res) => {
    try {
      const params = new URLSearchParams(req.originalUrl.split("?")[1])
      const { session } = await oauthClient.callback(params);
      const clientSession = await getIronSession<Session>(req.raw, res.raw, {
        cookieName: "sid",
        password: secret
      });
      assert(!clientSession.did, "session already exists");
      clientSession.did = session.did;
      await clientSession.save();
      return res.redirect("/");
    } catch (err) {
      server.log.error(err);
      return res.redirect("/?error");
    }
  });

  try {
    await server.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err);
    process.exit();
  }
}

run()