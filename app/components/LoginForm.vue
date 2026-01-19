<script lang="ts" setup>
import type { AuthResponse } from '~/types/response.types'
import { useAuthStore } from '~/stores/useAuthStore'

const enteredId = ref('')
const enteredPassword = ref('')

const authStore = useAuthStore()

async function handleSubmit() {
  try {
    const res = await $fetch<AuthResponse>(`/api/login`, {
      method: 'POST',
      body: {
        user_id: enteredId.value,
        password: enteredPassword.value,
      },
      credentials: 'include',
    })

    if (res) {
      authStore.$patch({ isAuth: true, accessToken: res.access_token, refreshToken: res.refresh_token })
      await navigateTo('/dashboard')
    }
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <form
    class="flex gap-5 flex-col"
    @submit.prevent="handleSubmit"
  >
    <label class="input w-full">
      <span class="label">ID</span>
      <input
        v-model="enteredId"
        type="text"
      >
    </label>
    <label class="input w-full">
      <span class="label">PW</span>
      <input
        v-model="enteredPassword"
        type="password"
        class="input"
      >
    </label>
    <button
      type="submit"
      class="btn"
    >
      로그인
    </button>
  </form>
</template>

<style scoped></style>
