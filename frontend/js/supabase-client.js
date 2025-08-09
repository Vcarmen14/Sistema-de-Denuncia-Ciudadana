// Cliente para conectar el frontend vanilla con los endpoints Next.js.
// IMPORTANTE: carga este archivo ANTES que api.js y app.js.
(function () {
  const BASE = ""

  async function http(path, options = {}) {
    const url = path.startsWith("http") ? path : `${BASE}${path}`
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }
    const res = await fetch(url, { credentials: "include", ...options, headers })
    let data = null
    try {
      data = await res.json()
    } catch {
      data = null
    }
    if (!res.ok) {
      const errMsg = data?.error || data?.message || `HTTP ${res.status}`
      throw new Error(errMsg)
    }
    return data
  }

  function getCoordinatesFromLocation(ubicacion) {
    const locationMap = {
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
    const text = String(ubicacion || "").toLowerCase()
    for (const [k, v] of Object.entries(locationMap)) if (text.includes(k)) return v
    return { lat: -0.9536, lng: -80.7286 }
  }

  function normalizeInc(it) {
    let lat = typeof it.latitud === "number" ? it.latitud : (it.latitud ? Number(it.latitud) : null)
    let lng = typeof it.longitud === "number" ? it.longitud : (it.longitud ? Number(it.longitud) : null)
    if (lat == null || lng == null) {
      const approx = getCoordinatesFromLocation(it.ubicacion)
      lat = approx.lat
      lng = approx.lng
    }
    return {
      id: it.id,
      titulo: it.titulo || "Sin título",
      tipo: it.tipo ?? null,
      ubicacion: it.ubicacion ?? null,
      descripcion: it.descripcion ?? null,
      usuario_id: it.usuario_id ?? null,
      fecha: it.fecha || it.fecha_creacion || null,
      estado: it.estado || "Pendiente",
      prioridad: it.prioridad || "Media",
      latitud: lat,
      longitud: lng,
      fotos: Array.isArray(it.fotos) ? it.fotos : [],
      usuario_nombre: it.usuario_nombre || undefined,
    }
  }

  function pickArray(res, key) {
    if (Array.isArray(res)) return res
    if (res && Array.isArray(res[key])) return res[key]
    return []
  }

  const supabaseClient = {
    client: true,

    async getStats() {
      const res = await http("/api/stats", { method: "GET" })
      return {
        total: Number(res?.total || 0),
        pendientes: Number(res?.pendientes || 0),
        enProceso: Number(res?.enProceso || 0),
        resueltas: Number(res?.resueltas || 0),
        recientes: pickArray(res, "recientes").map(normalizeInc),
      }
    },

    async getIncidencias(filters = {}) {
      const params = new URLSearchParams()
      if (filters.tipo && filters.tipo !== "all") params.set("tipo", filters.tipo)
      if (filters.estado && filters.estado !== "all") params.set("estado", filters.estado)
      if (filters.prioridad && filters.prioridad !== "all") params.set("prioridad", filters.prioridad)
      if (filters.ubicacion && String(filters.ubicacion).trim()) params.set("ubicacion", String(filters.ubicacion).trim())
      const qs = params.toString() ? `?${params.toString()}` : ""
      const res = await http(`/api/incidencias${qs}`, { method: "GET" })
      return pickArray(res, "incidencias").map(normalizeInc)
    },

    async getMyIncidencias() {
      const res = await http("/api/incidencias/mine", { method: "GET" })
      return pickArray(res, "incidencias").map(normalizeInc)
    },

    async createIncidencia(incidenciaData) {
      const fotosNorm = Array.isArray(incidenciaData.fotos)
        ? incidenciaData.fotos
            .map((f) => {
              if (!f) return null
              if (typeof f === "string") return f
              if (typeof f === "object") return f.url || f.dataUrl || f.base64 || f.src || null
              return null
            })
            .filter((x) => typeof x === "string" && x.length > 0)
        : []

      let lat = incidenciaData.latitud ?? null
      let lng = incidenciaData.longitud ?? null
      if (lat == null || lng == null) {
        const approx = getCoordinatesFromLocation(incidenciaData.ubicacion)
        lat = approx.lat
        lng = approx.lng
      }

      const payload = {
        titulo: incidenciaData.titulo,
        tipo: incidenciaData.tipo,
        ubicacion: incidenciaData.ubicacion ?? null,
        descripcion: incidenciaData.descripcion ?? null,
        estado: incidenciaData.estado ?? "Pendiente",
        prioridad: incidenciaData.prioridad ?? "Media",
        latitud: lat,
        longitud: lng,
        fotos: fotosNorm,
      }

      const res = await http("/api/incidencias", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      const inc = res?.incidencia || res || null
      return inc ? normalizeInc(inc) : null
    },

    async getNotifications() {
      const res = await http("/api/notificaciones", { method: "GET" })
      return Array.isArray(res) ? res : []
    },

    async markNotificationAsRead(notificationId) {
      await http(`/api/notificaciones/${encodeURIComponent(notificationId)}`, {
        method: "PATCH",
        body: JSON.stringify({ leida: true }),
      })
      return { success: true }
    },

    async sendFeedback(feedbackData) {
      return await http("/api/feedback", {
        method: "POST",
        body: JSON.stringify(feedbackData),
      })
    },
  }

  window.supabaseClient = supabaseClient
})()
