<script lang="ts" setup>
import LoginForm from '~/components/LoginForm.vue'

definePageMeta({
  layout: 'home',
})

const authStore = useAuthStore()
const { clearInvalidSession } = useAdminLogin()

if (authStore.isAuth && authStore.accessToken) {
  if (clearInvalidSession()) {
    await navigateTo('/dashboard')
  }
}
</script>

<template>
  <LoginForm />
</template>

<style scoped></style>
