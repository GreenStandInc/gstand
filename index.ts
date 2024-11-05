import { port } from './env.ts';
import { createClient } from './auth/client.ts';
import type { NodeOAuthClient } from '@atproto/oauth-client-node';
import Fastify from 'fastify';

let oauthClient: NodeOAuthClient = await createClient();

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

const server = Fastify({ logger: true });
server.register(require('@fastify/formbody'));
server.register(require('@fastify/multipart'));

server.get("/", async (req, res) => {console.log("home");res.type("html").send(index())});
server.post("/login", async (req, res) => {
  let data = await req.body as {bskyid: string};
  const handle: string = data?.bskyid?.toString() ?? "";
  console.log(handle);
  const url = await oauthClient.authorize(handle, {
    scope: "atproto transition:generic"
  })
  console.log(url);
  res.redirect(url.toString());
});
try {
  await server.listen({ port, host: '0.0.0.0' })
} catch (err) {
  server.log.error(err);
  process.exit();
}