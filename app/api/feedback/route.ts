import { NextResponse } from "next/server"
import { getSql } from "../_lib/neon"
import { getSession } from "../_lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    const body = await req.json().catch(() => ({}))
    const {
      tipo = null,
      mensaje,
      nombre = null,
      email = null,
      telefono = null,
    } = body || {}

    if (!mensaje) {
      return NextResponse.json({ error: "mensaje es requerido" }, { status: 400 })
    }

    const sql = getSql()
    const rows = await sql<any[]>`
      insert into feedback (tipo, mensaje, usuario_id, nombre, email, telefono)
      values (${tipo}, ${mensaje}, ${session?.uid ?? null}, ${nombre}, ${email}, ${telefono})
      returning id, tipo, mensaje, usuario_id, nombre, email, telefono, fecha
    `
    return NextResponse.json({ feedback: rows[0] }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error enviando feedback", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
