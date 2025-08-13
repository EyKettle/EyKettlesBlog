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
  "svg",
  "png",
]);

function parseError(e: any) {
  return e instanceof Error ? e.message : String(e);
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.startsWith("api")) {
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    };

    try {
      const body = await req.json();
      const results: Record<string, string | null> = {};
      if (Array.isArray(body.get)) {
        for (const key in body.get) {
          if (typeof key === "string") results[key] = Deno.env.get(key) ?? null;
        }
      }

      if (Array.isArray(body.set)) {
        for (const item in body.set) {
          if (item && typeof item === "string") {
            for (const [k, v] of Object.entries(item)) {
              if (typeof v === "string") Deno.env.set(k, v);
            }
          }
        }
      }

      return new Response(JSON.stringify(results), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: parseError(error) }), {
        status: 400,
        headers,
      });
    }
  }

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
