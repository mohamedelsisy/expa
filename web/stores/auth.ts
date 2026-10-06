import { defineStore } from 'pinia'
import type { User } from '~/types/api'
import { isApiError } from '~/utils/errors'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null, loaded: false }),
  getters: {
    isAuthenticated: s => s.user !== null,
    isVerified: s => s.user?.email_verified === true,
  },
  actions: {
    setUser(user: User | null) {
      this.user = user
      this.loaded = true
    },
    reset() {
      // Per-user cached page data must not leak to the next user of a shared device (WEB-32).
      if (import.meta.client && this.user) clearNuxtData()
      this.user = null
      this.loaded = true
    },
    /** Loads the current user once (SSR + client). A 401 just means "guest". */
    async ensureLoaded(force = false) {
      if (this.loaded && !force) return
      // Guests have no session cookie: skip the guaranteed-401 round trip during SSR (the cookie is httpOnly, so
      // the browser relies on the state hydrated from the server payload instead).
      if (import.meta.server && !force && !useCookie('expa_token').value) {
        this.reset()
        return
      }
      const { request } = useApi()
      try {
        const res = await request<User>('auth/me', { handle401: false })
        this.setUser(res.data)
      } catch (e) {
        if (isApiError(e) && (e.status === 401 || e.status === 0 || e.status === 429 || e.status >= 500)) this.reset()
        else throw e
      }
    },
    async logout() {
      const { bff } = useApi()
      try {
        await bff('logout')
      } finally {
        this.reset()
      }
    },
  },
})
