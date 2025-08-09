import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import { resolve, join } from "path"

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".ico": "image/x-icon",
}

function getType(file: string) {
  const idx = file.lastIndexOf(".")
  const ext = idx >= 0 ? file.slice(idx).toLowerCase() : ""
  return TYPES[ext] || "application/octet-stream"
}

// Sirve archivos desde la carpeta "frontend/"
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path = [] } = await ctx.params
    let relPath = Array.isArray(path) ? path.join("/") : ""
    if (relPath === "" || relPath.endsWith("/")) relPath += "index.html"

    const baseDir = resolve(process.cwd(), "frontend")
    const filePath = resolve(join(baseDir, relPath))

    // Evitar path traversal
    if (!filePath.startsWith(baseDir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await fs.readFile(filePath)
    return new Response(data, {
      headers: { "content-type": getType(filePath) },
    })
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
