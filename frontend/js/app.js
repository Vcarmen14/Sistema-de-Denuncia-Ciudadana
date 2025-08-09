// Aplicación principal mejorada con todas las correcciones
class App {
  constructor() {
    this.currentPage = "inicio"
    this.formHasChanges = false
    this.isEditingProfile = false
    this.loginAttempts = 0
    this.lastLoginAttempt = 0
    this.selectedPhotos = []
    this.data = {
      stats: null,
      incidencias: [],
      denuncias: [],
      notifications: [],
      filteredIncidencias: [],
    }
    this.init()
  }

  async init() {
    this.setupNavigation()
    this.setupFormChangeTracking()
    this.setupBeforeUnloadWarning()
    this.setupResponsiveHandling()
    await this.loadInitialData()
    this.navigateTo("inicio")
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn")
    navButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const page = e.target.getAttribute("data-page")
        if (page) {
          // Verificar si requiere autenticación
          if (e.target.classList.contains("auth-required") && !window.auth.isLoggedIn) {
            window.components.showToast(window.i18n.get("auth.login_required"), "warning")
            this.navigateTo("perfil")
            return
          }

          // Verificar cambios sin guardar SOLO en formularios activos
          if (this.formHasChanges && this.isFormActive()) {
            const confirmed = await window.components.showConfirmation(
              window.i18n.get("form.unsaved_changes_title"),
              window.i18n.get("form.unsaved_changes")
            )
            if (!confirmed) return
          }

          this.navigateTo(page)
        }
      })
    })
  }

  isFormActive() {
    // Solo mostrar alerta si hay un formulario visible con cambios
    const activeForm = document.querySelector('form:not([style*="display: none"])')
    return activeForm && this.formHasChanges
  }

  setupFormChangeTracking() {
    document.addEventListener("input", (e) => {
      const form = e.target.closest("form")
      if (form && this.isTrackableForm(form)) {
        // Solo marcar cambios si el usuario realmente está escribiendo
        if (e.target.value.trim().length > 0) {
          this.formHasChanges = true
        }
        if (form.id === "profile-form") {
          this.highlightChangedField(e.target, form)
          this.checkFormHasChanges(form)
        }
      }
    })

    document.addEventListener("change", (e) => {
      const form = e.target.closest("form")
      if (form && this.isTrackableForm(form)) {
        this.formHasChanges = true
        if (form.id === "profile-form") {
          this.highlightChangedField(e.target, form)
          this.checkFormHasChanges(form)
        }
      }
    })
  }

  setupResponsiveHandling() {
    window.addEventListener('resize', () => {
      this.handleResponsiveLayout()
    })
    this.handleResponsiveLayout()
  }

  handleResponsiveLayout() {
    const header = document.querySelector('.header')
    const sidebar = document.querySelector('.sidebar')
    const mainContent = document.querySelector('.main-content')
    
    if (window.innerWidth <= 768) {
      if (mainContent) {
        mainContent.style.paddingTop = '1rem'
      }
    } else {
      if (mainContent) {
        mainContent.style.paddingTop = '2rem'
      }
    }
  }

  checkFormHasChanges(form) {
    if (!window.auth.currentUser) return
    const fields = form.querySelectorAll("input[name], select[name], textarea[name]")
    let hasChanges = false
    fields.forEach((field) => {
      const name = field.name
      const originalValue = window.auth.currentUser[name] || ""
      const currentValue = field.value || ""
      if (currentValue !== originalValue) {
        hasChanges = true
      }
    })
    this.formHasChanges = hasChanges
  }

  highlightChangedField(field, form) {
    if (!window.auth.currentUser) return
    const name = field.name
    const originalValue = window.auth.currentUser[name] || ""
    const currentValue = field.value || ""

    if (currentValue !== originalValue) {
      field.classList.add("field-changed")
    } else {
      field.classList.remove("field-changed")
    }
  }

  isTrackableForm(form) {
    const trackableForms = [
      "report-form",
      "register-form",
      "login-form",
      "profile-form",
      "contact-form",
      "feedback-form",
    ]
    return trackableForms.includes(form.id)
  }

  setupBeforeUnloadWarning() {
    window.addEventListener("beforeunload", (e) => {
      if (this.formHasChanges && this.isFormActive()) {
        e.preventDefault()
        e.returnValue = window.i18n.get("form.unsaved_changes")
        return window.i18n.get("form.unsaved_changes")
      }
    })
  }

  markChangesSaved() {
    this.formHasChanges = false
  }

  async loadInitialData() {
    try {
      const loadingToast = window.components?.showToast(window.i18n.get("common.loading"), "info", 10000)
      
      this.data.stats = await window.api.getStats()
      this.data.incidencias = await window.api.getIncidencias()
      this.data.filteredIncidencias = [...this.data.incidencias]

      if (window.auth.isLoggedIn) {
        this.data.denuncias = await window.api.getMyDenuncias()
        this.data.notifications = await window.api.getNotifications()
      }

      if (loadingToast) {
        loadingToast.remove()
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
      window.components?.showToast(window.i18n.get("common.error_loading_data"), "error")
    }
  }

  navigateTo(page) {
    this.currentPage = page
    this.updateNavigation()
    this.renderPage()

    // Anunciar cambio de página para accesibilidad
    document.dispatchEvent(
      new CustomEvent("pageChanged", {
        detail: { pageTitle: window.i18n.get(`page.${page}`) },
      })
    )

    // Actualizar traducciones después de renderizar
    setTimeout(() => {
      if (window.i18n) {
        window.i18n.updateTexts()
      }
      if (window.speechManager?.isEnabled) {
        window.speechManager.addSpeechToElements()
        window.speechManager.announcePage(window.i18n.get(`page.${page}`))
      }
    }, 100)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  updateNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn")
    navButtons.forEach((btn) => {
      btn.classList.remove("active")
      btn.removeAttribute("aria-current")
      if (btn.getAttribute("data-page") === this.currentPage) {
        btn.classList.add("active")
        btn.setAttribute("aria-current", "page")
      }
    })
  }

  renderPage() {
    const contentArea = document.getElementById("content-area")
    if (!contentArea) return

    contentArea.innerHTML = ""

    switch (this.currentPage) {
      case "inicio":
        contentArea.innerHTML = this.renderInicio()
        this.setupVideoIfExists()
        break
      case "reportar":
        contentArea.innerHTML = this.renderReportar()
        this.setupReportForm()
        break
      case "mapa":
        contentArea.innerHTML = this.renderMapa()
        this.setupMapFilters()
        this.initializeMap()
        break
      case "denuncias":
        contentArea.innerHTML = this.renderDenuncias()
        break
      case "perfil":
        contentArea.innerHTML = this.renderPerfil()
        this.setupAuthForms()
        break
      case "ayuda":
        contentArea.innerHTML = this.renderAyuda()
        this.setupFAQ()
        this.setupContactForm()
        break
      case "notificaciones":
        contentArea.innerHTML = this.renderNotificaciones()
        break
      case "feedback":
        contentArea.innerHTML = this.renderFeedback()
        this.setupFeedbackForm()
        break
      default:
        contentArea.innerHTML = `<div class="card"><h2 data-i18n="common.page_in_development">Página en desarrollo</h2><p>Esta funcionalidad estará disponible próximamente.</p></div>`
    }

    setTimeout(() => {
      if (window.accessibilityManager) {
        window.accessibilityManager.addSpeechToAllElements()
      }
      if (window.i18n) {
        window.i18n.updateTexts()
      }
    }, 100)
  }

  setupVideoIfExists() {
    const videoContainer = document.getElementById("intro-video-container")
    if (videoContainer && window.components) {
      window.components.createAccessibleVideo(videoContainer, "/videos/video.mp4", {
        transcript: window.i18n.get("video.intro_transcript"),
        captionsUrl: "/captions/video-es.vtt",
        captionsEnUrl: "/captions/video-en.vtt",
      })
    }
  }

  renderInicio() {
    const welcomeSection = !window.auth.isLoggedIn
      ? `
            <div class="card">
                <h2 data-i18n="home.welcome_title">👋 Bienvenido al Sistema de Denuncia Ciudadana</h2>
                <p data-i18n="home.welcome_message">Reporta incidencias en tu ciudad y ayuda a mejorar la calidad de vida de todos los ciudadanos.</p>
                
                <div id="intro-video-container" class="video-container"></div>
                
                <div class="auth-buttons-centered">
                    <button class="btn btn-primary btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.login">🔐 Iniciar Sesión</button>
                    <button class="btn btn-outline btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.register">📝 Registrarse</button>
                </div>
            </div>
        `
      : `
            <div class="card">
                <h2 data-i18n="home.welcome_back">👋 Bienvenido de vuelta, ${window.auth.currentUser?.nombre || 'Usuario'}</h2>
                <p>Gracias por ser parte activa de nuestra comunidad. Tu participación ayuda a mejorar nuestra ciudad.</p>
                <div id="intro-video-container" class="video-container"></div>
            </div>
        `

    const stats = this.data.stats || {
      total: 0,
      enProceso: 0,
      resueltas: 0,
      pendientes: 0,
    }

    return `
            <h1 data-i18n="nav.home">🏠 Inicio</h1>
            ${welcomeSection}
            
            <div class="stats-grid-2x2">
                <div class="stat-card">
                    <h3 data-i18n="stats.total_reported">Total Reportadas</h3>
                    <div class="stat-value">${stats.total}</div>
                    <p>Incidencias registradas</p>
                </div>
                <div class="stat-card">
                    <h3 data-i18n="stats.in_progress">En Proceso</h3>
                    <div class="stat-value orange">${stats.enProceso}</div>
                    <p>Siendo atendidas</p>
                </div>
                <div class="stat-card">
                    <h3 data-i18n="stats.resolved">Resueltas</h3>
                    <div class="stat-value green">${stats.resueltas}</div>
                    <p>Completadas exitosamente</p>
                </div>
                <div class="stat-card">
                    <h3 data-i18n="stats.pending">Pendientes</h3>
                    <div class="stat-value red">${stats.pendientes}</div>
                    <p>Esperando atención</p>
                </div>
            </div>

            <div class="card">
                <h2 data-i18n="home.recent_incidents">📋 Incidencias Recientes</h2>
                <p data-i18n="home.recent_incidents_desc">Últimas incidencias reportadas por los ciudadanos</p>
                <div class="mt-4">
                    ${this.renderIncidenciasList()}
                </div>
            </div>
        `
  }

  renderIncidenciasList() {
    if (!this.data.incidencias || this.data.incidencias.length === 0) {
      return `<p class="text-center">No hay incidencias reportadas aún.</p>`
    }

    return this.data.incidencias
      .slice(0, 5)
      .map((inc) => this.renderIncidenciaItem(inc))
      .join("")
  }

  renderIncidenciaItem(inc) {
    const statusClass = inc.estado?.toLowerCase().replace(" ", "-") || "pendiente"
    const statusText = inc.estado || "Pendiente"
    const userName = inc.usuario_nombre || 'Usuario anónimo'
    
    return `
            <div class="incident-item">
                <div class="flex justify-between items-center mb-4 p-4 border-b">
                    <div style="flex: 1; padding-right: 1rem;">
                        <h4>⚠️ ${inc.titulo || 'Sin título'}</h4>
                        <p><strong data-i18n="report.type">Tipo:</strong> ${inc.tipo || 'No especificado'}</p>
                        <p>📍 ${inc.ubicacion || 'Ubicación no especificada'}</p>
                        <p><strong data-i18n="incident.date">Fecha:</strong> ${inc.fecha || 'No especificada'}</p>
                        <p><strong>Reportado por:</strong> ${userName}</p>
                    </div>
                    <div style="width: 150px; text-align: center;">
                        ${inc.fotos && inc.fotos.length > 0 ? `
                            <div class="incident-photos-right">
                                ${inc.fotos.map((foto, idx) => `<img src="${foto}" alt="Foto de la incidencia" class="incident-photo-right" onclick="app.expandImage('${foto}')">`).join('')}
                            </div>
                        ` : ''}
                        <span class="status-badge status-${statusClass}">${statusText}</span>
                        <p><strong data-i18n="incident.priority">Prioridad:</strong> <span class="priority-${inc.prioridad?.toLowerCase() || 'media'}">${inc.prioridad || 'Media'}</span></p>
                    </div>
                </div>
            </div>
        `
  }

  renderReportar() {
    if (!window.auth.isLoggedIn) {
      return `
                <div class="card text-center">
                    <h2 data-i18n="auth.access_required">🔐 Acceso Requerido</h2>
                    <p data-i18n="report.login_required">Debes iniciar sesión para reportar incidencias.</p>
                    <div class="auth-buttons-centered">
                        <button class="btn btn-primary btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.login">🔐 Iniciar Sesión</button>
                        <button class="btn btn-outline btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.register">📝 Registrarse</button>
                    </div>
                </div>
            `
    }

    return `
            <h1 data-i18n="nav.report">📝 Reportar Incidencia</h1>
            
            <div class="form-container">
                <form id="report-form" class="form-grid">
                    <div class="form-field">
                        <label class="form-label required" data-i18n="report.title">Título del reporte</label>
                        <input type="text" class="form-input autocomplete-input" name="titulo" 
                               data-i18n-placeholder="report.title_placeholder"
                               placeholder="Ej: Bache en la vía principal" 
                               data-source="incidentTypes" required>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="report.type">Tipo de incidencia</label>
                        <select class="form-select" name="tipo" required>
                            <option value="">Selecciona un tipo</option>
                            <option value="Infraestructura" data-i18n="report.type.infrastructure">Infraestructura</option>
                            <option value="Alumbrado" data-i18n="report.type.lighting">Alumbrado</option>
                            <option value="Limpieza" data-i18n="report.type.cleaning">Limpieza</option>
                            <option value="Seguridad" data-i18n="report.type.security">Seguridad</option>
                            <option value="Transporte" data-i18n="report.type.transport">Transporte</option>
                            <option value="Otro" data-i18n="report.type.other">Otro</option>
                        </select>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="report.location">Ubicación</label>
                        <div class="autocomplete-container">
                            <input type="text" class="form-input autocomplete-input" name="ubicacion" 
                                   data-i18n-placeholder="report.location_placeholder"
                                   placeholder="Ej: Av. Malecón y Calle 15" 
                                   data-source="locations" required>
                        </div>
                    </div>
                    
                    <div class="form-field full-width">
                        <label class="form-label required" data-i18n="report.description">Descripción</label>
                        <textarea class="form-textarea" name="descripcion" 
                                  data-i18n-placeholder="report.description_placeholder"
                                  placeholder="Describe detalladamente la incidencia..." 
                                  required rows="4"></textarea>
                    </div>
                    
                    <div class="form-field full-width">
                        <label class="form-label" data-i18n="report.photos">Fotos (opcional)</label>
                        <div class="upload-area" id="upload-area">
                            <input type="file" id="photos" name="photos" multiple accept="image/*" style="display: none;">
                            <p data-i18n="report.drag_photos">📷 Arrastra fotos aquí o haz clic para seleccionar</p>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('photos').click()" data-i18n="report.select_photos">
                                📁 Seleccionar Fotos
                            </button>
                        </div>
                        <div id="photo-preview" class="photo-preview"></div>
                    </div>
                    
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary" data-i18n="report.submit">
                            📤 Enviar Reporte
                        </button>
                        <button type="button" class="btn btn-outline" onclick="app.resetForm('report-form')" data-i18n="common.cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `
  }

  renderMapa() {
    return `
            <h1 data-i18n="nav.map">🗺️ Mapa de Incidencias</h1>
            
            <div class="search-filters">
                <div class="filters-grid">
                    <div class="form-field">
                        <label class="form-label" data-i18n="map.filter_type">Filtrar por tipo</label>
                        <select id="type-filter" class="form-select">
                            <option value="all" data-i18n="map.all_types">Todos los tipos</option>
                            <option value="Infraestructura" data-i18n="report.type.infrastructure">Infraestructura</option>
                            <option value="Alumbrado" data-i18n="report.type.lighting">Alumbrado</option>
                            <option value="Limpieza" data-i18n="report.type.cleaning">Limpieza</option>
                            <option value="Seguridad" data-i18n="report.type.security">Seguridad</option>
                            <option value="Transporte" data-i18n="report.type.transport">Transporte</option>
                        </select>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label" data-i18n="map.filter_status">Filtrar por estado</label>
                        <select id="status-filter" class="form-select">
                            <option value="all" data-i18n="map.all_status">Todos los estados</option>
                            <option value="Pendiente" data-i18n="status.pending">Pendiente</option>
                            <option value="En proceso" data-i18n="status.in_progress">En proceso</option>
                            <option value="Resuelta" data-i18n="status.resolved">Resuelta</option>
                        </select>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label" data-i18n="map.search_zone">Buscar zona</label>
                        <div class="search-input">
                            <input type="text" id="search-input" class="form-input autocomplete-input" 
                                   data-i18n-placeholder="search.placeholder"
                                   placeholder="Buscar por ubicación..."
                                   data-source="locations">
                        </div>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label" data-i18n="map.filter_priority">Filtrar por prioridad</label>
                        <select id="priority-filter" class="form-select">
                            <option value="all" data-i18n="map.all_priorities">Todas las prioridades</option>
                            <option value="Alta" data-i18n="priority.high">Alta</option>
                            <option value="Media" data-i18n="priority.medium">Media</option>
                            <option value="Baja" data-i18n="priority.low">Baja</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="search-results-info">
                <span id="results-info">${this.data.filteredIncidencias.length} <span data-i18n="map.results_found">resultados encontrados</span></span>
            </div>

            <div class="card">
                <div class="text-center mb-4">
                    <h2 data-i18n="map.interactive_title">🗺️ Vista Geográfica</h2>
                    <p data-i18n="map.geographic_view">Visualización de incidencias por zona geográfica</p>
                    <p><em data-i18n="map.integration_note">Mapa interactivo con ubicaciones reales</em></p>
                </div>
                
                <!-- Mapa interactivo -->
                <div id="map-container" class="map-container"></div>
                
                <h3 data-i18n="map.incidents_by_zone">Incidencias por Zona</h3>
                <div id="map-results" class="mt-4">
                    ${this.renderFilteredIncidencias()}
                </div>
            </div>
        `
  }

  initializeMap() {
    setTimeout(() => {
      const mapContainer = document.getElementById('map-container')
      if (!mapContainer) return

      // Inicializar mapa centrado en Manta, Ecuador
      const map = L.map('map-container').setView([-0.9536, -80.7286], 13)

      // Agregar capa de mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Colores por prioridad
      const priorityColors = {
        'Alta': '#ef4444',
        'Media': '#f59e0b',
        'Baja': '#10b981'
      }

      // Agregar marcadores para cada incidencia
      this.data.filteredIncidencias.forEach(incidencia => {
        if (incidencia.latitud && incidencia.longitud) {
          const color = priorityColors[incidencia.prioridad] || '#6b7280'
          
          const marker = L.circleMarker([incidencia.latitud, incidencia.longitud], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 8
          }).addTo(map)

          // Popup con información de la incidencia
          const popupContent = `
            <div class="map-popup">
              <h4>${incidencia.titulo}</h4>
              <p><strong>Tipo:</strong> ${incidencia.tipo}</p>
              <p><strong>Estado:</strong> <span class="status-badge status-${incidencia.estado?.toLowerCase().replace(' ', '-')}">${incidencia.estado}</span></p>
              <p><strong>Prioridad:</strong> <span class="priority-${incidencia.prioridad?.toLowerCase()}">${incidencia.prioridad}</span></p>
              <p><strong>Fecha:</strong> ${incidencia.fecha}</p>
              <p><strong>Ubicación:</strong> ${incidencia.ubicacion}</p>
              ${incidencia.usuario_nombre ? `<p><strong>Reportado por:</strong> ${incidencia.usuario_nombre}</p>` : ''}
            </div>
          `
          
          marker.bindPopup(popupContent)
        }
      })

      // Guardar referencia del mapa
      this.map = map
    }, 100)
  }

  renderFilteredIncidencias() {
    if (this.data.filteredIncidencias.length === 0) {
      return `<p class="text-center" data-i18n="map.no_results">No se encontraron resultados con los filtros aplicados.</p>`
    }

    return this.data.filteredIncidencias.map((inc) => this.renderIncidenciaItem(inc)).join("")
  }

  renderDenuncias() {
    if (!window.auth.isLoggedIn) {
      return `
                <div class="card text-center">
                    <h2 data-i18n="auth.access_required">🔐 Acceso Requerido</h2>
                    <p>Debes iniciar sesión para ver tus denuncias.</p>
                    <div class="auth-buttons-centered">
                        <button class="btn btn-primary btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.login">🔐 Iniciar Sesión</button>
                        <button class="btn btn-outline btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.register">📝 Registrarse</button>
                    </div>
                </div>
            `
    }

    if (!this.data.denuncias || this.data.denuncias.length === 0) {
      return `
        <h1 data-i18n="nav.reports">📋 Mis Denuncias</h1>
        <div class="card text-center">
          <h2 data-i18n="reports.no_reports">📝 No tienes reportes aún</h2>
          <p data-i18n="reports.no_reports_desc">Cuando reportes una incidencia, aparecerá aquí para que puedas hacer seguimiento.</p>
          <button class="btn btn-primary" onclick="app.navigateTo('reportar')" data-i18n="reports.create_first">
            📝 Crear mi primer reporte
          </button>
        </div>
      `
    }

    return `
            <h1 data-i18n="nav.reports">📋 Mis Denuncias</h1>
            
            ${this.data.denuncias
              .map(
                (denuncia) => `
                <div class="card denuncia-card">
                    <div class="flex justify-between items-start mb-4">
                        <div style="flex: 1; padding-right: 1rem;">
                            <h3>#${denuncia.id} - ${denuncia.titulo}</h3>
                            <p><strong data-i18n="report.type">Tipo:</strong> ${denuncia.tipo}</p>
                            <p><strong data-i18n="report.location">Ubicación:</strong> ${denuncia.ubicacion}</p>
                            <p><strong data-i18n="incident.date">Fecha:</strong> ${denuncia.fecha}</p>
                            <p><strong data-i18n="incident.priority">Prioridad:</strong> <span class="priority-${denuncia.prioridad?.toLowerCase()}">${denuncia.prioridad}</span></p>
                        </div>
                        <div style="width: 150px; text-align: center;">
                            ${denuncia.fotos && denuncia.fotos.length > 0 ? `
                                <div class="incident-photos-right">
                                    ${denuncia.fotos.map((foto, idx) => `<img src="${foto}" alt="Foto de la incidencia" class="incident-photo-right" onclick="app.expandImage('${foto}')">`).join('')}
                                </div>
                            ` : ''}
                            <span class="status-badge status-${denuncia.estado?.toLowerCase().replace(" ", "-")}">${denuncia.estado}</span>
                        </div>
                    </div>
                    <p><strong data-i18n="report.description">Descripción:</strong> ${denuncia.descripcion}</p>
                </div>
            `,
              )
              .join("")}
        `
  }

  renderPerfil() {
    if (window.auth.isLoggedIn) {
      if (this.isEditingProfile) {
        return this.renderProfileEditForm()
      } else {
        return this.renderProfileView()
      }
    }

    return this.renderAuthForms()
  }

  renderProfileView() {
    const user = window.auth.currentUser
    if (!user) return this.renderAuthForms()

    return `
      <h1 data-i18n="nav.profile">👤 Mi Perfil</h1>
      
      <div class="form-container">
        <div class="profile-header">
          <h2 data-i18n="profile.personal_info">Información Personal</h2>
          <button class="btn btn-outline" onclick="app.toggleProfileEdit()" data-i18n="profile.edit">
            ✏️ Editar
          </button>
        </div>
        
        <div class="profile-info-grid">
          <div class="profile-field">
            <label class="profile-label" data-i18n="auth.name">Nombre</label>
            <div class="profile-value">${user.nombre || 'No especificado'}</div>
          </div>
          
          <div class="profile-field">
            <label class="profile-label" data-i18n="auth.email">Correo electrónico</label>
            <div class="profile-value">${user.email || 'No especificado'}</div>
          </div>
          
          <div class="profile-field">
            <label class="profile-label" data-i18n="auth.phone">Teléfono</label>
            <div class="profile-value">${user.telefono || window.i18n.get('profile.not_provided')}</div>
          </div>
          
          <div class="profile-field">
            <label class="profile-label" data-i18n="profile.registration_date">Fecha de registro</label>
            <div class="profile-value">${user.fecha_registro || 'No disponible'}</div>
          </div>
          
          <div class="profile-field">
            <label class="profile-label" data-i18n="profile.account_type">Tipo de cuenta</label>
            <div class="profile-value">${user.rol === 'admin' ? window.i18n.get('profile.role.admin') : window.i18n.get('profile.role.user')}</div>
          </div>
        </div>
        
        <div class="profile-stats">
          <h3 data-i18n="profile.activity_summary">Resumen de Actividad</h3>
          <div class="stats-mini-grid">
            <div class="stat-mini">
              <span class="stat-mini-value">${this.data.denuncias?.length || 0}</span>
              <span class="stat-mini-label" data-i18n="profile.total_reports">Reportes Totales</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-value">${this.data.denuncias?.filter((d) => d.estado === "Resuelta").length || 0}</span>
              <span class="stat-mini-label" data-i18n="profile.resolved_reports">Reportes Resueltos</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini-value">${this.data.denuncias?.filter((d) => d.estado === "En proceso").length || 0}</span>
              <span class="stat-mini-label" data-i18n="profile.active_reports">Reportes Activos</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderProfileEditForm() {
    const user = window.auth.currentUser
    if (!user) return this.renderAuthForms()

    return `
      <h1 data-i18n="nav.profile">👤 Mi Perfil</h1>
      
      <div class="form-container">
        <div class="profile-header">
          <h2 data-i18n="profile.edit_info">Editar Información</h2>
          <button class="btn btn-outline" onclick="app.toggleProfileEdit()" data-i18n="common.cancel">
            ❌ Cancelar
          </button>
        </div>
        
        <form id="profile-form" class="form-grid two-columns">
          <div class="form-field">
            <label class="form-label" data-i18n="auth.name">Nombre</label>
            <input type="text" class="form-input" name="nombre" 
                   value="${user.nombre || ''}">
          </div>
          
          <div class="form-field">
            <label class="form-label" data-i18n="auth.email">Correo electrónico</label>
            <input type="email" class="form-input" name="email" 
                   value="${user.email || ''}">
          </div>
          
          <div class="form-field">
            <label class="form-label" data-i18n="auth.phone">Teléfono</label>
            <input type="tel" class="form-input" name="telefono" 
                   value="${user.telefono || ''}">
          </div>
          
          <div class="form-field">
            <label class="form-label" data-i18n="profile.registration_date">Fecha de registro</label>
            <input type="text" class="form-input" 
                   value="${user.fecha_registro || ''}" 
                   readonly>
          </div>

          <div class="form-field">
            <label class="form-label">Nueva contraseña (opcional)</label>
            <div class="password-input-container">
              <input type="password" class="form-input password-input" name="password" placeholder="Dejar en blanco para mantener actual">
              <button type="button" class="password-toggle" onclick="app.togglePasswordVisibility(this)">👁️</button>
            </div>
          </div>
          
          <div class="form-actions full-width">
            <button type="submit" class="btn btn-primary" data-i18n="form.save_changes">
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    `
  }

  togglePasswordVisibility(button) {
    const input = button.previousElementSibling
    if (input.type === 'password') {
      input.type = 'text'
      button.textContent = '🙈'
    } else {
      input.type = 'password'
      button.textContent = '👁️'
    }
  }

  toggleProfileEdit() {
    if (this.formHasChanges) {
      window.components
        .showConfirmation(
          window.i18n.get("common.confirm"),
          "Hay cambios sin guardar. ¿Seguro que quieres salir sin guardar?"
        )
        .then((confirmed) => {
          if (confirmed) {
            this.isEditingProfile = !this.isEditingProfile
            this.formHasChanges = false
            this.renderPage()
          }
        })
    } else {
      this.isEditingProfile = !this.isEditingProfile
      this.renderPage()
    }
  }

  renderAuthForms() {
    return `
    <div class="full-width-content">
      <h1 data-i18n="nav.profile">👤 Mi Perfil</h1>
      
      <div id="auth-container" class="auth-container-full">
        <div class="form-container">
          <div class="auth-content-wrapper">
            <div class="auth-info-section">
              <h2 data-i18n="profile.account_access">Acceso a la Cuenta</h2>
              <p data-i18n="profile.access_description">Inicia sesión o crea una cuenta para acceder a todas las funciones del sistema.</p>
              
              <div class="auth-buttons-centered">
                <button class="btn btn-primary btn-large" onclick="app.showLoginForm()" data-i18n="auth.login">
                  🔐 Iniciar Sesión
                </button>
                <button class="btn btn-outline btn-large" onclick="app.showRegisterForm()" data-i18n="auth.register">
                  📝 Registrarse
                </button>
              </div>
            </div>
            
            <div class="auth-benefits-section">
              <h3 data-i18n="profile.account_benefits">Beneficios de tener cuenta:</h3>
              <div class="benefits-grid">
                <div class="benefit-item">
                  <span class="benefit-icon">✅</span>
                  <span data-i18n="profile.benefit_1">Reportar incidencias</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">✅</span>
                  <span data-i18n="profile.benefit_2">Seguimiento de reportes</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">✅</span>
                  <span data-i18n="profile.benefit_3">Notificaciones de estado</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">✅</span>
                  <span data-i18n="profile.benefit_4">Historial personalizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  }

  showLoginForm() {
    const container = document.getElementById("auth-container")
    if (!container) return

    container.innerHTML = `
            <div class="form-container">
                <h2 data-i18n="auth.login_title">🔐 Iniciar Sesión</h2>
                <div id="login-error" class="form-message form-error" style="display: none;"></div>
                
                <form id="login-form" class="form-grid">
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.email">Correo electrónico</label>
                        <input type="email" class="form-input" name="email" required 
                               data-i18n-placeholder="auth.email_placeholder"
                               placeholder="tu@email.com">
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input password-input" name="password" required
                                   data-i18n-placeholder="auth.password_placeholder"
                                   placeholder="Tu contraseña">
                            <button type="button" class="password-toggle" onclick="app.togglePasswordVisibility(this)">👁️</button>
                        </div>
                    </div>
                    
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary" data-i18n="auth.login">
                            🔐 Iniciar Sesión
                        </button>
                        <button type="button" class="btn btn-outline" onclick="app.navigateTo('perfil')" data-i18n="common.cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
                
                <div class="auth-help">
                    <p class="text-center">
                        <span data-i18n="auth.no_account">¿No tienes cuenta?</span>
                        <button class="btn btn-link" onclick="app.showRegisterForm()" data-i18n="auth.register_here">Regístrate aquí</button>
                    </p>
                    
                    <div class="test-credentials" style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; font-size: 0.875rem;">
                        <strong>Credenciales de prueba:</strong><br>
                        <strong>Usuario:</strong> usuario@test.com / usuario123<br>
                        <strong>Admin:</strong> admin@test.com / admin123
                    </div>
                </div>
            </div>
        `
    this.setupAuthForms()
    // Actualizar traducciones
    setTimeout(() => window.i18n.updateTexts(), 100)
  }

  showRegisterForm() {
    const container = document.getElementById("auth-container")
    if (!container) return

    container.innerHTML = `
            <div class="form-container">
                <h2 data-i18n="auth.register_title">📝 Crear Cuenta</h2>
                <div id="register-error" class="form-message form-error" style="display: none;"></div>
                <div id="register-success" class="form-message form-success" style="display: none;"></div>
                
                <form id="register-form" class="form-grid two-columns">
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.name">Nombre completo</label>
                        <input type="text" class="form-input" name="nombre" required
                               data-i18n-placeholder="auth.name_placeholder"
                               placeholder="Tu nombre completo">
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.email">Correo electrónico</label>
                        <input type="email" class="form-input" name="email" required
                               data-i18n-placeholder="auth.email_placeholder"
                               placeholder="tu@email.com">
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label" data-i18n="auth.phone">Teléfono</label>
                        <input type="tel" class="form-input" name="telefono" 
                               data-i18n-placeholder="auth.phone_placeholder"
                               placeholder="+593 99 123 4567">
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.password">Contraseña</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input password-input" name="password" required
                                   data-i18n-placeholder="auth.password_min_chars"
                                   placeholder="Mínimo 8 caracteres">
                            <button type="button" class="password-toggle" onclick="app.togglePasswordVisibility(this)">👁️</button>
                        </div>
                        <div class="password-strength">
                            <div class="password-strength-bar">
                                <div class="password-strength-fill"></div>
                            </div>
                            <div class="password-strength-text"></div>
                        </div>
                    </div>
                    
                    <div class="form-field">
                        <label class="form-label required" data-i18n="auth.confirm_password">Confirmar contraseña</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input" name="confirmPassword" required
                                   data-i18n-placeholder="auth.confirm_password_placeholder"
                                   placeholder="Confirma tu contraseña">
                            <button type="button" class="password-toggle" onclick="app.togglePasswordVisibility(this)">👁️</button>
                        </div>
                    </div>
                    
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary" data-i18n="auth.register">
                            📝 Registrarse
                        </button>
                        <button type="button" class="btn btn-outline" onclick="app.navigateTo('perfil')" data-i18n="common.cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
                
                <p class="mt-4 text-center">
                    <span data-i18n="auth.have_account">¿Ya tienes cuenta?</span>
                    <button class="btn btn-link" onclick="app.showLoginForm()" data-i18n="auth.login_here">Inicia sesión aquí</button>
                </p>
            </div>
        `
    this.setupAuthForms()
    this.setupPasswordStrength()
    // Actualizar traducciones
    setTimeout(() => window.i18n.updateTexts(), 100)
  }

  setupPasswordStrength() {
    const passwordInput = document.querySelector(".password-input")
    if (passwordInput) {
      passwordInput.addEventListener("input", (e) => {
        this.updatePasswordStrength(e.target.value)
      })
    }
  }

  updatePasswordStrength(password) {
    const strengthBar = document.querySelector(".password-strength-fill")
    const strengthText = document.querySelector(".password-strength-text")

    if (!strengthBar || !strengthText) return

    let strength = 0
    let strengthLabel = ""

    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) {
      strengthBar.className = "password-strength-fill weak"
      strengthText.className = "password-strength-text weak"
      strengthLabel = window.i18n.get("password.weak")
    } else if (strength <= 3) {
      strengthBar.className = "password-strength-text medium"
      strengthText.className = "password-strength-text medium"
      strengthLabel = window.i18n.get("password.medium")
    } else {
      strengthBar.className = "password-strength-text strong"
      strengthText.className = "password-strength-text strong"
      strengthLabel = window.i18n.get("password.strong")
    }

    strengthText.textContent = `${window.i18n.get("password.security")}: ${strengthLabel}`
  }

  setupAuthForms() {
    const loginForm = document.getElementById("login-form")
    const registerForm = document.getElementById("register-form")
    const profileForm = document.getElementById("profile-form")

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        // Control de intentos de login
        const now = Date.now()
        if (this.loginAttempts >= 3 && now - this.lastLoginAttempt < 30000) {
          const remainingTime = Math.ceil((30000 - (now - this.lastLoginAttempt)) / 1000)
          this.showFormError("login-error", `Demasiados intentos. Espera ${remainingTime} segundos.`)
          return
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]')
        const originalText = submitBtn.innerHTML
        submitBtn.innerHTML = `⏳ <span data-i18n="auth.logging_in">Iniciando sesión...</span>`
        submitBtn.disabled = true

        const result = await window.auth.login(formData.get("email"), formData.get("password"))

        submitBtn.innerHTML = originalText
        submitBtn.disabled = false

        if (result.success) {
          this.loginAttempts = 0
          await this.loadInitialData()
          window.components?.showToast(window.i18n.get("auth.welcome_back"), "success")
          this.navigateTo("inicio")
          this.markChangesSaved()
        } else {
          this.loginAttempts++
          this.lastLoginAttempt = now
          this.showFormError("login-error", result.error)
        }
      })
    }

    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        if (formData.get("password") !== formData.get("confirmPassword")) {
          this.showFormError("register-error", window.i18n.get("form.passwords_dont_match"))
          return
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]')
        const originalText = submitBtn.innerHTML
        submitBtn.innerHTML = `⏳ <span data-i18n="auth.registering">Registrando...</span>`
        submitBtn.disabled = true

        const userData = {
          nombre: formData.get("nombre"),
          email: formData.get("email"),
          telefono: formData.get("telefono"),
          password: formData.get("password"),
        }

        const result = await window.auth.register(userData)

        submitBtn.innerHTML = originalText
        submitBtn.disabled = false

        if (result.success) {
          this.showFormSuccess("register-success", window.i18n.get("auth.register_success"))
          this.hideFormError("register-error")
          this.markChangesSaved()
          registerForm.reset()
        } else {
          this.showFormError("register-error", result.error)
          this.hideFormSuccess("register-success")
        }
      })
    }

    if (profileForm) {
      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const nombre = profileForm.querySelector('input[name="nombre"]').value.trim()
        const email = profileForm.querySelector('input[name="email"]').value.trim()

        if (!nombre) {
          window.components?.showToast("El campo Nombre es obligatorio.", "error")
          return
        }
        if (!email) {
          window.components?.showToast("El campo Correo electrónico es obligatorio.", "error")
          return
        }

        const formData = new FormData(e.target)

        const profileData = {
          nombre: formData.get("nombre"),
          email: formData.get("email"),
          telefono: formData.get("telefono"),
          password: formData.get("password"),
        }

        const criticalFieldsChanged =
          formData.get("email") !== window.auth.currentUser.email ||
          (formData.get("password") && formData.get("password").length > 0)

        if (criticalFieldsChanged) {
          const confirmed = await window.components?.showConfirmation(
            "Cambios importantes",
            "Estás cambiando información crítica de tu cuenta. ¿Deseas continuar?"
          )
          if (!confirmed) return
        }

        const hasChanges =
          formData.get("nombre") !== window.auth.currentUser.nombre ||
          formData.get("email") !== window.auth.currentUser.email ||
          formData.get("telefono") !== (window.auth.currentUser.telefono || "") ||
          (formData.get("password") && formData.get("password").length > 0)

        if (!hasChanges) {
          window.components?.showToast(window.i18n.get("form.no_changes_detected"), "info")
          return
        }

        try {
          await window.api.updateProfile(profileData)
          window.components?.showToast(window.i18n.get("form.changes_saved"), "success")
          this.markChangesSaved()

          window.auth.currentUser = { ...window.auth.currentUser, ...profileData }
          window.auth.updateUI()

          this.isEditingProfile = false
          this.renderPage()
        } catch (error) {
          window.components?.showToast("Error al actualizar el perfil", "error")
        }
      })
    }
  }

  setupReportForm() {
    const form = document.getElementById("report-form")
    if (form) {
      // Configurar subida de fotos
      this.setupPhotoUpload()

      form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        const reportData = {
          titulo: formData.get("titulo"),
          tipo: formData.get("tipo"),
          ubicacion: formData.get("ubicacion"),
          descripcion: formData.get("descripcion"),
          fotos: this.selectedPhotos
        }

        try {
          const submitBtn = form.querySelector('button[type="submit"]')
          const originalText = submitBtn.innerHTML
          submitBtn.innerHTML = `⏳ <span data-i18n="report.submitting">Enviando reporte...</span>`
          submitBtn.disabled = true

          await window.api.createIncidencia(reportData)

          submitBtn.innerHTML = originalText
          submitBtn.disabled = false

          window.components?.showToast(window.i18n.get("report.success"), "success")

          form.reset()
          this.selectedPhotos = []
          this.updatePhotoPreview()
          this.markChangesSaved()

          // Actualizar datos
          await this.loadInitialData()

          // Navegar a mis denuncias
          setTimeout(() => {
            this.navigateTo("denuncias")
          }, 1500)
        } catch (error) {
          window.components?.showToast(window.i18n.get("report.error"), "error")
        }
      })
    }
  }

  setupPhotoUpload() {
    const uploadArea = document.getElementById("upload-area")
    const photosInput = document.getElementById("photos")
    const photoPreview = document.getElementById("photo-preview")

    if (!uploadArea || !photosInput || !photoPreview) return

    // Drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("dragover")
    })

    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("dragover")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("dragover")
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      this.handlePhotoSelection(files)
    })

    // Click to select
    uploadArea.addEventListener("click", () => {
      photosInput.click()
    })

    // File input change
    photosInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files)
      this.handlePhotoSelection(files)
    })
  }

  handlePhotoSelection(files) {
    files.forEach(file => {
      if (file.type.startsWith('image/') && this.selectedPhotos.length < 5) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedPhotos.push({
            file: file,
            url: e.target.result,
            name: file.name
          })
          this.updatePhotoPreview()
        }
        reader.readAsDataURL(file)
      }
    })
  }

  updatePhotoPreview() {
    const photoPreview = document.getElementById("photo-preview")
    if (!photoPreview) return

    photoPreview.innerHTML = this.selectedPhotos.map((photo, index) => `
      <div class="photo-preview-item">
        <img src="${photo.url}" alt="${photo.name}">
        <button type="button" class="photo-preview-remove" onclick="app.removePhoto(${index})">×</button>
      </div>
    `).join('')
  }

  removePhoto(index) {
    this.selectedPhotos.splice(index, 1)
    this.updatePhotoPreview()
  }

  setupMapFilters() {
    const typeFilter = document.getElementById("type-filter")
    const statusFilter = document.getElementById("status-filter")
    const priorityFilter = document.getElementById("priority-filter")
    const searchInput = document.getElementById("search-input")

    const applyFilters = async () => {
      const filters = {
        tipo: typeFilter?.value || "all",
        estado: statusFilter?.value || "all",
        prioridad: priorityFilter?.value || "all",
        ubicacion: searchInput?.value || "",
      }

      try {
        this.data.filteredIncidencias = await window.api.getIncidencias(filters)

        // Actualizar resultados
        const resultsInfo = document.getElementById("results-info")
        const mapResults = document.getElementById("map-results")

        if (resultsInfo) {
          resultsInfo.innerHTML = `${this.data.filteredIncidencias.length} <span data-i18n="map.results_found">resultados encontrados</span>`
        }

        if (mapResults) {
          mapResults.innerHTML = this.renderFilteredIncidencias()
        }

        // Actualizar mapa
        if (this.map) {
          this.updateMapMarkers()
        }

        // Actualizar traducciones
        window.i18n.updateTexts()
      } catch (error) {
        console.error("Error applying filters:", error)
      }
    }

    // Agregar event listeners
    if (typeFilter) typeFilter.addEventListener("change", applyFilters)
    if (statusFilter) statusFilter.addEventListener("change", applyFilters)
    if (priorityFilter) priorityFilter.addEventListener("change", applyFilters)
    if (searchInput) {
      searchInput.addEventListener("input", window.components?.debounce(applyFilters, 500))
    }
  }

  updateMapMarkers() {
    if (!this.map) return

    // Limpiar marcadores existentes
    this.map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        this.map.removeLayer(layer)
      }
    })

    // Colores por prioridad
    const priorityColors = {
      'Alta': '#ef4444',
      'Media': '#f59e0b',
      'Baja': '#10b981'
    }

    // Agregar nuevos marcadores
    this.data.filteredIncidencias.forEach(incidencia => {
      if (incidencia.latitud && incidencia.longitud) {
        const color = priorityColors[incidencia.prioridad] || '#6b7280'
        
        const marker = L.circleMarker([incidencia.latitud, incidencia.longitud], {
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          radius: 8
        }).addTo(this.map)

        const popupContent = `
          <div class="map-popup">
            <h4>${incidencia.titulo}</h4>
            <p><strong>Tipo:</strong> ${incidencia.tipo}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-${incidencia.estado?.toLowerCase().replace(' ', '-')}">${incidencia.estado}</span></p>
            <p><strong>Prioridad:</strong> <span class="priority-${incidencia.prioridad?.toLowerCase()}">${incidencia.prioridad}</span></p>
            <p><strong>Fecha:</strong> ${incidencia.fecha}</p>
            <p><strong>Ubicación:</strong> ${incidencia.ubicacion}</p>
            ${incidencia.usuario_nombre ? `<p><strong>Reportado por:</strong> ${incidencia.usuario_nombre}</p>` : ''}
          </div>
        `
        
        marker.bindPopup(popupContent)
      }
    })
  }

  renderAyuda() {
    return `
    <div class="full-width-content">
      <h1 data-i18n="nav.help">❓ Ayuda y FAQ</h1>
      
      <div class="help-content-wrapper">
        <div class="faq-section">
          <div class="faq-container">
            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.report_how.question">¿Cómo puedo reportar una incidencia?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.report_how.answer">Para reportar una incidencia, debes crear una cuenta e iniciar sesión. Luego ve a la sección "Reportar Incidencia", completa el formulario con los detalles y envía tu reporte.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.resolution_time.question">¿Cuánto tiempo toma resolver una incidencia?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.resolution_time.answer">El tiempo de resolución depende del tipo y complejidad de la incidencia. Las incidencias de alta prioridad se atienden en 24-48 horas, mientras que otras pueden tomar de 3 a 15 días hábiles.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.tracking.question">¿Puedo hacer seguimiento a mi reporte?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.tracking.answer">Sí, una vez que inicies sesión puedes ver todos tus reportes en la sección "Mis Denuncias" y recibir notificaciones sobre cambios de estado.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.incident_types.question">¿Qué tipos de incidencias puedo reportar?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.incident_types.answer">Puedes reportar problemas de infraestructura, alumbrado público, limpieza, seguridad, transporte público y otros problemas que afecten a la comunidad.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.account_required.question">¿Necesito una cuenta para usar el sistema?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.account_required.answer">Puedes ver las incidencias públicas sin cuenta, pero necesitas registrarte para reportar nuevas incidencias y hacer seguimiento a tus reportes.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question" onclick="app.toggleFAQ(this)">
                <span data-i18n="faq.data_security.question">¿Mis datos están seguros?</span>
                <span class="faq-icon">▼</span>
              </button>
              <div class="faq-answer">
                <p data-i18n="faq.data_security.answer">Sí, todos los datos se manejan de forma segura y confidencial. Solo se comparte la información necesaria para resolver las incidencias reportadas.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form-container">
          <h2 data-i18n="help.contact_title">💬 Contáctanos</h2>
          <p data-i18n="help.contact_description">¿Tienes alguna pregunta o necesitas ayuda? Envíanos un mensaje.</p>
          
          <form id="contact-form" class="form-grid two-columns">
            <div class="form-field">
              <label class="form-label required" data-i18n="help.contact_name">Nombre</label>
              <input type="text" class="form-input" name="nombre" required>
            </div>
            
            <div class="form-field">
              <label class="form-label required" data-i18n="help.contact_email">Correo electrónico</label>
              <input type="email" class="form-input" name="email" required>
            </div>
            
            <div class="form-field">
              <label class="form-label" data-i18n="help.contact_phone">Teléfono (opcional)</label>
              <input type="tel" class="form-input" name="telefono">
            </div>
            
            <div class="form-field">
              <label class="form-label required" data-i18n="help.contact_subject">Asunto</label>
              <select class="form-select" name="asunto" required>
                <option value="" data-i18n="help.select_subject">Selecciona un asunto</option>
                <option value="Problema técnico" data-i18n="help.subject.technical">Problema técnico</option>
                <option value="Consulta general" data-i18n="help.subject.general">Consulta general</option>
                <option value="Sugerencia" data-i18n="help.subject.suggestion">Sugerencia</option>
                <option value="Reclamo" data-i18n="help.subject.complaint">Reclamo</option>
                <option value="Otro" data-i18n="help.subject.other">Otro</option>
              </select>
            </div>
            
            <div class="form-field full-width">
              <label class="form-label required" data-i18n="help.contact_message">Mensaje</label>
              <textarea class="form-textarea" name="mensaje" rows="5" required
                        data-i18n-placeholder="help.contact_message_placeholder"
                        placeholder="Describe tu consulta o problema..."></textarea>
            </div>
            
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-primary" data-i18n="help.contact_send">
                📤 Enviar Mensaje
              </button>
              <button type="button" class="btn btn-outline" onclick="app.resetForm('contact-form')" data-i18n="help.contact_clear">
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
  }

  setupFAQ() {
    // Los event listeners se configuran directamente en el HTML con onclick
  }

  toggleFAQ(button) {
    const answer = button.nextElementSibling
    const icon = button.querySelector(".faq-icon")
    const isActive = button.classList.contains("active")

    // Cerrar todas las otras FAQ
    document.querySelectorAll(".faq-question.active").forEach((activeBtn) => {
      if (activeBtn !== button) {
        activeBtn.classList.remove("active")
        activeBtn.nextElementSibling.classList.remove("active")
        activeBtn.querySelector(".faq-icon").textContent = "▼"
      }
    })

    // Toggle la FAQ actual
    if (isActive) {
      button.classList.remove("active")
      answer.classList.remove("active")
      icon.textContent = "▼"
    } else {
      button.classList.add("active")
      answer.classList.add("active")
      icon.textContent = "▲"
    }
  }

  setupContactForm() {
    const form = document.getElementById("contact-form")
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        const contactData = {
          nombre: formData.get("nombre"),
          email: formData.get("email"),
          telefono: formData.get("telefono"),
          asunto: formData.get("asunto"),
          mensaje: formData.get("mensaje"),
        }

        try {
          const submitBtn = form.querySelector('button[type="submit"]')
          const originalText = submitBtn.innerHTML
          submitBtn.innerHTML = `⏳ Enviando...`
          submitBtn.disabled = true

          await window.api.sendContactMessage(contactData)
          
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
          
          window.components?.showToast(window.i18n.get("help.message_sent"), "success")
          form.reset()
          this.markChangesSaved()
        } catch (error) {
          window.components?.showToast(window.i18n.get("help.message_error"), "error")
        }
      })
    }
  }

  renderNotificaciones() {
    if (!window.auth.isLoggedIn) {
      return `
                <div class="card text-center">
                    <h2 data-i18n="auth.access_required">🔐 Acceso Requerido</h2>
                    <p>Debes iniciar sesión para ver tus notificaciones.</p>
                    <div class="auth-buttons-centered">
                        <button class="btn btn-primary btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.login">🔐 Iniciar Sesión</button>
                        <button class="btn btn-outline btn-large" onclick="app.navigateTo('perfil')" data-i18n="auth.register">📝 Registrarse</button>
                    </div>
                </div>
            `
    }

    if (!this.data.notifications || this.data.notifications.length === 0) {
      return `
        <h1 data-i18n="nav.notifications">🔔 Notificaciones</h1>
        <div class="card text-center">
          <h2>📭 No tienes notificaciones</h2>
          <p>Cuando haya actualizaciones sobre tus reportes, aparecerán aquí.</p>
        </div>
      `
    }

    return `
            <h1 data-i18n="nav.notifications">🔔 Notificaciones</h1>
            
            ${this.data.notifications
              .map(
                (notif) => `
                <div class="card notification-item ${notif.leida ? "" : "border-l-4 border-blue-500"}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3>${notif.leida ? "📧" : "🔔"} ${notif.titulo}</h3>
                            <p>${notif.mensaje}</p>
                            <small>${notif.fecha}</small>
                        </div>
                        ${
                          !notif.leida
                            ? `
                            <button class="btn btn-outline" onclick="app.markAsRead('${notif.id}')" data-i18n="notification.mark_read">
                                Marcar como leída
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            `,
              )
              .join("")}
        `
  }

  renderFeedback() {
    return `
            <h1 data-i18n="nav.feedback">💬 Feedback</h1>
            
            <div class="form-container">
                <p data-i18n="feedback.description">Tu opinión es importante para nosotros. Comparte tus comentarios sobre el sistema.</p>
                
                <form id="feedback-form" class="form-grid">
                    <div class="form-field">
                        <label class="form-label required" data-i18n="feedback.type">Tipo de feedback</label>
                        <select class="form-select" name="tipo" required>
                            <option value="">Selecciona un tipo</option>
                            <option value="Sugerencia" data-i18n="feedback.type.suggestion">Sugerencia</option>
                            <option value="Problema" data-i18n="feedback.type.problem">Problema</option>
                            <option value="Felicitación" data-i18n="feedback.type.compliment">Felicitación</option>
                            <option value="Otro" data-i18n="feedback.type.other">Otro</option>
                        </select>
                    </div>
                    
                    <div class="form-field full-width">
                        <label class="form-label required" data-i18n="feedback.message">Mensaje</label>
                        <textarea class="form-textarea" name="mensaje" rows="5" required
                                  data-i18n-placeholder="feedback.message_placeholder"
                                  placeholder="Comparte tu experiencia, sugerencias o reporta problemas..."></textarea>
                    </div>
                    
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary" data-i18n="feedback.send">
                            📤 Enviar Feedback
                        </button>
                        <button type="button" class="btn btn-outline" onclick="app.resetForm('feedback-form')" data-i18n="common.cancel">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `
  }

  setupFeedbackForm() {
    const form = document.getElementById("feedback-form")
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        const feedbackData = {
          tipo: formData.get("tipo"),
          mensaje: formData.get("mensaje"),
        }

        try {
          const submitBtn = form.querySelector('button[type="submit"]')
          const originalText = submitBtn.innerHTML
          submitBtn.innerHTML = `⏳ Enviando...`
          submitBtn.disabled = true

          await window.api.sendFeedback(feedbackData)
          
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
          
          window.components?.showToast(window.i18n.get("feedback.success"), "success")
          form.reset()
          this.markChangesSaved()
        } catch (error) {
          window.components?.showToast(window.i18n.get("feedback.error"), "error")
        }
      })
    }
  }

  async markAsRead(notificationId) {
    try {
      await window.api.markNotificationAsRead(notificationId)

      // Actualizar localmente
      const notification = this.data.notifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.leida = true
      }

      this.renderPage()
      window.components?.showToast(window.i18n.get("notification.marked_read"), "success")
    } catch (error) {
      window.components?.showToast(window.i18n.get("notification.mark_error"), "error")
    }
  }

  resetForm(formId) {
    const form = document.getElementById(formId)
    if (form) {
      if (this.formHasChanges) {
        window.components
          ?.showConfirmation(window.i18n.get("form.reset_form_title"), window.i18n.get("form.reset_form_message"))
          .then((confirmed) => {
            if (confirmed) {
              form.reset()
              this.selectedPhotos = []
              this.updatePhotoPreview()
              this.markChangesSaved()
            }
          })
      } else {
        form.reset()
        this.selectedPhotos = []
        this.updatePhotoPreview()
      }
    }
  }

  showFormError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    if (errorElement) {
      errorElement.textContent = message
      errorElement.style.display = "block"
    }
  }

  hideFormError(elementId) {
    const errorElement = document.getElementById(elementId)
    if (errorElement) {
      errorElement.style.display = "none"
    }
  }

  showFormSuccess(elementId, message) {
    const successElement = document.getElementById(elementId)
    if (successElement) {
      successElement.textContent = message
      successElement.style.display = "block"
    }
  }

  hideFormSuccess(elementId) {
    const successElement = document.getElementById(elementId)
    if (successElement) {
      successElement.style.display = "none"
    }
  }
  expandImage(url) {
    // Crear overlay modal para imagen expandida
    let overlay = document.getElementById("image-overlay")
    if (!overlay) {
      overlay = document.createElement("div")
      overlay.id = "image-overlay"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.width = "100vw"
      overlay.style.height = "100vh"
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
      overlay.style.display = "flex"
      overlay.style.justifyContent = "center"
      overlay.style.alignItems = "center"
      overlay.style.zIndex = "10000"
      overlay.style.cursor = "pointer"
      overlay.addEventListener("click", () => {
        overlay.style.display = "none"
      })
      document.body.appendChild(overlay)
    }

    overlay.innerHTML = `
      <img src="${url}" alt="Imagen ampliada" style="max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 0 10px #000;">
      <button id="close-overlay" style="position: absolute; top: 20px; right: 20px; background: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 20px; cursor: pointer;">×</button>
    `

    const closeBtn = document.getElementById("close-overlay")
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      overlay.style.display = "none"
    })

    overlay.style.display = "flex"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new App()
})
