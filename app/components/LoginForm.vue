<script lang="ts" setup>
import type { AuthResponse } from '~/types/response.types'
import { useAuthStore } from '~/stores/useAuthStore'

const enteredId = ref('')
const enteredPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const authStore = useAuthStore()

function getErrorMessage(err: unknown) {
  const error = err as {
    data?: { message?: string } | string
    statusMessage?: string
  }

  if (typeof error?.data === 'string' && error.data) {
    return error.data
  }

  if (error?.data && typeof error.data === 'object' && 'message' in error.data && typeof error.data.message === 'string') {
    return error.data.message
  }

  if (error?.statusMessage) {
    return error.statusMessage
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return '로그인에 실패했습니다.'
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const res = await $fetch<AuthResponse>(`/api/login`, {
      method: 'POST',
      body: {
        user_id: enteredId.value,
        password: enteredPassword.value,
      },
      credentials: 'include',
    })

    authStore.$patch({
      isAuth: true,
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      userRole: res.user_role,
    })

    if (res.user_role !== 'admin') {
      await navigateTo('/access-denied')
      return
    }

    await navigateTo('/dashboard')
  }
  catch (err) {
    authStore.clearSession()
    errorMessage.value = getErrorMessage(err)
  }
  finally {
    isSubmitting.value = false
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
    <p v-if="errorMessage" class="text-sm text-error">
      {{ errorMessage }}
    </p>
    <UButton type="submit" :loading="isSubmitting">
      Submit
    </UButton>
  </UForm>
</template>

<style scoped></style>
