import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join, resolve } from "path"

// Sirve /captions/* desde frontend/captions/*
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await ctx.params
  try {
    const baseDir = resolve(process.cwd(), "frontend", "captions")
    const rel = path.join("/")
    const full = resolve(join(baseDir, rel))
    if (!full.startsWith(baseDir)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const data = await fs.readFile(full)
    return new Response(data, { headers: { "content-type": "text/vtt; charset=utf-8" } })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
