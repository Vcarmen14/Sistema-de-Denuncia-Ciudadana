import { NextResponse } from "next/server"
import { getSql } from "../../_lib/neon"
import { getSession } from "../../_lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ user: null }, { status: 200 })

    const sql = getSql()
    const rows = await sql<
      { id: number; email: string; nombre: string | null; rol: string | null }[]
    >`
      select id, email, nombre, rol from usuarios where id = ${session.uid} limit 1
    `
    return NextResponse.json({ user: rows[0] ?? null })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error obteniendo usuario", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
