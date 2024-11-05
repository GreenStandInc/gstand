import { port } from "./env.ts";
import { createClient } from "./auth/client.ts";
import type { NodeOAuthClient } from "@atproto/oauth-client-node";

let oauthClient: NodeOAuthClient = await createClient();

const server = Bun.serve({
  port,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    const method = req.method;

    if(path === "/" && method === "GET") return index();
    else if (path === "/login" && method === "POST") return login(req);

    return new Response("Page Not Found", { status: 404 });

  }
})

// Templating like its 1999....please stop.
const index = (): Response => {
  let res = `
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
  return new Response(res, {
      headers: {
        "Content-Type": "text/html",
      }});
}

const login = async (req: Request): Promise<Response> => {
  let data = await req.formData();
  const handle: string = data.get("bskyid")?.toString() ?? "";
  const url = await oauthClient.authorize(handle, {
    scope: "atproto transition:generic"
  })
  console.log(url);
  return Response.redirect(url.toString());
}
