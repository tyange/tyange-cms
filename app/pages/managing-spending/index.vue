<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { SpendingListResponse, SpendingRecord, UpsertSpendingRequest } from '~/types/spending.types'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authObject = useCookie<AuthStore>('auth')

const weekInput = ref('')
const appliedWeek = ref('')
const submitError = ref('')
const isSubmitting = ref(false)
const editingId = ref<number | null>(null)

const createForm = reactive({
  amount: '',
  merchant: '',
  transactedAt: '',
})

const editForm = reactive({
  amount: '',
  merchant: '',
  transactedAt: '',
})

function getCurrentDateTimeLocal() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

createForm.transactedAt = getCurrentDateTimeLocal()

const authHeaders = computed(() => {
  if (!authObject.value?.accessToken) {
    return {}
  }

  return {
    Authorization: authObject.value.accessToken,
  }
})

const weekQuery = computed(() => {
  if (!appliedWeek.value.trim()) {
    return {}
  }

  return {
    week: appliedWeek.value.trim(),
  }
})

const { data, status, refresh } = await useFetch<SpendingListResponse>('/api/spending', {
  query: weekQuery,
  headers: authHeaders,
  credentials: 'include',
  server: false,
})

const records = computed(() => data.value?.records ?? [])
const weekKey = computed(() => data.value?.week_key ?? '-')
const isLoading = computed(() => status.value === 'pending')

function normalizeDateTimeForInput(value: string) {
  return value.replace(' ', 'T').slice(0, 16)
}

function toApiDateTime(value: string) {
  if (!value) {
    return value
  }

  if (value.length === 16) {
    return `${value}:00`
  }

  return value
}

function formatDateTimeForDisplay(value: string) {
  return value.replace('T', ' ').slice(0, 19)
}

function applyWeekFilter() {
  appliedWeek.value = weekInput.value.trim()
}

function resetWeekFilter() {
  weekInput.value = ''
  appliedWeek.value = ''
}

function startEdit(record: SpendingRecord) {
  editingId.value = record.record_id
  editForm.amount = String(record.amount)
  editForm.merchant = record.merchant ?? ''
  editForm.transactedAt = normalizeDateTimeForInput(record.transacted_at)
  submitError.value = ''
}

function cancelEdit() {
  editingId.value = null
  editForm.amount = ''
  editForm.merchant = ''
  editForm.transactedAt = ''
}

async function createSpending() {
  if (!authObject.value?.accessToken) {
    submitError.value = '로그인 정보가 없습니다.'
    return
  }

  const amount = Number(createForm.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    submitError.value = '금액은 0보다 큰 숫자여야 합니다.'
    return
  }

  if (!createForm.transactedAt) {
    submitError.value = '소비 시각을 입력해 주세요.'
    return
  }

  submitError.value = ''
  isSubmitting.value = true

  try {
    const payload: UpsertSpendingRequest = {
      amount,
      merchant: createForm.merchant.trim() || null,
      transacted_at: toApiDateTime(createForm.transactedAt),
    }

    await $fetch('/api/spending/create', {
      method: 'POST',
      headers: authHeaders.value,
      credentials: 'include',
      body: payload,
    })

    createForm.amount = ''
    createForm.merchant = ''
    createForm.transactedAt = getCurrentDateTimeLocal()
    await refresh()
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error ? error.message : '소비 추가에 실패했습니다.'
  }
  finally {
    isSubmitting.value = false
  }
}

async function updateSpending(recordId: number) {
  if (!authObject.value?.accessToken) {
    submitError.value = '로그인 정보가 없습니다.'
    return
  }

  const amount = Number(editForm.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    submitError.value = '금액은 0보다 큰 숫자여야 합니다.'
    return
  }

  if (!editForm.transactedAt) {
    submitError.value = '소비 시각을 입력해 주세요.'
    return
  }

  submitError.value = ''
  isSubmitting.value = true

  try {
    const payload: UpsertSpendingRequest = {
      amount,
      merchant: editForm.merchant.trim() || null,
      transacted_at: toApiDateTime(editForm.transactedAt),
    }

    await $fetch(`/api/spending/update?id=${recordId}`, {
      method: 'PUT',
      headers: authHeaders.value,
      credentials: 'include',
      body: payload,
    })

    cancelEdit()
    await refresh()
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error ? error.message : '소비 수정에 실패했습니다.'
  }
  finally {
    isSubmitting.value = false
  }
}

async function deleteSpending(recordId: number) {
  if (!confirm('이 소비 기록을 삭제할까요?')) {
    return
  }

  if (!authObject.value?.accessToken) {
    submitError.value = '로그인 정보가 없습니다.'
    return
  }

  submitError.value = ''
  isSubmitting.value = true

  try {
    await $fetch(`/api/spending/delete?id=${recordId}`, {
      method: 'DELETE',
      headers: authHeaders.value,
      credentials: 'include',
    })

    if (editingId.value === recordId) {
      cancelEdit()
    }

    await refresh()
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error ? error.message : '소비 삭제에 실패했습니다.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          수동 소비 추가
        </h2>
      </template>

      <form class="grid gap-3 md:grid-cols-4" @submit.prevent="createSpending">
        <UFormField label="금액">
          <UInput
            v-model="createForm.amount"
            type="number"
            min="1"
            placeholder="예: 12000"
          />
        </UFormField>
        <UFormField label="가맹점">
          <UInput
            v-model="createForm.merchant"
            placeholder="예: CU 역삼신웅점"
          />
        </UFormField>
        <UFormField label="소비 시각">
          <UInput
            v-model="createForm.transactedAt"
            type="datetime-local"
          />
        </UFormField>
        <div class="flex items-end">
          <UButton type="submit" block :loading="isSubmitting">
            소비 추가
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="font-semibold">
              소비 목록
            </h2>
            <p class="text-sm text-muted">
              조회 주차: {{ weekKey }}
            </p>
          </div>
          <div class="flex gap-2">
            <UInput
              v-model="weekInput"
              placeholder="YYYY-Www (예: 2026-W10)"
            />
            <UButton variant="soft" @click="applyWeekFilter">
              조회
            </UButton>
            <UButton color="neutral" variant="ghost" @click="resetWeekFilter">
              초기화
            </UButton>
          </div>
        </div>
      </template>

      <p v-if="submitError" class="text-sm text-error mb-3">
        {{ submitError }}
      </p>

      <template v-if="isLoading">
        <div class="space-y-2">
          <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>
      </template>

      <template v-else-if="records.length > 0">
        <div class="space-y-3">
          <UCard
            v-for="record in records"
            :key="record.record_id"
            :ui="{ body: 'space-y-3' }"
          >
            <template v-if="editingId !== record.record_id">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-1">
                  <p class="text-lg font-semibold">
                    {{ record.amount.toLocaleString() }}원
                  </p>
                  <p class="text-sm">
                    {{ record.merchant || '가맹점 없음' }}
                  </p>
                  <p class="text-xs text-muted">
                    소비 시각: {{ formatDateTimeForDisplay(record.transacted_at) }}
                  </p>
                  <p class="text-xs text-muted">
                    생성 시각: {{ formatDateTimeForDisplay(record.created_at) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <UButton
                    size="sm"
                    variant="soft"
                    icon="i-lucide-pencil"
                    @click="startEdit(record)"
                  >
                    수정
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    variant="soft"
                    icon="i-lucide-trash"
                    :loading="isSubmitting"
                    @click="deleteSpending(record.record_id)"
                  >
                    삭제
                  </UButton>
                </div>
              </div>
            </template>

            <template v-else>
              <form class="grid gap-3 md:grid-cols-4" @submit.prevent="updateSpending(record.record_id)">
                <UFormField label="금액">
                  <UInput v-model="editForm.amount" type="number" min="1" />
                </UFormField>
                <UFormField label="가맹점">
                  <UInput v-model="editForm.merchant" />
                </UFormField>
                <UFormField label="소비 시각">
                  <UInput v-model="editForm.transactedAt" type="datetime-local" />
                </UFormField>
                <div class="flex items-end gap-2">
                  <UButton type="submit" :loading="isSubmitting">
                    저장
                  </UButton>
                  <UButton type="button" color="neutral" variant="ghost" @click="cancelEdit">
                    취소
                  </UButton>
                </div>
              </form>
            </template>
          </UCard>
        </div>
      </template>

      <UEmpty
        v-else
        icon="i-lucide-receipt"
        label="선택한 주차에 소비 기록이 없습니다."
      />
    </UCard>
  </div>
</template>
