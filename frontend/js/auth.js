// Autenticación contra APIs /api/auth/* (Neon). Reemplaza el anterior.
class AuthManager {
  constructor() {
    this.isLoggedIn = false
    this.currentUser = null
    this.init()
  }

  async init() {
    await this.refreshSession()
    this.setupEventListeners()
    this.updateUI()
  }

  setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout())
    }
  }

  async refreshSession() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      const user = json?.user || null
      this.isLoggedIn = !!user
      this.currentUser = user
      this.persist()
    } catch (e) {
      console.error('refreshSession:', e)
      this.isLoggedIn = false
      this.currentUser = null
      this.persist()
    }
  }

  async login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: json?.error || 'Error al iniciar sesión' }
      }
      await this.refreshSession()
      this.updateUI()
      return { success: true, user: this.currentUser }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  async register({ email, password, nombre, telefono }) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, nombre, telefono }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: json?.error || 'No se pudo registrar' }
      }
      await this.refreshSession()
      this.updateUI()
      return { success: true, user: this.currentUser }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    this.isLoggedIn = false
    this.currentUser = null
    this.persist()
    this.updateUI()
    return { success: true }
  }

  persist() {
    try {
      if (this.currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        localStorage.setItem('isLoggedIn', 'true')
      } else {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
      }
    } catch {}
  }

  updateUI() {
    const userInfo = document.getElementById('user-info')
    const userGreeting = document.getElementById('user-greeting')

    if (this.isLoggedIn && this.currentUser) {
      if (userInfo) userInfo.style.display = 'flex'
      if (userGreeting) userGreeting.textContent = `Hola, ${this.currentUser.nombre || this.currentUser.email}`
    } else {
      if (userInfo) userInfo.style.display = 'none'
    }
  }
}

window.auth = new AuthManager()
