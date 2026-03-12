<script lang="ts" setup>
import type { AuthResponse } from '~/types/response.types'

const enteredId = ref('')
const enteredPassword = ref('')
const errorMessage = ref('')
const googleButtonContainer = ref<HTMLDivElement | null>(null)
const isPasswordSubmitting = ref(false)
const isGoogleSubmitting = ref(false)
const isGoogleReady = ref(false)
const googleLoadError = ref('')
const googleScriptLoaded = ref(false)

const config = useRuntimeConfig()
const { completeAdminLogin, getLoginErrorMessage } = useAdminLogin()
const googleClientId = computed(() => config.public.googleClientId?.trim() ?? '')

const googleScriptSrc = 'https://accounts.google.com/gsi/client'

let googleScriptPromise: Promise<void> | null = null

function setErrorMessage(message: string) {
  errorMessage.value = message
}

function getGoogleButtonWidth() {
  if (!googleButtonContainer.value) {
    return 360
  }

  return Math.max(Math.floor(googleButtonContainer.value.clientWidth), 240)
}

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google script can only be loaded in the browser.'))
  }

  if (window.google?.accounts?.id) {
    googleScriptLoaded.value = true
    return Promise.resolve()
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${googleScriptSrc}"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        googleScriptLoaded.value = true
        resolve()
      }, { once: true })
      existingScript.addEventListener('error', () => {
        reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다.'))
      }, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = googleScriptSrc
    script.async = true
    script.defer = true
    script.onload = () => {
      googleScriptLoaded.value = true
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

function renderGoogleButton() {
  if (!window.google?.accounts?.id || !googleButtonContainer.value || !googleClientId.value) {
    return
  }

  googleButtonContainer.value.innerHTML = ''
  window.google.accounts.id.initialize({
    client_id: googleClientId.value,
    callback: async ({ credential }) => {
      if (!credential || isGoogleSubmitting.value) {
        return
      }

      await submitLogin('google', async () => {
        return await $fetch<AuthResponse>('/api/login/google', {
          method: 'POST',
          body: {
            id_token: credential,
          },
          credentials: 'include',
        })
      })
    },
  })

  window.google.accounts.id.renderButton(googleButtonContainer.value, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    logo_alignment: 'left',
    width: getGoogleButtonWidth(),
  })

  isGoogleReady.value = true
}

async function setupGoogleLogin() {
  if (!googleClientId.value) {
    googleLoadError.value = 'Google 로그인 설정이 필요합니다.'
    return
  }

  googleLoadError.value = ''
  isGoogleReady.value = false

  try {
    await loadGoogleScript()
    renderGoogleButton()
  }
  catch (error) {
    console.error('[auth] failed to initialize google sign-in', error)
    googleLoadError.value = 'Google 로그인을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

async function submitLogin(provider: 'password' | 'google', request: () => Promise<AuthResponse>) {
  setErrorMessage('')

  if (provider === 'password') {
    isPasswordSubmitting.value = true
  }
  else {
    isGoogleSubmitting.value = true
  }

  try {
    const response = await request()
    console.warn(`[auth] ${provider} login succeeded`, { userRole: response.user_role })

    const result = await completeAdminLogin(response)

    if (!result.ok) {
      setErrorMessage(result.message)
    }
  }
  catch (error) {
    console.error(`[auth] ${provider} login failed`, error)
    setErrorMessage(getLoginErrorMessage(error))
  }
  finally {
    if (provider === 'password') {
      isPasswordSubmitting.value = false
    }
    else {
      isGoogleSubmitting.value = false
    }
  }
}

async function handleSubmit() {
  await submitLogin('password', async () => {
    return await $fetch<AuthResponse>('/api/login', {
      method: 'POST',
      body: {
        user_id: enteredId.value,
        password: enteredPassword.value,
      },
      credentials: 'include',
    })
  })
}

onMounted(async () => {
  await setupGoogleLogin()
  window.addEventListener('resize', renderGoogleButton)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderGoogleButton)
  window.google?.accounts?.id.cancel()
})
</script>

<template>
  <div class="space-y-6">
    <UForm class="space-y-4" @submit="handleSubmit">
      <UFormField label="ID" name="id">
        <UInput v-model="enteredId" :disabled="isPasswordSubmitting || isGoogleSubmitting" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="enteredPassword" type="password" :disabled="isPasswordSubmitting || isGoogleSubmitting" />
      </UFormField>
      <UButton type="submit" block :loading="isPasswordSubmitting" :disabled="isGoogleSubmitting">
        로그인
      </UButton>
    </UForm>

    <div class="space-y-3">
      <div class="flex items-center gap-3 text-xs text-muted">
        <div class="h-px flex-1 bg-default" />
        <span>또는</span>
        <div class="h-px flex-1 bg-default" />
      </div>

      <div class="space-y-2">
        <div class="relative">
          <div
            class="transition-opacity"
            :class="[
              isGoogleReady && !isGoogleSubmitting ? 'opacity-100' : 'pointer-events-none opacity-60',
            ]"
          >
            <div ref="googleButtonContainer" class="min-h-11 w-full" />
          </div>
          <div
            v-if="!isGoogleReady || isGoogleSubmitting"
            class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[999px] border border-default bg-default/80 text-sm text-toned"
          >
            {{ isGoogleSubmitting ? 'Google 로그인 처리 중...' : 'Google 로그인 준비 중...' }}
          </div>
        </div>

        <p v-if="googleLoadError" class="text-sm text-error">
          {{ googleLoadError }}
        </p>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-error">
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped></style>
