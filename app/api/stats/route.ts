import { NextResponse } from "next/server"
import { getSql, rows } from "../_lib/neon"

// GET /api/stats -> { total, pendientes, enProceso, resueltas, recientes: Incidencia[] }
export async function GET() {
  try {
    const sql = getSql()

    const totalRow = rows<{ count: number }>(
      await sql`SELECT COUNT(*)::int AS count FROM incidencias`
    )[0]
    const total = totalRow?.count ?? 0

    const byEstado = rows<{ estado: string; count: number }>(
      await sql`SELECT LOWER(COALESCE(estado,'pendiente')) AS estado, COUNT(*)::int AS count FROM incidencias GROUP BY 1`
    )

    let pendientes = 0
    let enProceso = 0
    let resueltas = 0
    for (const r of byEstado) {
      const estado = (r?.estado || "").toLowerCase()
      const c = r?.count || 0
      if (estado.includes("pend")) pendientes += c
      else if (estado.includes("proc") || estado.includes("aten") || estado.includes("en ")) enProceso += c
      else if (estado.includes("resu") || estado.includes("compl") || estado.includes("final")) resueltas += c
    }

    const recientes = rows(
      await sql`
        SELECT id, titulo, tipo, ubicacion, descripcion, usuario_id,
               fecha, estado, prioridad, latitud, longitud, fotos
        FROM incidencias
        ORDER BY fecha DESC NULLS LAST
        LIMIT 5
      `
    )

    return NextResponse.json({
      total,
      pendientes,
      enProceso,
      resueltas,
      recientes,
    })
  } catch (err: any) {
    console.error("Error en /api/stats:", err)
    return NextResponse.json(
      { error: "Error obteniendo estadísticas", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
