import { NextResponse } from "next/server"
import { getSql } from "../../_lib/neon"

export async function GET() {
  try {
    const sql = getSql()
    const rows = await sql<{ now: string }[]>`select now() as now`
    return NextResponse.json({ ok: true, now: rows[0]?.now })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    )
  }
}
