import { NextResponse } from "next/server"
import { getSql, rows } from "../_lib/neon"
import { getSession } from "../_lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const sql = getSql()
    // Evitar columnas que no existen: traer todo y ordenar por id desc
    const res = await sql`
      SELECT *
      FROM notificaciones
      WHERE usuario_id = ${session.uid}
      ORDER BY id DESC
      LIMIT 200
    `
    return NextResponse.json(rows(res))
  } catch (err: any) {
    console.error("Error en /api/notificaciones:", err)
    return NextResponse.json(
      { error: "No se pudieron obtener notificaciones", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
