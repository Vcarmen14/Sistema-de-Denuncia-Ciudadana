// API manager actualizado para usar Supabase
class ApiManager {
  constructor() {
    this.supabase = window.supabaseClient
    this.mockData = this.initializeMockData()
  }

  initializeMockData() {
    return {
      stats: {
        total: 0,
        enProceso: 0,
        resueltas: 0,
        pendientes: 0,
      },
      incidencias: [],
      notifications: [],
    }
  }

  // Simular delay de red para transiciones suaves
  async simulateNetworkDelay(min = 300, max = 800) {
    const delay = Math.random() * (max - min) + min
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Obtener estadísticas generales
  async getStats() {
    try {
      await this.simulateNetworkDelay()
      
      if (this.supabase?.client) {
        return await this.supabase.getStats()
      }
      
      // Fallback a datos mock
      return this.mockData.stats
    } catch (error) {
      console.error("Error fetching stats:", error)
      return this.mockData.stats
    }
  }

  // Obtener todas las incidencias (con filtros opcionales)
  async getIncidencias(filters = {}) {
    try {
      await this.simulateNetworkDelay()
      
      if (this.supabase?.client) {
        return await this.supabase.getIncidencias(filters)
      }
      
      // Fallback a datos mock
      let incidencias = [...this.mockData.incidencias]

      // Aplicar filtros
      if (filters.tipo && filters.tipo !== "all") {
        incidencias = incidencias.filter((inc) => inc.tipo === filters.tipo)
      }

      if (filters.estado && filters.estado !== "all") {
        incidencias = incidencias.filter((inc) => inc.estado === filters.estado)
      }

      if (filters.prioridad && filters.prioridad !== "all") {
        incidencias = incidencias.filter((inc) => inc.prioridad === filters.prioridad)
      }

      if (filters.ubicacion) {
        incidencias = incidencias.filter((inc) => 
          inc.ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase())
        )
      }

      return incidencias
    } catch (error) {
      console.error("Error fetching incidencias:", error)
      return []
    }
  }

  // Obtener incidencias del usuario actual
  async getMyDenuncias() {
    try {
      await this.simulateNetworkDelay()

      if (!window.auth.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }

      if (this.supabase?.client) {
        return await this.supabase.getMyIncidencias()
      }

      // Fallback a datos mock
      const userId = window.auth.currentUser.id
      return this.mockData.incidencias.filter((inc) => inc.usuario_id === userId)
    } catch (error) {
      console.error("Error fetching user incidencias:", error)
      return []
    }
  }

  // Crear nueva incidencia
  async createIncidencia(incidenciaData) {
    try {
      await this.simulateNetworkDelay(1000, 2000)

      if (!window.auth.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }

      if (this.supabase?.client) {
        return await this.supabase.createIncidencia(incidenciaData)
      }

      // Fallback a datos mock
      const newIncidencia = {
        id: this.mockData.incidencias.length + 1,
        ...incidenciaData,
        estado: "Pendiente",
        prioridad: this.calculatePriority(incidenciaData.tipo),
        fecha: new Date().toISOString().split("T")[0],
        usuario_id: window.auth.currentUser.id,
      }

      this.mockData.incidencias.unshift(newIncidencia)

      // Actualizar estadísticas
      this.mockData.stats.total++
      this.mockData.stats.pendientes++

      return newIncidencia
    } catch (error) {
      console.error("Error creating incidencia:", error)
      throw error
    }
  }

  // Calcular prioridad basada en el tipo
  calculatePriority(tipo) {
    const priorities = {
      Seguridad: "Alta",
      Infraestructura: "Alta",
      Alumbrado: "Media",
      Transporte: "Media",
      Limpieza: "Baja",
      Otro: "Baja",
    }
    return priorities[tipo] || "Baja"
  }

  // Obtener notificaciones del usuario
  async getNotifications() {
    try {
      await this.simulateNetworkDelay()

      if (!window.auth.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }

      if (this.supabase?.client) {
        return await this.supabase.getNotifications()
      }

      // Fallback a datos mock
      const userId = window.auth.currentUser.id
      return this.mockData.notifications.filter((notif) => notif.usuario_id === userId)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return []
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId) {
    try {
      await this.simulateNetworkDelay(300, 800)

      if (this.supabase?.client) {
        return await this.supabase.markNotificationAsRead(notificationId)
      }

      // Fallback a datos mock
      const notification = this.mockData.notifications.find((n) => n.id == notificationId)
      if (notification) {
        notification.leida = true
      }

      return { success: true }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // Enviar mensaje de contacto
  async sendContactMessage(contactData) {
    try {
      await this.simulateNetworkDelay(1000, 2000)

      if (this.supabase?.client) {
        return await this.supabase.sendFeedback({
          tipo: 'Contacto',
          mensaje: `${contactData.asunto}: ${contactData.mensaje}`,
          nombre: contactData.nombre,
          email: contactData.email,
          telefono: contactData.telefono
        })
      }

      // En una implementación real, aquí se enviaría el mensaje al servidor
      console.log("Mensaje de contacto enviado:", contactData)

      return { success: true, message: "Mensaje enviado correctamente" }
    } catch (error) {
      console.error("Error sending contact message:", error)
      throw error
    }
  }

  // Enviar feedback
  async sendFeedback(feedbackData) {
    try {
      await this.simulateNetworkDelay(800, 1500)

      if (this.supabase?.client) {
        return await this.supabase.sendFeedback(feedbackData)
      }

      // En una implementación real, aquí se enviaría el feedback al servidor
      console.log("Feedback enviado:", feedbackData)

      return { success: true, message: "Feedback enviado correctamente" }
    } catch (error) {
      console.error("Error sending feedback:", error)
      throw error
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(profileData) {
    try {
      await this.simulateNetworkDelay(800, 1200)

      if (!window.auth.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }

      // En una implementación real, aquí se actualizaría el perfil en el servidor
      return { success: true, data: profileData }
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  // Obtener datos de autocompletado
  async getAutocompleteData(source) {
    try {
      await this.simulateNetworkDelay(200, 500)

      const data = {
        locations: [
          "Av. 4 de Noviembre",
          "Av. Malecón",
          "Barrio Los Esteros",
          "Mercado Central",
          "Av. Universidad",
          "Centro de la ciudad",
          "Barrio San Lorenzo",
          "Zona Industrial",
          "Puerto de Manta",
          "Playa Murciélago",
          "Barrio Jocay",
          "Av. Circunvalación",
          "Terminal Terrestre",
          "Hospital del IESS",
          "Municipio de Manta"
        ],
        incidentTypes: [
          "Semáforo dañado",
          "Bache en la vía",
          "Alumbrado deficiente",
          "Acumulación de basura",
          "Parada de bus dañada",
          "Alcantarilla tapada",
          "Señalización faltante",
          "Ruido excesivo",
          "Contaminación",
          "Vandalismo",
          "Falta de agua potable",
          "Problema de drenaje",
          "Árbol caído",
          "Grafiti en edificios públicos",
          "Luminaria fundida"
        ],
      }

      return data[source] || []
    } catch (error) {
      console.error("Error fetching autocomplete data:", error)
      return []
    }
  }

  // Obtener detalles de una incidencia específica
  async getIncidenciaDetails(id) {
    try {
      await this.simulateNetworkDelay()

      const incidencia = this.mockData.incidencias.find((inc) => inc.id == id)
      if (!incidencia) {
        throw new Error("Incidencia no encontrada")
      }

      return incidencia
    } catch (error) {
      console.error("Error fetching incidencia details:", error)
      throw error
    }
  }
}

// Inicializar el manager de API
window.api = new ApiManager()
