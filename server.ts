import { serveFile } from "https://deno.land/std@0.217.0/http/file_server.ts";

const STATIC_EXTENSIONS = new Set(["html", "css", "js", "ico", "map"]);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  const fileExtension = path.split(".").pop()?.toLowerCase();
  if (fileExtension && STATIC_EXTENSIONS.has(fileExtension)) {
    try {
      return await serveFile(req, `${Deno.cwd()}/dist${path}`);
    } catch {
      return new Response("??", { status: 404 });
    }
  } else {
    try {
      return await serveFile(req, `${Deno.cwd()}/dist/index.html`);
    } catch {
      return new Response("??", { status: 404 });
    }
  }
}

Deno.serve(handler);
