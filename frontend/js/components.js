// Componentes UI mejorados
class ComponentsManager {
  constructor() {
    this.toastContainer = null
    this.init()
  }

  init() {
    this.createToastContainer()
  }

  createToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div')
      this.toastContainer.id = 'toast-container'
      this.toastContainer.className = 'toast-container'
      document.body.appendChild(this.toastContainer)
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    this.toastContainer.appendChild(toast)

    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10)

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('hide')
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
        }, 300)
      }, duration)
    }

    // Anunciar para accesibilidad
    if (window.speechManager?.isEnabled) {
      window.speechManager.announceNotification(message, type)
    }

    return toast
  }

  async showConfirmation(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.className = 'modal'
      modal.style.display = 'flex'
      
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>${title}</h2>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <div class="modal-actions">
              <button class="btn btn-primary confirm-btn">${confirmText}</button>
              <button class="btn btn-outline cancel-btn">${cancelText}</button>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(modal)

      const confirmBtn = modal.querySelector('.confirm-btn')
      const cancelBtn = modal.querySelector('.cancel-btn')

      const cleanup = () => {
        modal.remove()
      }

      confirmBtn.addEventListener('click', () => {
        cleanup()
        resolve(true)
      })

      cancelBtn.addEventListener('click', () => {
        cleanup()
        resolve(false)
      })

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup()
          resolve(false)
        }
      })

      // Focus en el botón de cancelar por defecto
      setTimeout(() => cancelBtn.focus(), 100)
    })
  }

  createAccessibleVideo(container, videoSrc, options = {}) {
    const videoId = `video-${Date.now()}`
    const transcriptId = `transcript-${Date.now()}`
    
    container.innerHTML = `
      <div class="video-player-container">
        <video id="${videoId}" class="video-player" controls preload="metadata">
          <source src="${videoSrc}" type="video/mp4">
          ${options.captionsUrl ? `<track kind="captions" src="${options.captionsUrl}" srclang="es" label="Español" default>` : ''}
          ${options.captionsEnUrl ? `<track kind="captions" src="${options.captionsEnUrl}" srclang="en" label="English">` : ''}
          <p>Tu navegador no soporta el elemento video.</p>
        </video>
        
        <div class="video-controls-extended">
          <button id="toggle-captions-${videoId}" class="btn btn-outline btn-small">
            <span data-i18n="video.show_captions">Mostrar subtítulos</span>
          </button>
          <button id="toggle-transcript-${videoId}" class="btn btn-outline btn-small">
            <span data-i18n="video.show_transcript">Mostrar transcripción</span>
          </button>
          <button id="download-transcript-${videoId}" class="btn btn-outline btn-small">
            <span data-i18n="video.download_transcript">Descargar transcripción</span>
          </button>
        </div>
        
        <div id="${transcriptId}" class="video-transcript" style="display: none;">
          <h4 data-i18n="video.transcript_title">Transcripción del video</h4>
          <div class="transcript-content">
            ${options.transcript || 'Transcripción no disponible.'}
          </div>
        </div>
      </div>
    `

    // Configurar controles
    this.setupVideoControls(videoId, transcriptId, options)
  }

  setupVideoControls(videoId, transcriptId, options) {
    const video = document.getElementById(videoId)
    const transcript = document.getElementById(transcriptId)
    const captionsBtn = document.getElementById(`toggle-captions-${videoId}`)
    const transcriptBtn = document.getElementById(`toggle-transcript-${videoId}`)
    const downloadBtn = document.getElementById(`download-transcript-${videoId}`)

    if (!video) return

    let captionsVisible = false
    let transcriptVisible = false

    // Toggle captions
    if (captionsBtn) {
      captionsBtn.addEventListener('click', () => {
        const tracks = video.textTracks
        if (tracks.length > 0) {
          const track = tracks[0]
          if (captionsVisible) {
            track.mode = 'hidden'
            captionsBtn.innerHTML = `<span data-i18n="video.show_captions">Mostrar subtítulos</span>`
            captionsVisible = false
          } else {
            track.mode = 'showing'
            captionsBtn.innerHTML = `<span data-i18n="video.hide_captions">Ocultar subtítulos</span>`
            captionsVisible = true
          }
          
          // Actualizar traducciones
          if (window.i18n) {
            window.i18n.updateTexts()
          }
        }
      })
    }

    // Toggle transcript
    if (transcriptBtn && transcript) {
      transcriptBtn.addEventListener('click', () => {
        if (transcriptVisible) {
          transcript.style.display = 'none'
          transcriptBtn.innerHTML = `<span data-i18n="video.show_transcript">Mostrar transcripción</span>`
          transcriptVisible = false
        } else {
          transcript.style.display = 'block'
          transcriptBtn.innerHTML = `<span data-i18n="video.hide_transcript">Ocultar transcripción</span>`
          transcriptVisible = true
        }
        
        // Actualizar traducciones
        if (window.i18n) {
          window.i18n.updateTexts()
        }
      })
    }

    // Download transcript
    if (downloadBtn && options.transcript) {
      downloadBtn.addEventListener('click', () => {
        const blob = new Blob([options.transcript], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transcripcion-video.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        this.showToast(window.i18n.get('video.transcript_downloaded') || 'Transcripción descargada', 'success')
      })
    }

    // Integración con descripción de audio
    if (window.accessibilityManager?.settings.audioDescription) {
      video.addEventListener('play', () => {
        if (window.speechManager?.isEnabled) {
          window.speechManager.speak('Video iniciado')
        }
      })

      video.addEventListener('pause', () => {
        if (window.speechManager?.isEnabled) {
          window.speechManager.speak('Video pausado')
        }
      })

      video.addEventListener('ended', () => {
        if (window.speechManager?.isEnabled) {
          window.speechManager.speak('Video finalizado')
        }
      })
    }
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Crear modal genérico
  createModal(title, content, options = {}) {
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.style.display = 'flex'
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: ${options.maxWidth || '500px'}">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn" aria-label="Cerrar modal">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${options.showFooter !== false ? `
          <div class="modal-footer">
            <button class="btn btn-outline modal-close">Cerrar</button>
          </div>
        ` : ''}
      </div>
    `

    document.body.appendChild(modal)

    // Event listeners
    const closeBtn = modal.querySelector('.close-btn')
    const modalClose = modal.querySelector('.modal-close')

    const cleanup = () => {
      modal.remove()
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', cleanup)
    }

    if (modalClose) {
      modalClose.addEventListener('click', cleanup)
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup()
      }
    })

    // Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)

    return modal
  }

  // Crear loading spinner
  showLoading(message = 'Cargando...') {
    const loading = document.createElement('div')
    loading.className = 'loading-overlay'
    loading.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>${message}</p>
      </div>
    `
    
    document.body.appendChild(loading)
    return loading
  }

  hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.remove()
    }
  }
}

// Inicializar componentes
window.components = new ComponentsManager()

// Estilos adicionales para los componentes
const componentStyles = document.createElement('style')
componentStyles.textContent = `
  .video-player-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .video-player {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .video-controls-extended {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .btn-small {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .video-transcript {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .transcript-content {
    line-height: 1.6;
    color: #374151;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1002;
  }

  .loading-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .modal-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem;
    color: #6b7280;
    z-index: 10;
  }

  .password-toggle:hover {
    color: #374151;
  }

  .password-strength {
    margin-top: 0.5rem;
  }

  .password-strength-bar {
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .password-strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 2px;
  }

  .password-strength-fill.weak {
    width: 33%;
    background: #ef4444;
  }

  .password-strength-fill.medium {
    width: 66%;
    background: #f59e0b;
  }

  .password-strength-fill.strong {
    width: 100%;
    background: #10b981;
  }

  .password-strength-text {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .password-strength-text.weak {
    color: #ef4444;
  }

  .password-strength-text.medium {
    color: #f59e0b;
  }

  .password-strength-text.strong {
    color: #10b981;
  }

  .incident-photos {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .incident-photo {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .map-popup {
    min-width: 200px;
  }

  .map-popup h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .map-popup p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .video-controls-extended {
      flex-direction: column;
    }

    .modal-content {
      margin: 1rem;
      max-width: none !important;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
`

document.head.appendChild(componentStyles)
