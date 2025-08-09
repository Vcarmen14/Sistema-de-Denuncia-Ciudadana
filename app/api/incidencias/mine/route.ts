import { NextResponse } from "next/server"
import { getSql, rows } from "../../_lib/neon"
import { getSession } from "../../_lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const sql = getSql()
    const res = await sql`
      SELECT id, titulo, tipo, ubicacion, descripcion, usuario_id,
             fecha, estado, prioridad, latitud, longitud, fotos
      FROM incidencias
      WHERE usuario_id = ${session.uid}
      ORDER BY fecha DESC NULLS LAST
      LIMIT 200
    `
    return NextResponse.json(rows(res))
  } catch (err: any) {
    console.error("Error en GET /api/incidencias/mine:", err)
    return NextResponse.json(
      { error: "Error listando incidencias del usuario", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
