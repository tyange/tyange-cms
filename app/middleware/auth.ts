export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const { clearInvalidSession } = useAdminLogin()

  if (!authStore.isAuth || !authStore.accessToken) {
    return navigateTo('/')
  }

  if (!clearInvalidSession()) {
    return navigateTo('/access-denied')
  }
})
