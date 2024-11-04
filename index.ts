const server = Bun.serve({
  async fetch(req) {
    const path = new URL(req.url).pathname;
    const method = req.method;

    if(path === "/" && method === "GET") return index();
    else if (path === "/" && method === "POST") return accept_form(req);

    return new Response("Page Not Found", { status: 404 });

  }
})

// Templating like its 1999....please stop.
function index(): Response {
  let res = `
    <!doctype html>
    <html>
    <head></head>
        <body>
            <form action="/" method="post">
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

async function accept_form(req: Request): Response {

  let data = await req.formData()

  console.log(data.get("bskyid"))

  return new Response("THANKS!");
}