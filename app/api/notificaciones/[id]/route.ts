import { NextRequest, NextResponse } from "next/server"
import { getSql, rows } from "../../_lib/neon"
import { getSession } from "../../_lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { id } = params
    const body = await req.json().catch(() => ({}))
    const leida = Boolean(body?.leida)

    const sql = getSql()
    const res = await sql`
      UPDATE notificaciones
      SET leida = ${leida}
      WHERE id = ${id} AND usuario_id = ${session.uid}
      RETURNING *
    `
    const updated = rows(res)[0] || null
    return NextResponse.json({ ok: true, notificacion: updated })
  } catch (err: any) {
    console.error("Error en PATCH /api/notificaciones/[id]:", err)
    return NextResponse.json(
      { error: "No se pudo actualizar notificación", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
