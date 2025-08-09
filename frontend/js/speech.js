// Sistema de síntesis de voz robusto con defensas para i18n no inicializado
class SpeechManager {
  constructor() {
    this.synthesis = typeof window !== "undefined" ? window.speechSynthesis : null
    this.voices = []
    this.currentUtterance = null
    this.isEnabled = false
    this.settings = {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.9,
      voice: null,
      language: "es-ES",
    }
    this.init()
  }

  init() {
    this.loadSettings()
    this.loadVoices()
    this.setupEventListeners()
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("speech-settings")
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.warn("speech: no settings", e)
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("speech-settings", JSON.stringify(this.settings))
    } catch {}
  }

  loadVoices() {
    if (!this.synthesis) return
    const updateVoices = () => {
      try {
        this.voices = this.synthesis.getVoices() || []
        this.selectBestVoice()
      } catch {}
    }
    updateVoices()
    if (this.synthesis.addEventListener) {
      this.synthesis.addEventListener("voiceschanged", updateVoices)
    } else {
      // Safari fallback
      // @ts-ignore
      this.synthesis.onvoiceschanged = updateVoices
    }
  }

  getCurrentLanguage() {
    try {
      // Guardar por si i18n no está listo o no expone función
      if (window.i18n && typeof window.i18n.getCurrentLanguage === "function") {
        return window.i18n.getCurrentLanguage()
      }
      if (window.i18n && typeof window.i18n.currentLanguage === "string") {
        return window.i18n.currentLanguage
      }
    } catch {}
    return "es"
  }

  selectBestVoice() {
    if (!this.voices.length) return
    // Conservar la preferencia si aún existe
    if (this.settings.voice) {
      const v = this.voices.find((vv) => vv.name === this.settings.voice)
      if (v) return
    }
    const langPref = this.getCurrentLanguage() === "es" ? "es" : "en"
    const local = this.voices.filter((v) => v.localService)
    const remote = this.voices.filter((v) => !v.localService)
    const match = (list) =>
      list.find((v) => v.lang?.toLowerCase().startsWith(langPref) || v.lang?.toLowerCase().includes(langPref))

    const best = match(local) || match(remote) || this.voices[0]
    if (best) {
      this.settings.voice = best.name
      this.settings.language = best.lang || (langPref === "es" ? "es-ES" : "en-US")
      this.saveSettings()
    }
  }

  setupEventListeners() {
    document.addEventListener("languageChanged", (e) => {
      try {
        const lang = e?.detail?.language === "es" ? "es-ES" : "en-US"
        this.settings.language = lang
        this.selectBestVoice()
        this.saveSettings()
      } catch {}
    })
    document.addEventListener("accessibilityChanged", (e) => {
      try {
        if (e?.detail?.setting === "speech") {
          this.isEnabled = !!e.detail.value
          if (this.isEnabled) this.addSpeechToElements()
        }
      } catch {}
    })
  }

  enable() {
    this.isEnabled = true
    this.addSpeechToElements()
  }
  disable() {
    this.isEnabled = false
    this.stop()
  }

  speak(text, options = {}) {
    if (!this.isEnabled || !text || !this.synthesis) return
    this.stop()
    const clean = this.cleanText(text)
    if (!clean) return

    this.currentUtterance = new SpeechSynthesisUtterance(clean)
    this.currentUtterance.rate = options.rate || this.settings.rate
    this.currentUtterance.pitch = options.pitch || this.settings.pitch
    this.currentUtterance.volume = options.volume || this.settings.volume
    this.currentUtterance.lang = options.language || this.settings.language

    const voice = this.voices.find((v) => v.name === this.settings.voice)
    if (voice) this.currentUtterance.voice = voice

    this.currentUtterance.onend = () => {
      document.body.classList.remove("speech-active")
      this.currentUtterance = null
    }
    this.currentUtterance.onstart = () => {
      document.body.classList.add("speech-active")
    }
    this.currentUtterance.onerror = () => {
      document.body.classList.remove("speech-active")
      this.currentUtterance = null
    }

    try {
      this.synthesis.speak(this.currentUtterance)
    } catch (e) {
      console.error("speech speak error", e)
    }
  }

  stop() {
    try {
      if (this.synthesis?.speaking) this.synthesis.cancel()
    } catch {}
    this.currentUtterance = null
    document.body.classList.remove("speech-active")
  }

  pause() {
    try {
      if (this.synthesis?.speaking) this.synthesis.pause()
    } catch {}
  }

  resume() {
    try {
      if (this.synthesis?.paused) this.synthesis.resume()
    } catch {}
  }

  cleanText(text) {
    if (!text) return ""
    return String(text)
      .replace(/[^\w\s\.,!?;:áéíóúñÁÉÍÓÚÑ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  getElementText(el) {
    const attrs = ["data-speech", "aria-label", "title", "alt", "placeholder"]
    for (const a of attrs) {
      const v = el.getAttribute?.(a)
      if (v && v.trim()) return v.trim()
    }
    if ("value" in el && typeof el.value === "string" && el.value.trim()) return el.value.trim()
    const tc = el.textContent?.trim()
    if (tc) return tc
    return ""
  }

  addSpeechToElements() {
    if (!this.isEnabled) return
    const selectors = [
      "button",
      "a[href]",
      "input",
      "select",
      "textarea",
      "[role='button']",
      "[tabindex]:not([tabindex='-1'])",
      ".nav-btn",
      ".btn",
      ".card",
      "h1, h2, h3, h4, h5, h6",
      "p",
      "li",
      ".form-label",
      ".status-badge",
      ".notification",
      ".toast-message",
    ]
    const handle = (el) => {
      if (!el || el.getAttribute("data-speech-enabled") === "true") return
      const speakOn = () => {
        if (!this.isEnabled) return
        let txt = this.getElementText(el)
        if (!txt) return
        if (el.tagName === "BUTTON") txt = `Botón: ${txt}`
        if (el.tagName === "A") txt = `Enlace: ${txt}`
        if (el.tagName?.match?.(/^H[1-6]$/)) txt = `Título: ${txt}`
        this.speak(txt)
      }
      el.addEventListener("mouseenter", speakOn)
      el.addEventListener("focus", speakOn)
      el.setAttribute("data-speech-enabled", "true")
    }
    selectors.forEach((sel) => document.querySelectorAll(sel).forEach(handle))
    this.announcePageContent()
  }

  announcePageContent() {
    if (!this.isEnabled) return
    setTimeout(() => {
      try {
        const main = document.querySelector(".content-area")
        const h1 = main?.querySelector?.("h1")
        if (h1?.textContent) this.speak(`Página: ${h1.textContent}`)
        const p = main?.querySelector?.("p")
        if (p?.textContent) this.speak(p.textContent)
      } catch {}
    }, 800)
  }

  test() {
    const lang = this.getCurrentLanguage()
    const msg =
      lang === "es"
        ? "Prueba de síntesis de voz. El sistema está funcionando."
        : "Speech synthesis test. The system is working."
    this.speak(msg)
  }

  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
  }

  getStatus() {
    return {
      supported: this.isSupported(),
      enabled: this.isEnabled,
      speaking: this.synthesis?.speaking || false,
      paused: this.synthesis?.paused || false,
      voicesLoaded: this.voices.length > 0,
      currentVoice: this.settings.voice,
      settings: { ...this.settings },
    }
  }
}

window.speechManager = new SpeechManager()

document.addEventListener("keydown", (e) => {
  if (!window.speechManager?.isEnabled) return
  if (e.ctrlKey && e.shiftKey && e.key?.toUpperCase() === "S") {
    e.preventDefault()
    window.speechManager.speak(window.getSelection()?.toString() || "")
  }
  if (e.ctrlKey && e.shiftKey && e.key?.toUpperCase() === "P") {
    e.preventDefault()
    window.speechManager.announcePageContent()
  }
  if (e.key === " " && !["INPUT", "TEXTAREA"].includes(e.target?.tagName)) {
    if (window.speechManager.synthesis?.speaking) {
      e.preventDefault()
      if (window.speechManager.synthesis.paused) window.speechManager.resume()
      else window.speechManager.pause()
    }
  }
  if (e.key === "Escape" && window.speechManager.synthesis?.speaking) {
    window.speechManager.stop()
  }
})
