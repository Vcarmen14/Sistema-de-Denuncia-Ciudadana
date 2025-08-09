import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join, resolve } from "path"

function typeOf(file: string) {
  return file.endsWith(".mp4")
    ? "video/mp4"
    : file.endsWith(".webm")
    ? "video/webm"
    : "application/octet-stream"
}

// Mapea /videos/* a frontend/videos/*
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await ctx.params
  try {
    const baseDir = resolve(process.cwd(), "frontend", "videos")
    const rel = path.join("/")
    const full = resolve(join(baseDir, rel))
    if (!full.startsWith(baseDir)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const data = await fs.readFile(full)
    return new Response(data, { headers: { "content-type": typeOf(full) } })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
