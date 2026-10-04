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
      this.user = null
      this.loaded = true
    },
    /** Loads the current user once (SSR + client). A 401 just means "guest". */
    async ensureLoaded(force = false) {
      if (this.loaded && !force) return
      const { request } = useApi()
      try {
        const res = await request<User>('auth/me', { handle401: false })
        this.setUser(res.data)
      } catch (e) {
        if (isApiError(e) && (e.status === 401 || e.status === 0 || e.status >= 500)) this.reset()
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
