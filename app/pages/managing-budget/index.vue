<script setup lang="ts">
import type { CMSResponse } from '~/types/response.types'
import type {
  RemainingWeeklyBudgetApiResponse,
  RemainingWeeklyBudgetData,
} from '~/types/budget.types'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const isSubmitting = ref(false)
const isSavingBudget = ref(false)
const errorMessage = ref('')
const saveMessage = ref('')
const result = ref<RemainingWeeklyBudgetData | null>(null)
const selectedFile = ref<File | null>(null)

function getErrorMessage(error: unknown, fallback: string) {
  const fetchError = error as {
    data?: { message?: string } | string
    statusCode?: number
    statusMessage?: string
  }

  if (fetchError?.statusCode === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해 주세요.'
  }

  if (fetchError?.statusCode === 403) {
    return '이 계정은 예산 관리 권한이 없습니다.'
  }

  if (fetchError?.statusCode === 404) {
    return '현재 계정에 연결된 예산 데이터를 찾을 수 없습니다.'
  }

  if (typeof fetchError?.data === 'string' && fetchError.data) {
    return fetchError.data
  }

  if (fetchError?.data && typeof fetchError.data === 'object' && 'message' in fetchError.data && typeof fetchError.data.message === 'string') {
    return fetchError.data.message
  }

  if (fetchError?.statusMessage) {
    return fetchError.statusMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function today() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const form = reactive({
  totalBudget: '',
  fromDate: '',
  toDate: '',
  asOfDate: today(),
})

const setBudgetForm = reactive({
  weeklyLimit: '',
  alertThreshold: '0.85',
})

function formatWon(value: number) {
  return `${value.toLocaleString()}원`
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
}

function isoWeekKey(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  const day = date.getDay() || 7
  date.setDate(date.getDate() + 4 - day)
  const yearStart = new Date(date.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function pickRecommendedWeeklyLimit(data: RemainingWeeklyBudgetData) {
  if (!data.buckets.length) {
    return 0
  }

  const now = today()
  const currentBucket = data.buckets.find(bucket => bucket.from_date <= now && bucket.to_date >= now)
  return currentBucket?.amount ?? data.buckets[0].amount
}

async function submitExcel() {
  if (!authStore.accessToken) {
    errorMessage.value = '로그인 정보가 없습니다.'
    return
  }

  const totalBudget = Number(form.totalBudget)
  if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
    errorMessage.value = '총 예산은 0보다 큰 숫자여야 합니다.'
    return
  }

  if (!form.fromDate || !form.toDate) {
    errorMessage.value = '시작일과 종료일을 입력해 주세요.'
    return
  }

  if (!selectedFile.value) {
    errorMessage.value = '엑셀 파일을 선택해 주세요.'
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const body = new FormData()
    body.append('total_budget', String(totalBudget))
    body.append('from_date', form.fromDate)
    body.append('to_date', form.toDate)
    if (form.asOfDate) {
      body.append('as_of_date', form.asOfDate)
    }
    body.append('file', selectedFile.value)

    const response = await $fetch<RemainingWeeklyBudgetApiResponse>('/api/budget/card-excel/remaining-weekly-budget', {
      method: 'POST',
      headers: {
        Authorization: authStore.accessToken,
      },
      credentials: 'include',
      body,
    })

    if (!response.status || !response.data) {
      throw new Error(response.message ?? '엑셀 분석 결과가 비어 있습니다.')
    }

    result.value = response.data
    setBudgetForm.weeklyLimit = String(pickRecommendedWeeklyLimit(response.data))
    saveMessage.value = ''
  }
  catch (error: unknown) {
    result.value = null
    errorMessage.value = getErrorMessage(error, '엑셀 분석 요청에 실패했습니다.')
  }
  finally {
    isSubmitting.value = false
  }
}

async function saveCurrentWeekBudget() {
  if (!authStore.accessToken) {
    errorMessage.value = '로그인 정보가 없습니다.'
    return
  }

  const weeklyLimit = Number(setBudgetForm.weeklyLimit)
  if (!Number.isFinite(weeklyLimit) || weeklyLimit <= 0) {
    errorMessage.value = '주간 예산은 0보다 큰 숫자여야 합니다.'
    return
  }

  const alertThreshold = Number(setBudgetForm.alertThreshold)
  if (!Number.isFinite(alertThreshold) || alertThreshold < 0 || alertThreshold > 1) {
    errorMessage.value = '알림 임계치는 0.0 이상 1.0 이하여야 합니다.'
    return
  }

  errorMessage.value = ''
  saveMessage.value = ''
  isSavingBudget.value = true

  try {
    const response = await $fetch<CMSResponse<null>>('/api/budget/set', {
      method: 'POST',
      headers: {
        Authorization: authStore.accessToken,
      },
      credentials: 'include',
      body: {
        weekly_limit: Math.round(weeklyLimit),
        alert_threshold: alertThreshold,
      },
    })

    if (!response.status) {
      throw new Error(response.message ?? '주간 예산 저장에 실패했습니다.')
    }

    saveMessage.value = response.message ?? '이번 주 예산을 저장했습니다.'
  }
  catch (error: unknown) {
    errorMessage.value = getErrorMessage(error, '주간 예산 저장에 실패했습니다.')
  }
  finally {
    isSavingBudget.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          카드 엑셀 기반 주간 예산 책정
        </h2>
      </template>

      <p class="mb-3 text-sm text-muted">
        로그인한 계정 기준 예산 데이터로 계산하고 저장합니다.
      </p>

      <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submitExcel">
        <UFormField label="총 예산">
          <UInput
            v-model="form.totalBudget"
            type="number"
            min="1"
            placeholder="예: 2400000"
          />
        </UFormField>
        <UFormField label="기준일(as_of_date)">
          <UInput v-model="form.asOfDate" type="date" />
        </UFormField>
        <UFormField label="시작일(from_date)">
          <UInput v-model="form.fromDate" type="date" />
        </UFormField>
        <UFormField label="종료일(to_date)">
          <UInput v-model="form.toDate" type="date" />
        </UFormField>
        <UFormField label="카드 사용 엑셀 파일(.xlsx/.xls)" class="md:col-span-2">
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            class="block w-full rounded-md border border-default bg-default px-3 py-2 text-sm"
            @change="onFileChange"
          >
        </UFormField>

        <div class="md:col-span-2">
          <UButton type="submit" :loading="isSubmitting">
            엑셀 업로드 후 주간 예산 계산
          </UButton>
        </div>
      </form>

      <p v-if="errorMessage" class="mt-3 text-sm text-error">
        {{ errorMessage }}
      </p>
    </UCard>

    <UCard v-if="result">
      <template #header>
        <h2 class="font-semibold">
          계산 결과
        </h2>
      </template>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-md border border-default p-3">
          <p class="text-xs text-muted">
            총 예산
          </p>
          <p class="text-lg font-semibold">
            {{ formatWon(result.total_budget) }}
          </p>
        </div>
        <div class="rounded-md border border-default p-3">
          <p class="text-xs text-muted">
            현재까지 순지출
          </p>
          <p class="text-lg font-semibold">
            {{ formatWon(result.spent_net) }}
          </p>
        </div>
        <div class="rounded-md border border-default p-3">
          <p class="text-xs text-muted">
            남은 예산
          </p>
          <p class="text-lg font-semibold">
            {{ formatWon(result.remaining_budget) }}
          </p>
        </div>
        <div class="rounded-md border border-default p-3">
          <p class="text-xs text-muted">
            남은 일수
          </p>
          <p class="text-lg font-semibold">
            {{ result.remaining_days }}일
          </p>
        </div>
      </div>

      <p class="mt-3 text-sm text-muted">
        기간: {{ result.period_start }} ~ {{ result.period_end }} / 기준일: {{ result.as_of_date }}
      </p>

      <UAlert
        v-if="result.is_overspent"
        class="mt-3"
        color="error"
        variant="subtle"
        title="예산 초과"
        description="남은 예산이 0 미만입니다. 버킷 예산은 0으로 계산될 수 있습니다."
      />

      <div class="mt-4 space-y-2">
        <UCard
          v-for="bucket in result.buckets"
          :key="bucket.bucket_index"
          :ui="{ body: 'flex items-center justify-between gap-3' }"
        >
          <div>
            <p class="font-medium">
              {{ isoWeekKey(bucket.from_date) }}
            </p>
            <p class="text-xs text-muted">
              {{ bucket.from_date }} ~ {{ bucket.to_date }} ({{ bucket.days }}일)
            </p>
          </div>
          <p class="text-lg font-semibold">
            {{ formatWon(bucket.amount) }}
          </p>
        </UCard>
      </div>

      <div class="mt-5 border-t border-default pt-4">
        <h3 class="font-semibold">
          이번 주 예산 저장
        </h3>
        <p class="text-sm text-muted mb-3">
          `POST /budget/set`으로 현재 주차 예산을 저장합니다.
        </p>
        <form class="grid gap-3 md:grid-cols-3" @submit.prevent="saveCurrentWeekBudget">
          <UFormField label="주간 예산(weekly_limit)">
            <UInput
              v-model="setBudgetForm.weeklyLimit"
              type="number"
              min="1"
              placeholder="예: 450000"
            />
          </UFormField>
          <UFormField label="알림 임계치(alert_threshold)">
            <UInput
              v-model="setBudgetForm.alertThreshold"
              type="number"
              min="0"
              max="1"
              step="0.01"
              placeholder="예: 0.85"
            />
          </UFormField>
          <div class="flex items-end">
            <UButton type="submit" :loading="isSavingBudget">
              이번 주 예산 저장
            </UButton>
          </div>
        </form>

        <p v-if="saveMessage" class="mt-3 text-sm text-success">
          {{ saveMessage }}
        </p>
      </div>
    </UCard>
  </div>
</template>
