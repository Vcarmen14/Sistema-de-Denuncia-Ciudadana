// Sistema de accesibilidad completo y mejorado
class AccessibilityManager {
  constructor() {
    this.settings = {
      monoMode: false,
      highContrast: false,
      colorTheme: "default",
      fontSize: "normal",
      lineHeight: "normal",
      dyslexiaFont: false,
      zoom: 100,
      speech: false,
      visualAlerts: false,
      pauseAnimations: false,
      audioDescription: false,
    }
    this.speechSynthesis = window.speechSynthesis
    this.currentUtterance = null
    this.zoomStep = 10
    this.minZoom = 50
    this.maxZoom = 200
    this.init()
  }

  init() {
    this.loadSettings()
    this.createAccessibilityMenu()
    this.setupEventListeners()
    this.applySettings()
    this.addSpeechToAllElements()
  }

  loadSettings() {
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      } catch (error) {
        console.error("Error loading accessibility settings:", error)
      }
    }
  }

  saveSettings() {
    localStorage.setItem("accessibility-settings", JSON.stringify(this.settings))
  }

  createAccessibilityMenu() {
    const existingMenu = document.getElementById("accessibility-menu")
    if (existingMenu) {
      existingMenu.remove()
    }

    const menu = document.createElement("div")
    menu.id = "accessibility-menu"
    menu.className = "accessibility-menu"
    menu.innerHTML = `
      <div class="accessibility-menu-content">
        <div class="accessibility-menu-header">
          <h3>♿ <span data-i18n="accessibility.options">Opciones de Accesibilidad</span></h3>
          <button class="close-accessibility-menu" aria-label="Cerrar menú">×</button>
        </div>
        <div class="accessibility-menu-body">
          <!-- Modo monocromático -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">⚫</span>
              <span class="option-label" data-i18n="accessibility.mono_mode">Modo monocromático</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="mono-mode-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Alto contraste -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">🌓</span>
              <span class="option-label" data-i18n="accessibility.high_contrast">Modo alto contraste</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="high-contrast-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Tema de color -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">🎨</span>
              <span class="option-label" data-i18n="accessibility.color_theme">Tema de color</span>
            </div>
            <select id="color-theme-select" class="accessibility-select">
              <option value="default" data-i18n="theme.default">Por defecto</option>
              <option value="blue" data-i18n="theme.blue">Azul</option>
              <option value="green" data-i18n="theme.green">Verde</option>
              <option value="orange" data-i18n="theme.orange">Naranja</option>
            </select>
          </div>

          <!-- Tamaño de fuente -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">🔤</span>
              <span class="option-label" data-i18n="accessibility.font_size">Tamaño de Fuente</span>
            </div>
            <select id="font-size-select" class="accessibility-select">
              <option value="small" data-i18n="size.small">Pequeño</option>
              <option value="normal" data-i18n="size.normal">Normal</option>
              <option value="large" data-i18n="size.large">Grande</option>
            </select>
          </div>

          <!-- Interlineado -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">📏</span>
              <span class="option-label" data-i18n="accessibility.line_height">Interlineado</span>
            </div>
            <select id="line-height-select" class="accessibility-select">
              <option value="normal" data-i18n="spacing.normal">Normal</option>
              <option value="medium" data-i18n="spacing.medium">Medio</option>
              <option value="wide" data-i18n="spacing.wide">Amplio</option>
            </select>
          </div>

          <!-- Tipografía para dislexia -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">📖</span>
              <span class="option-label" data-i18n="accessibility.dyslexia_font">Tipografía Dislexia-Friendly</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="dyslexia-font-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Zoom -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">🔍</span>
              <span class="option-label" data-i18n="accessibility.zoom">Zoom de la página</span>
            </div>
            <div class="zoom-controls">
              <button class="zoom-btn" id="zoom-out-btn" title="Disminuir zoom">-</button>
              <span class="zoom-level" id="zoom-level">100%</span>
              <button class="zoom-btn" id="zoom-in-btn" title="Aumentar zoom">+</button>
            </div>
          </div>

          <!-- Lectura por voz -->
          <div class="accessibility-option">
            <div class="option-info">
              <span class="option-icon">🔊</span>
              <span class="option-label" data-i18n="accessibility.speech">Lectura por Voz</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="speech-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Opciones de usabilidad adicionales -->
          <nav aria-label="Menú de usabilidad" class="usability-menu">
            <ul>
              <li>
                <button id="visual-alerts-btn" class="usability-btn" role="switch" aria-pressed="false">
                  <div class="usability-btn-info">
                    <span class="usability-btn-icon">⚡</span>
                    <span class="usability-btn-label" data-i18n="accessibility.visual_alerts">Alertas visuales</span>
                  </div>
                  <label class="usability-btn-toggle">
                    <input type="checkbox">
                    <span class="usability-btn-slider"></span>
                  </label>
                </button>
              </li>
              <li>
                <button id="pause-animations-btn" class="usability-btn" role="switch" aria-pressed="false">
                  <div class="usability-btn-info">
                    <span class="usability-btn-icon">🛑</span>
                    <span class="usability-btn-label" data-i18n="accessibility.pause_animations">Pausar animaciones</span>
                  </div>
                  <label class="usability-btn-toggle">
                    <input type="checkbox">
                    <span class="usability-btn-slider"></span>
                  </label>
                </button>
              </li>
              <li>
                <button id="audio-description-btn" class="usability-btn" role="switch" aria-pressed="false">
                  <div class="usability-btn-info">
                    <span class="usability-btn-icon">🎧</span>
                    <span class="usability-btn-label" data-i18n="accessibility.audio_description">Descripción de audio</span>
                  </div>
                  <label class="usability-btn-toggle">
                    <input type="checkbox">
                    <span class="usability-btn-slider"></span>
                  </label>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    `

    document.body.appendChild(menu)
  }

  setupEventListeners() {
    // Botón de accesibilidad
    const accessibilityBtn = document.getElementById("accessibility-btn")
    if (accessibilityBtn) {
      accessibilityBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleAccessibilityMenu()
      })
    }

    // Cerrar menú
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("accessibility-menu")
      const btn = document.getElementById("accessibility-btn")

      if (menu && !menu.contains(e.target) && !btn?.contains(e.target)) {
        this.hideAccessibilityMenu()
      }
    })

    // Botón cerrar menú
    const closeMenuBtn = document.querySelector(".close-accessibility-menu")
    if (closeMenuBtn) {
      closeMenuBtn.addEventListener("click", () => {
        this.hideAccessibilityMenu()
      })
    }

    // Controles del menú
    this.setupMenuControls()

    // Escape para cerrar modales
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideAccessibilityMenu()
      }
    })
  }

  setupMenuControls() {
    // Modo monocromático
    const monoToggle = document.getElementById("mono-mode-toggle")
    if (monoToggle) {
      monoToggle.checked = this.settings.monoMode
      monoToggle.addEventListener("change", (e) => {
        this.toggleMonoMode(e.target.checked)
      })
    }

    // Alto contraste
    const contrastToggle = document.getElementById("high-contrast-toggle")
    if (contrastToggle) {
      contrastToggle.checked = this.settings.highContrast
      contrastToggle.addEventListener("change", (e) => {
        this.toggleHighContrast(e.target.checked)
      })
    }

    // Tema de color
    const themeSelect = document.getElementById("color-theme-select")
    if (themeSelect) {
      themeSelect.value = this.settings.colorTheme
      themeSelect.addEventListener("change", (e) => {
        this.setColorTheme(e.target.value)
      })
    }

    // Tamaño de fuente
    const fontSizeSelect = document.getElementById("font-size-select")
    if (fontSizeSelect) {
      fontSizeSelect.value = this.settings.fontSize
      fontSizeSelect.addEventListener("change", (e) => {
        this.setFontSize(e.target.value)
      })
    }

    // Interlineado
    const lineHeightSelect = document.getElementById("line-height-select")
    if (lineHeightSelect) {
      lineHeightSelect.value = this.settings.lineHeight
      lineHeightSelect.addEventListener("change", (e) => {
        this.setLineHeight(e.target.value)
      })
    }

    // Tipografía para dislexia
    const dyslexiaToggle = document.getElementById("dyslexia-font-toggle")
    if (dyslexiaToggle) {
      dyslexiaToggle.checked = this.settings.dyslexiaFont
      dyslexiaToggle.addEventListener("change", (e) => {
        this.toggleDyslexiaFont(e.target.checked)
      })
    }

    // Controles de zoom
    const zoomInBtn = document.getElementById("zoom-in-btn")
    const zoomOutBtn = document.getElementById("zoom-out-btn")
    const zoomLevel = document.getElementById("zoom-level")

    if (zoomLevel) {
      zoomLevel.textContent = `${this.settings.zoom}%`
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        this.zoomIn()
      })
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        this.zoomOut()
      })
    }

    // Lectura por voz
    const speechToggle = document.getElementById("speech-toggle")
    if (speechToggle) {
      speechToggle.checked = this.settings.speech
      speechToggle.addEventListener("change", (e) => {
        this.toggleSpeech(e.target.checked)
      })
    }

    // Alertas visuales
    const visualAlertsBtn = document.getElementById("visual-alerts-btn")
    if (visualAlertsBtn) {
      const toggle = visualAlertsBtn.querySelector('input[type="checkbox"]')
      toggle.checked = this.settings.visualAlerts
      visualAlertsBtn.setAttribute("aria-pressed", this.settings.visualAlerts.toString())
      
      visualAlertsBtn.addEventListener("click", () => {
        this.toggleVisualAlerts()
      })
    }

    // Pausar animaciones
    const pauseBtn = document.getElementById("pause-animations-btn")
    if (pauseBtn) {
      const toggle = pauseBtn.querySelector('input[type="checkbox"]')
      toggle.checked = this.settings.pauseAnimations
      pauseBtn.setAttribute("aria-pressed", this.settings.pauseAnimations.toString())
      
      pauseBtn.addEventListener("click", () => {
        this.togglePauseAnimations()
      })
    }

    // Descripción de audio
    const audioDescBtn = document.getElementById("audio-description-btn")
    if (audioDescBtn) {
      const toggle = audioDescBtn.querySelector('input[type="checkbox"]')
      toggle.checked = this.settings.audioDescription
      audioDescBtn.setAttribute("aria-pressed", this.settings.audioDescription.toString())
      
      audioDescBtn.addEventListener("click", () => {
        this.toggleAudioDescription()
      })
    }
  }

  toggleAccessibilityMenu() {
    const menu = document.getElementById("accessibility-menu")
    const btn = document.getElementById("accessibility-btn")

    if (!menu || !btn) return

    const isVisible = menu.classList.contains("show")

    if (isVisible) {
      this.hideAccessibilityMenu()
    } else {
      this.showAccessibilityMenu()
    }
  }

  showAccessibilityMenu() {
    const menu = document.getElementById("accessibility-menu")
    const btn = document.getElementById("accessibility-btn")

    if (!menu || !btn) return

    // Calcular posición
    const btnRect = btn.getBoundingClientRect()
    const menuWidth = 400
    const menuHeight = 600

    let left = btnRect.left
    let top = btnRect.bottom + 10

    // Ajustar si se sale de la pantalla por la derecha
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 20
    }

    // Ajustar si se sale de la pantalla por la izquierda
    if (left < 20) {
      left = 20
    }

    // Ajustar si se sale de la pantalla por abajo
    if (top + menuHeight > window.innerHeight) {
      top = btnRect.top - menuHeight - 10
    }

    // Aplicar posición
    menu.style.left = `${left}px`
    menu.style.top = `${top}px`
    menu.style.width = `${menuWidth}px`

    menu.classList.add("show")

    // Actualizar traducciones
    if (window.i18n) {
      window.i18n.updateTexts()
    }

    // Focus en el primer elemento
    const firstFocusable = menu.querySelector('button, input, select')
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100)
    }
  }

  hideAccessibilityMenu() {
    const menu = document.getElementById("accessibility-menu")
    if (menu) {
      menu.classList.remove("show")
    }
  }

  // Funciones de accesibilidad
  toggleMonoMode(enabled) {
    this.settings.monoMode = enabled
    this.saveSettings()
    this.applyMonoMode()
    this.showNotification(
      enabled ? "Modo monocromático activado" : "Modo monocromático desactivado"
    )
    this.speak(enabled ? "Modo monocromático activado" : "Modo monocromático desactivado")
  }

  toggleHighContrast(enabled) {
    this.settings.highContrast = enabled
    this.saveSettings()
    this.applyHighContrast()
    this.showNotification(
      enabled ? "Alto contraste activado" : "Alto contraste desactivado"
    )
    this.speak(enabled ? "Alto contraste activado" : "Alto contraste desactivado")
  }

  setColorTheme(theme) {
    this.settings.colorTheme = theme
    this.saveSettings()
    this.applyColorTheme()
    this.showNotification("Tema de color cambiado")
    this.speak("Tema de color cambiado")
  }

  setFontSize(size) {
    this.settings.fontSize = size
    this.saveSettings()
    this.applyFontSize()
    this.showNotification("Tamaño de fuente cambiado")
    this.speak("Tamaño de fuente cambiado")
  }

  setLineHeight(height) {
    this.settings.lineHeight = height
    this.saveSettings()
    this.applyLineHeight()
    this.showNotification("Interlineado cambiado")
    this.speak("Interlineado cambiado")
  }

  toggleDyslexiaFont(enabled) {
    this.settings.dyslexiaFont = enabled
    this.saveSettings()
    this.applyDyslexiaFont()
    this.showNotification(
      enabled ? "Tipografía para dislexia activada" : "Tipografía para dislexia desactivada"
    )
    this.speak(enabled ? "Tipografía para dislexia activada" : "Tipografía para dislexia desactivada")
  }

  zoomIn() {
    if (this.settings.zoom < this.maxZoom) {
      this.settings.zoom += this.zoomStep
      this.saveSettings()
      this.applyZoom()
      this.updateZoomDisplay()
      this.showNotification("Zoom aumentado")
      this.speak("Zoom aumentado")
    }
  }

  zoomOut() {
    if (this.settings.zoom > this.minZoom) {
      this.settings.zoom -= this.zoomStep
      this.saveSettings()
      this.applyZoom()
      this.updateZoomDisplay()
      this.showNotification("Zoom disminuido")
      this.speak("Zoom disminuido")
    }
  }

  toggleSpeech(enabled) {
    this.settings.speech = enabled
    this.saveSettings()
    
    if (enabled) {
      window.speechManager?.enable()
      this.speak("Lectura por voz activada")
    } else {
      window.speechManager?.disable()
    }
    
    this.showNotification(
      enabled ? "Lectura por voz activada" : "Lectura por voz desactivada"
    )
  }

  toggleVisualAlerts() {
    this.settings.visualAlerts = !this.settings.visualAlerts
    this.saveSettings()
    
    const btn = document.getElementById("visual-alerts-btn")
    const toggle = btn?.querySelector('input[type="checkbox"]')
    
    if (btn) {
      btn.setAttribute("aria-pressed", this.settings.visualAlerts.toString())
    }
    if (toggle) {
      toggle.checked = this.settings.visualAlerts
    }
    
    this.showNotification(
      this.settings.visualAlerts ? "Alertas visuales activadas" : "Alertas visuales desactivadas"
    )
    this.speak(this.settings.visualAlerts ? "Alertas visuales activadas" : "Alertas visuales desactivadas")
  }

  togglePauseAnimations() {
    this.settings.pauseAnimations = !this.settings.pauseAnimations
    this.saveSettings()
    this.applyPauseAnimations()
    
    const btn = document.getElementById("pause-animations-btn")
    const toggle = btn?.querySelector('input[type="checkbox"]')
    
    if (btn) {
      btn.setAttribute("aria-pressed", this.settings.pauseAnimations.toString())
    }
    if (toggle) {
      toggle.checked = this.settings.pauseAnimations
    }
    
    this.showNotification(
      this.settings.pauseAnimations ? "Animaciones pausadas" : "Animaciones reanudadas"
    )
    this.speak(this.settings.pauseAnimations ? "Animaciones pausadas" : "Animaciones reanudadas")
  }

  toggleAudioDescription() {
    this.settings.audioDescription = !this.settings.audioDescription
    this.saveSettings()
    
    const btn = document.getElementById("audio-description-btn")
    const toggle = btn?.querySelector('input[type="checkbox"]')
    
    if (btn) {
      btn.setAttribute("aria-pressed", this.settings.audioDescription.toString())
    }
    if (toggle) {
      toggle.checked = this.settings.audioDescription
    }
    
    // Implementar descripción de audio para videos e imágenes
    if (this.settings.audioDescription) {
      this.enableAudioDescription()
    } else {
      this.disableAudioDescription()
    }
    
    this.showNotification(
      this.settings.audioDescription ? "Descripción de audio activada" : "Descripción de audio desactivada"
    )
    this.speak(this.settings.audioDescription ? "Descripción de audio activada" : "Descripción de audio desactivada")
  }

  enableAudioDescription() {
    // Agregar descripciones de audio a imágenes
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('data-audio-described')) {
        img.addEventListener('focus', () => {
          const description = img.alt || img.title || 'Imagen sin descripción'
          this.speak(`Imagen: ${description}`)
        })
        img.setAttribute('data-audio-described', 'true')
      }
    })

    // Agregar descripciones a videos
    document.querySelectorAll('video').forEach(video => {
      if (!video.hasAttribute('data-audio-described')) {
        video.addEventListener('play', () => {
          this.speak('Video iniciado')
        })
        video.addEventListener('pause', () => {
          this.speak('Video pausado')
        })
        video.addEventListener('ended', () => {
          this.speak('Video finalizado')
        })
        video.setAttribute('data-audio-described', 'true')
      }
    })
  }

  disableAudioDescription() {
    // Remover marcadores de descripción de audio
    document.querySelectorAll('[data-audio-described]').forEach(element => {
      element.removeAttribute('data-audio-described')
    })
  }

  // Aplicar configuraciones
  applySettings() {
    this.applyMonoMode()
    this.applyHighContrast()
    this.applyColorTheme()
    this.applyFontSize()
    this.applyLineHeight()
    this.applyDyslexiaFont()
    this.applyZoom()
    this.applyPauseAnimations()
    this.updateZoomDisplay()
  }

  applyMonoMode() {
    document.documentElement.classList.toggle("mono-mode", this.settings.monoMode)
  }

  applyHighContrast() {
    document.documentElement.classList.toggle("high-contrast", this.settings.highContrast)
  }

  applyColorTheme() {
    // Remover temas anteriores
    document.documentElement.removeAttribute("data-theme")

    // Aplicar nuevo tema
    if (this.settings.colorTheme !== "default") {
      document.documentElement.setAttribute("data-theme", this.settings.colorTheme)
    }
  }

  applyFontSize() {
    document.documentElement.classList.remove("font-small", "font-normal", "font-large")
    document.documentElement.classList.add(`font-${this.settings.fontSize}`)
  }

  applyLineHeight() {
    document.documentElement.classList.remove("line-height-normal", "line-height-medium", "line-height-wide")
    document.documentElement.classList.add(`line-height-${this.settings.lineHeight}`)
  }

  applyDyslexiaFont() {
    document.documentElement.classList.toggle("dyslexia-font", this.settings.dyslexiaFont)
  }

  applyZoom() {
    // Solo aplicar zoom al contenido, no a los menús
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.style.transform = `scale(${this.settings.zoom / 100})`
      contentArea.style.transformOrigin = 'top left'
    }
  }

  applyPauseAnimations() {
    document.documentElement.classList.toggle("pause-animations", this.settings.pauseAnimations)
  }

  updateZoomDisplay() {
    const zoomLevel = document.getElementById("zoom-level")
    if (zoomLevel) {
      zoomLevel.textContent = `${this.settings.zoom}%`
    }
  }

  // Sistema de voz mejorado
  speak(text) {
    if (this.settings.speech && window.speechManager) {
      window.speechManager.speak(text)
    }
  }

  addSpeechToAllElements() {
    if (this.settings.speech && window.speechManager) {
      window.speechManager.addSpeechToElements()
    }
  }

  showNotification(message, type = "info") {
    if (window.components) {
      window.components.showToast(message, type, 2000)
    }

    // Mostrar alerta visual si está habilitada
    if (this.settings.visualAlerts) {
      this.showVisualAlert()
    }
  }

  showVisualAlert() {
    const alert = document.createElement("div")
    alert.className = "visual-alert"
    document.body.appendChild(alert)

    setTimeout(() => {
      alert.remove()
    }, 300)
  }
}

// Inicializar sistema de accesibilidad
window.accessibilityManager = new AccessibilityManager()
