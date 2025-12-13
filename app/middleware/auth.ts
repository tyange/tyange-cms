import type { AuthStore } from '~/types/auth-store.types'

export default defineNuxtRouteMiddleware(() => {
  const authInCookie = useCookie<AuthStore>('auth')

  if (!authInCookie.value || !authInCookie.value.isAuth) {
    console.error('Redirect because not authorized.')
    return navigateTo('/')
  }
})
