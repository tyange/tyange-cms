export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuth || !authStore.accessToken) {
    return navigateTo('/')
  }

  if (authStore.userRole !== 'admin') {
    return navigateTo('/access-denied')
  }
})
