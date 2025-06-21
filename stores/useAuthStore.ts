import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: (): { isAuth: boolean, accessToken?: string, refreshToken?: string } => ({
    isAuth: false,
  }),
  persist: true,
})
