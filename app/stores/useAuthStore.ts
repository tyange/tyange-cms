import type { AuthStore } from '~/types/auth-store.types'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: (): AuthStore => ({
    isAuth: false,
  }),
  persist: true,
})
