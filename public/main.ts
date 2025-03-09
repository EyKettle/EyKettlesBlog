import { serveFile } from "https://deno.land/std@0.217.0/http/file_server.ts";
import * as path from "https://deno.land/std@0.217.0/path/mod.ts";

export const STATIC_EXTENSIONS = new Set([
  "ico",
  "js",
  "css",
  "ttf",
  "zip",
  "rar",
  "webp",
  "md",
]);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const fileExtension = pathname.split(".").pop()?.toLowerCase();
  if (fileExtension && STATIC_EXTENSIONS.has(fileExtension)) {
    try {
      return await serveFile(req, path.join(Deno.cwd(), pathname));
    } catch (error) {
      console.error("Error serving static file: ", error);
      return new Response("No such file", { status: 404 });
    }
  } else {
    try {
      return await serveFile(req, path.join(Deno.cwd(), "index.html"));
    } catch (error) {
      console.error("Error serving index.html: ", error);
      return new Response("Website disappeared", { status: 404 });
    }
  }
}

Deno.serve(handler);
