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
  <section class="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/6 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
    <div class="relative hidden overflow-hidden xl:flex">
      <div class="absolute inset-0 bg-[linear-gradient(140deg,rgba(56,189,248,0.18),rgba(16,185,129,0.12)_55%,transparent)]" />
      <div class="relative flex flex-col justify-between p-10">
        <div class="space-y-4">
          <p class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
            Tyange CMS
          </p>
          <div class="space-y-3">
            <h1 class="max-w-md text-4xl font-semibold leading-tight text-white">
              운영 권한이 있는 관리자만 접근할 수 있습니다.
            </h1>
            <p class="max-w-md text-sm leading-6 text-white/70">
              블로그 운영과 내부 업무를 다루는 전용 관리 화면입니다. Google 계정 또는 기존 관리자 계정으로 로그인해 주세요.
            </p>
          </div>
        </div>

        <div class="grid gap-3 text-sm text-white/65">
          <div class="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            Admin role 검증 후에만 세션이 저장됩니다.
          </div>
          <div class="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            Google 로그인과 ID/비밀번호 로그인 모두 동일한 권한 정책을 적용합니다.
          </div>
        </div>
      </div>
    </div>

    <div class="bg-[linear-gradient(180deg,rgba(4,12,26,0.92),rgba(6,18,37,0.98))] p-6 sm:p-10">
      <div class="mx-auto max-w-md space-y-8">
        <div class="space-y-3 xl:hidden">
          <p class="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/80">
            Tyange CMS
          </p>
          <h1 class="text-3xl font-semibold leading-tight text-white">
            관리자 로그인
          </h1>
          <p class="text-sm leading-6 text-white/65">
            운영 권한이 확인된 계정만 로그인할 수 있습니다.
          </p>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-semibold text-white">
            Sign in
          </h2>
          <p class="text-sm leading-6 text-white/60">
            Google 계정 또는 기존 관리자 자격 증명으로 접속해 주세요.
          </p>
        </div>

        <UForm class="space-y-5" @submit="handleSubmit">
          <UFormField label="ID" name="id" class="text-white/80">
            <UInput v-model="enteredId" :disabled="isPasswordSubmitting || isGoogleSubmitting" size="xl" class="w-full" />
          </UFormField>
          <UFormField label="Password" name="password" class="text-white/80">
            <UInput v-model="enteredPassword" type="password" :disabled="isPasswordSubmitting || isGoogleSubmitting" size="xl" class="w-full" />
          </UFormField>
          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            class="mt-2 h-14 justify-center rounded-2xl font-semibold"
            :loading="isPasswordSubmitting"
            :disabled="isGoogleSubmitting"
          >
            로그인
          </UButton>
        </UForm>

        <div class="space-y-4">
          <div class="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            <div class="h-px flex-1 bg-white/10" />
            <span>Google</span>
            <div class="h-px flex-1 bg-white/10" />
          </div>

          <div class="space-y-3">
            <div class="rounded-[26px] border border-white/10 bg-white/5 p-2">
              <div class="relative min-h-14">
                <div
                  class="transition-opacity"
                  :class="[
                    isGoogleReady && !isGoogleSubmitting ? 'opacity-100' : 'pointer-events-none opacity-0',
                  ]"
                >
                  <div ref="googleButtonContainer" class="flex min-h-14 w-full items-center justify-center" />
                </div>
                <div
                  v-if="!isGoogleReady || isGoogleSubmitting"
                  class="absolute inset-0 flex items-center justify-center rounded-[22px] border border-white/10 bg-[#081427] text-sm font-medium text-white/72"
                >
                  {{ isGoogleSubmitting ? 'Google 로그인 처리 중...' : 'Google 로그인 준비 중...' }}
                </div>
              </div>
            </div>

            <p v-if="googleLoadError" class="text-sm text-amber-300">
              {{ googleLoadError }}
            </p>
          </div>
        </div>

        <div class="min-h-6">
          <p v-if="errorMessage" class="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {{ errorMessage }}
          </p>
        </div>

        <p class="text-xs leading-5 text-white/40">
          로그인 성공 후에도 관리자 권한이 아니면 세션은 저장되지 않습니다.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
