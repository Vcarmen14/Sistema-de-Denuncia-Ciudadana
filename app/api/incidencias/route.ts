import { NextRequest, NextResponse } from "next/server"
import { getSql, rows } from "../_lib/neon"
import { getSession } from "../_lib/auth"

function getCoordinatesFromLocation(ubicacion: string | null | undefined) {
  const locationMap: Record<string, { lat: number; lng: number }> = {
    "av. 4 de noviembre": { lat: -0.9536, lng: -80.7286 },
    malecon: { lat: -0.9486, lng: -80.7206 },
    "los esteros": { lat: -0.9456, lng: -80.7156 },
    "mercado central": { lat: -0.9506, lng: -80.7236 },
    universidad: { lat: -0.9426, lng: -80.7126 },
    centro: { lat: -0.95, lng: -80.725 },
    "san lorenzo": { lat: -0.9476, lng: -80.7196 },
    jocay: { lat: -0.9446, lng: -80.7146 },
    circunvalacion: { lat: -0.9516, lng: -80.7266 },
  }
  const text = (ubicacion || "").toLowerCase()
  for (const [k, v] of Object.entries(locationMap)) {
    if (text.includes(k)) return v
  }
  return { lat: -0.9536, lng: -80.7286 }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const titulo = String(body.titulo || "").trim()
    if (!titulo) return NextResponse.json({ error: "Título requerido" }, { status: 400 })

    const tipo = body.tipo ?? null
    const ubicacion = body.ubicacion ?? null
    const descripcion = body.descripcion ?? null

    let latitud = typeof body.latitud === "number" ? body.latitud : null
    let longitud = typeof body.longitud === "number" ? body.longitud : null
    if (latitud == null || longitud == null) {
      const approx = getCoordinatesFromLocation(ubicacion)
      latitud = approx.lat
      longitud = approx.lng
    }

    // ✅ Normaliza fotos como string[] y serializa como JSON
    const fotos: string[] = Array.isArray(body.fotos)
      ? body.fotos
          .map((f: any) => {
            if (!f) return null
            if (typeof f === "string") return f
            if (typeof f === "object") return f.url || f.dataUrl || f.base64 || f.src || null
            return null
          })
          .filter((x: any) => typeof x === "string" && x.length > 0)
      : []

    const fotosJson = JSON.stringify(fotos)

    const estado = body.estado || "Pendiente"
    const prioridad =
      body.prioridad || (tipo && String(tipo).toLowerCase().includes("seguridad") ? "Alta" : "Media")

    const sql = getSql()
    const inserted = await sql`
      INSERT INTO incidencias (
        titulo, tipo, ubicacion, descripcion, usuario_id,
        estado, prioridad, latitud, longitud, fotos, fecha
      ) VALUES (
        ${titulo}, ${tipo}, ${ubicacion}, ${descripcion}, ${session.uid},
        ${estado}, ${prioridad}, ${latitud}, ${longitud}, ${fotosJson}, NOW()
      )
      RETURNING id, titulo, tipo, ubicacion, descripcion, usuario_id,
                fecha, estado, prioridad, latitud, longitud, fotos
    `
    const [incidencia] = rows(inserted)
    return NextResponse.json({ incidencia }, { status: 201 })
  } catch (err: any) {
    console.error("Error en POST /api/incidencias:", err)
    return NextResponse.json(
      { error: "Error creando incidencia", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Remove session check to allow unauthenticated access
    // const session = await getSession()
    // if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const url = new URL(req.url)
    const tipo = url.searchParams.get("tipo")
    const estado = url.searchParams.get("estado")
    const prioridad = url.searchParams.get("prioridad")
    const ubicacion = url.searchParams.get("ubicacion")

    const sql = getSql()

    let query = sql`
      SELECT id, titulo, tipo, ubicacion, descripcion, usuario_id,
             fecha, estado, prioridad, latitud, longitud, fotos
      FROM incidencias
      WHERE 1=1
    `

    if (tipo) {
      query = sql`${query} AND tipo = ${tipo}`
    }
    if (estado) {
      query = sql`${query} AND estado = ${estado}`
    }
    if (prioridad) {
      query = sql`${query} AND prioridad = ${prioridad}`
    }
    if (ubicacion) {
      query = sql`${query} AND ubicacion = ${ubicacion}`
    }

    query = sql`${query} ORDER BY fecha DESC NULLS LAST LIMIT 200`

    const res = await query
    return NextResponse.json(rows(res))
  } catch (err: any) {
    console.error("Error en GET /api/incidencias:", err)
    return NextResponse.json(
      { error: "Error listando incidencias", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
