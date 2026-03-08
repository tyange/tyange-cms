<script lang="ts" setup>
import LoginForm from '~/components/LoginForm.vue'

definePageMeta({
  layout: 'home',
})

const authStore = useAuthStore()

if (authStore.isAuth && authStore.accessToken) {
  await navigateTo(authStore.userRole === 'admin' ? '/dashboard' : '/access-denied')
}
</script>

<template>
  <LoginForm />
</template>

<style scoped></style>
