<script setup lang="ts">
import type {
  PortfolioCareerCompany,
  PortfolioCareerItem,
  PortfolioDocument,
  PortfolioLink,
  PortfolioProject,
  PortfolioResponse,
} from '~/types/portfolio.types'
import type { CMSResponse } from '~/types/response.types'
import { handleUnauthorizedError, useAuthHeaders } from '~/composables/useAuthenticatedApi'
import {
  createEmptyPortfolioDocument,
  normalizePortfolioDocument,
} from '~/types/portfolio.types'

const authHeaders = useAuthHeaders()

const isSaving = ref(false)
const isDeleting = ref(false)
const submitError = ref('')
const successMessage = ref('')
const hasPortfolio = ref(false)
const portfolioId = ref<number | null>(null)
const createdAt = ref('')
const updatedAt = ref('')
const portfolio = ref<PortfolioDocument>(createEmptyPortfolioDocument())

const { data, error, status, refresh } = await useFetch<CMSResponse<PortfolioResponse>>('/api/portfolio', {
  headers: authHeaders,
  credentials: 'include',
  server: false,
  retry: 0,
})

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
    return '관리자만 포트폴리오를 수정할 수 있습니다.'
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

function assignPortfolio(nextPortfolio?: PortfolioResponse | null) {
  hasPortfolio.value = Boolean(nextPortfolio)
  portfolioId.value = nextPortfolio?.portfolio_id ?? null
  createdAt.value = nextPortfolio?.created_at ?? ''
  updatedAt.value = nextPortfolio?.updated_at ?? ''
  portfolio.value = normalizePortfolioDocument(nextPortfolio?.content)
}

watch(data, (value) => {
  assignPortfolio(value?.data)
}, { immediate: true })

watch(error, async (value) => {
  if (!value) {
    return
  }

  const handled = await handleUnauthorizedError(value)
  if (handled) {
    return
  }

  if ((value as { statusCode?: number }).statusCode === 404) {
    assignPortfolio(null)
    submitError.value = ''
    return
  }

  submitError.value = getErrorMessage(value, '포트폴리오를 불러오지 못했습니다.')
}, { immediate: true })

const isLoading = computed(() => status.value === 'pending')
const loadErrorMessage = computed(() => {
  if (!error.value || (error.value as { statusCode?: number }).statusCode === 404) {
    return ''
  }

  return getErrorMessage(error.value, '포트폴리오를 불러오지 못했습니다.')
})

const metadataItems = computed(() => [
  { label: 'portfolio_id', value: portfolioId.value ?? '-' },
  { label: 'slug', value: portfolio.value.slug || '-' },
  { label: 'created_at', value: createdAt.value || '-' },
  { label: 'updated_at', value: updatedAt.value || '-' },
])

function createLink(): PortfolioLink {
  return {
    label: '',
    url: '',
  }
}

function createProject(): PortfolioProject {
  return {
    slug: '',
    title: '',
    period: '',
    summary: '',
    stack: [],
    links: [createLink()],
  }
}

function createCareerItem(): PortfolioCareerItem {
  return {
    title: '',
    period: '',
    bullets: [],
  }
}

function createCareerCompany(): PortfolioCareerCompany {
  return {
    company: '',
    period: '',
    employment_type: '',
    role: '',
    position: '',
    items: [createCareerItem()],
  }
}

function parseMultilineList(value: string) {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

function updateProjectStack(index: number, value: string) {
  portfolio.value.featured_projects[index].stack = parseMultilineList(value)
}

function updateCareerItemBullets(companyIndex: number, itemIndex: number, value: string) {
  const career = portfolio.value.career ?? { summary_label: '', summary_value: '', companies: [] }
  career.companies[companyIndex].items[itemIndex].bullets = parseMultilineList(value)
  portfolio.value.career = career
}

function addProject() {
  portfolio.value.featured_projects.push(createProject())
}

function removeProject(index: number) {
  portfolio.value.featured_projects.splice(index, 1)
}

function addProjectLink(projectIndex: number) {
  portfolio.value.featured_projects[projectIndex].links.push(createLink())
}

function removeProjectLink(projectIndex: number, linkIndex: number) {
  portfolio.value.featured_projects[projectIndex].links.splice(linkIndex, 1)
}

function addCareerCompany() {
  const career = portfolio.value.career ?? { summary_label: '', summary_value: '', companies: [] }
  career.companies.push(createCareerCompany())
  portfolio.value.career = career
}

function removeCareerCompany(index: number) {
  const career = portfolio.value.career ?? { summary_label: '', summary_value: '', companies: [] }
  career.companies.splice(index, 1)
  portfolio.value.career = career
}

function addCareerItem(companyIndex: number) {
  const career = portfolio.value.career ?? { summary_label: '', summary_value: '', companies: [] }
  career.companies[companyIndex].items.push(createCareerItem())
  portfolio.value.career = career
}

function removeCareerItem(companyIndex: number, itemIndex: number) {
  const career = portfolio.value.career ?? { summary_label: '', summary_value: '', companies: [] }
  career.companies[companyIndex].items.splice(itemIndex, 1)
  portfolio.value.career = career
}

function buildPayload() {
  return {
    content: {
      ...portfolio.value,
      slug: portfolio.value.slug.trim() || 'dev',
    },
  }
}

async function handleRefresh() {
  submitError.value = ''
  successMessage.value = ''
  await refresh()
}

async function handleSave() {
  submitError.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    const response = await authenticatedFetch<CMSResponse<PortfolioResponse>>('/api/portfolio/update', {
      method: 'PUT',
      body: buildPayload(),
    })

    assignPortfolio(response.data)
    successMessage.value = hasPortfolio.value ? '포트폴리오를 저장했습니다.' : '포트폴리오를 생성했습니다.'
  }
  catch (error: unknown) {
    submitError.value = getErrorMessage(error, '포트폴리오 저장에 실패했습니다.')
  }
  finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (!hasPortfolio.value) {
    return
  }

  const confirmed = window.confirm('포트폴리오 데이터를 삭제할까요?')

  if (!confirmed) {
    return
  }

  submitError.value = ''
  successMessage.value = ''
  isDeleting.value = true

  try {
    await authenticatedFetch('/api/portfolio/delete', {
      method: 'DELETE',
    })

    assignPortfolio(null)
    successMessage.value = '포트폴리오를 삭제했습니다.'
  }
  catch (error: unknown) {
    submitError.value = getErrorMessage(error, '포트폴리오 삭제에 실패했습니다.')
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">
          Portfolio Editor
        </h1>
        <p class="text-sm text-muted">
          `/portfolio` 단일 문서를 조회하고 생성, 수정, 삭제할 수 있습니다.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="subtle" icon="i-lucide-refresh-cw" :loading="isLoading" @click="handleRefresh">
          새로고침
        </UButton>
        <UButton color="primary" icon="i-lucide-save" :loading="isSaving" @click="handleSave">
          {{ hasPortfolio ? '저장' : '생성' }}
        </UButton>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash"
          :disabled="!hasPortfolio"
          :loading="isDeleting"
          @click="handleDelete"
        >
          삭제
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="loadErrorMessage || submitError"
      color="error"
      variant="subtle"
      title="요청을 처리하지 못했습니다."
      :description="loadErrorMessage || submitError"
    />

    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      title="완료"
      :description="successMessage"
    />

    <UAlert
      v-if="!hasPortfolio && !isLoading && !loadErrorMessage"
      color="warning"
      variant="subtle"
      title="포트폴리오가 아직 없습니다."
      description="아래 폼을 채운 뒤 생성 버튼을 누르면 `/portfolio` 문서가 만들어집니다."
    />

    <template v-if="isLoading">
      <UCard v-for="index in 4" :key="index">
        <div class="space-y-3">
          <USkeleton class="h-5 w-40" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-24 w-full" />
        </div>
      </UCard>
    </template>

    <template v-else>
      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">
              Metadata
            </h2>
            <p class="text-sm text-muted">
              현재 CMS가 보고 있는 포트폴리오 문서 메타 정보입니다.
            </p>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="item in metadataItems"
            :key="item.label"
            class="rounded-lg border border-default p-3"
          >
            <p class="text-xs uppercase tracking-wide text-muted">
              {{ item.label }}
            </p>
            <p class="mt-1 break-all text-sm">
              {{ item.value }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Basic
          </h2>
        </template>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Slug">
            <UInput v-model="portfolio.slug" placeholder="dev" />
          </UFormField>

          <UFormField label="Version">
            <UInput v-model.number="portfolio.version" type="number" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Contact
          </h2>
        </template>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Email">
            <UInput v-model="portfolio.email" />
          </UFormField>

          <UFormField label="Github URL">
            <UInput v-model="portfolio.github_url" />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold">
              Featured Projects
            </h2>
            <UButton size="sm" variant="subtle" icon="i-lucide-plus" @click="addProject">
              프로젝트 추가
            </UButton>
          </div>
        </template>

        <div v-if="portfolio.featured_projects.length" class="space-y-4">
          <div
            v-for="(project, projectIndex) in portfolio.featured_projects"
            :key="projectIndex"
            class="rounded-xl border border-default p-4"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="font-medium">
                Project {{ projectIndex + 1 }}
              </h3>
              <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="removeProject(projectIndex)" />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Slug">
                <UInput v-model="project.slug" />
              </UFormField>

              <UFormField label="Title">
                <UInput v-model="project.title" />
              </UFormField>

              <UFormField label="Period">
                <UInput v-model="project.period" />
              </UFormField>

              <UFormField label="Summary" class="sm:col-span-2">
                <UTextarea v-model="project.summary" :rows="3" autoresize />
              </UFormField>

              <UFormField label="Stack (one per line)" class="sm:col-span-2">
                <UTextarea
                  :model-value="project.stack.join('\n')"
                  :rows="4"
                  autoresize
                  @update:model-value="updateProjectStack(projectIndex, $event)"
                />
              </UFormField>
            </div>

            <div class="mt-4 rounded-lg border border-default p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <h4 class="font-medium">
                  Links
                </h4>
                <UButton size="sm" variant="subtle" icon="i-lucide-plus" @click="addProjectLink(projectIndex)">
                  링크 추가
                </UButton>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(link, linkIndex) in project.links"
                  :key="linkIndex"
                  class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <UInput v-model="link.label" placeholder="Label" />
                  <UInput v-model="link.url" placeholder="URL" />
                  <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="removeProjectLink(projectIndex, linkIndex)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <UEmpty v-else icon="i-lucide-folder-open" label="No featured projects" />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold">
              Career
            </h2>
            <UButton size="sm" variant="subtle" icon="i-lucide-plus" @click="addCareerCompany">
              회사 추가
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <template v-if="portfolio.career">
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Summary Label">
                <UInput v-model="portfolio.career.summary_label" />
              </UFormField>

              <UFormField label="Summary Value">
                <UInput v-model="portfolio.career.summary_value" />
              </UFormField>
            </div>

            <div v-if="portfolio.career.companies.length" class="space-y-4">
              <div
                v-for="(company, companyIndex) in portfolio.career.companies"
                :key="companyIndex"
                class="rounded-xl border border-default p-4"
              >
                <div class="mb-4 flex items-center justify-between gap-3">
                  <h3 class="font-medium">
                    Company {{ companyIndex + 1 }}
                  </h3>
                  <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="removeCareerCompany(companyIndex)" />
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <UFormField label="Company">
                    <UInput v-model="company.company" />
                  </UFormField>

                  <UFormField label="Period">
                    <UInput v-model="company.period" />
                  </UFormField>

                  <UFormField label="Employment Type">
                    <UInput v-model="company.employment_type" />
                  </UFormField>

                  <UFormField label="Role">
                    <UInput v-model="company.role" />
                  </UFormField>

                  <UFormField label="Position" class="sm:col-span-2">
                    <UInput v-model="company.position" />
                  </UFormField>
                </div>

                <div class="mt-4 rounded-lg border border-default p-4">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <h4 class="font-medium">
                      Career Items
                    </h4>
                    <UButton size="sm" variant="subtle" icon="i-lucide-plus" @click="addCareerItem(companyIndex)">
                      항목 추가
                    </UButton>
                  </div>

                  <div v-if="company.items.length" class="space-y-4">
                    <div
                      v-for="(item, itemIndex) in company.items"
                      :key="itemIndex"
                      class="rounded-lg border border-default p-4"
                    >
                      <div class="mb-4 flex items-center justify-between gap-3">
                        <h5 class="font-medium">
                          Item {{ itemIndex + 1 }}
                        </h5>
                        <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="removeCareerItem(companyIndex, itemIndex)" />
                      </div>

                      <div class="space-y-4">
                        <UFormField label="Title">
                          <UInput v-model="item.title" />
                        </UFormField>

                        <UFormField label="Period">
                          <UInput v-model="item.period" />
                        </UFormField>

                        <UFormField label="Bullets (one per line)">
                          <UTextarea
                            :model-value="item.bullets.join('\n')"
                            :rows="5"
                            autoresize
                            @update:model-value="updateCareerItemBullets(companyIndex, itemIndex, $event)"
                          />
                        </UFormField>
                      </div>
                    </div>
                  </div>

                  <UEmpty v-else icon="i-lucide-briefcase-business" label="No career items" />
                </div>
              </div>
            </div>

            <UEmpty v-else icon="i-lucide-briefcase" label="No career companies" />
          </template>

          <UEmpty v-else icon="i-lucide-briefcase" label="Career section unavailable" />
        </div>
      </UCard>
    </template>
  </div>
</template>
