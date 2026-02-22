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
  <UForm class="space-y-4" @submit="handleSubmit">
    <UFormField label="ID" name="id">
      <UInput v-model="enteredId" />
    </UFormField>
    <UFormField label="Password" name="password">
      <UInput v-model="enteredPassword" type="password" />
    </UFormField>
    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>

<style scoped></style>
