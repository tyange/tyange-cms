<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { PostListItem } from '~/types/post-list-item.types'
import type { CMSResponse } from '~/types/response.types'
import { CalendarDate } from '@internationalized/date'
import KO_KR from '@vavt/cm-extension/dist/locale/ko-KR'
import imageCompression from 'browser-image-compression'
import { getDate, getMonth, getYear } from 'date-fns'
import { MdEditor, config as MdEditorConfig } from 'md-editor-v3'
import { POST_STATUS } from '~/constants/post-status.constant'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ data?: PostListItem }>()

MdEditorConfig({
  editorConfig: {
    languageUserDefined: { 'ko-KR': KO_KR },
  },
})

const config = useRuntimeConfig()
const authObject = useCookie<AuthStore>('auth')

const publishedAtProps = computed(() => props.data?.published_at.split('-'))
const currentDate = new Date()

const postId = ref<string | null>(props.data?.post_id ?? null)
const enteredTitle = ref(props.data?.title ?? '')
const enteredDescription = ref(props.data?.description ?? '')

const initialDate = publishedAtProps.value
  ? new CalendarDate(Number(publishedAtProps.value[0]), Number(publishedAtProps.value[1]), Number(publishedAtProps.value[2]))
  : new CalendarDate(getYear(currentDate), getMonth(currentDate) + 1, getDate(currentDate))

const enteredPublishedAt = shallowRef(initialDate)
const enteredTags = ref<string[]>(props.data?.tags ?? [])
const enteredContent = ref(props.data?.content ?? '')
const status = ref<POST_STATUS>(props.data?.status ?? POST_STATUS.DRAFT)

const { data: tagCategories } = await useFetch('/api/tags-with-category')

async function handleSubmitPost() {
  if (!authObject.value?.accessToken)
    return

  try {
    const post = {
      title: enteredTitle.value,
      description: enteredDescription.value,
      // 중요: CalendarDate 객체를 문자열(YYYY-MM-DD)로 변환하여 전송
      published_at: enteredPublishedAt.value.toString(),
      tags: enteredTags.value,
      content: enteredContent.value,
      status: status.value,
    }

    const res = await $fetch<CMSResponse<PostListItem>>(`/api/post/upload`, {
      method: 'POST',
      body: post,
      headers: { Authorization: authObject.value.accessToken },
    })

    if (res.status)
      await navigateTo('/managing-blog')
  }
  catch (err) {
    console.error(err)
  }
}

async function handleEditPost() {
  if (!authObject.value?.accessToken || !postId.value)
    return

  try {
    const post = {
      post_id: postId.value,
      title: enteredTitle.value,
      description: enteredDescription.value,
      // 중요: 문자열로 변환
      published_at: enteredPublishedAt.value.toString(),
      tags: enteredTags.value,
      content: enteredContent.value,
      status: status.value,
    }

    const res = await $fetch<CMSResponse<PostListItem>>(`/api/post/update?id=${postId.value}`, {
      method: 'PUT',
      body: post,
      headers: { Authorization: authObject.value.accessToken },
    })

    if (res.status)
      await navigateTo('/managing-blog')
  }
  catch (err) {
    console.error(err)
  }
}

// 이미지 업로드 핸들러 (기존 로직 유지)
async function handleUploadImage(files: Array<File>, callback: (urls: string[]) => void) {
  if (!authObject.value?.accessToken || !postId.value)
    return
  try {
    const results = []
    for (const file of files) {
      const compressedFile = await imageCompression(file, { maxSizeMB: 2, useWebWorker: true })
      const formData = new FormData()
      formData.append('file', compressedFile)
      const res = await $fetch<CMSResponse<{ image_path: string }>>(`/api/post/upload-image?id=${postId.value}`, {
        method: 'POST',
        headers: { Authorization: authObject.value.accessToken },
        body: formData,
      })
      results.push(`${config.public.tyangeCmsApiBase}${res.data.image_path}`)
    }
    callback(results)
  }
  catch (error) {
    console.error('Upload Error:', error)
  }
}
</script>

<template>
  <div class="space-y-4">
    <UFormField label="TITLE">
      <UInput v-model="enteredTitle" class="w-full" />
    </UFormField>

    <UFormField label="DESCRIPTION">
      <UInput v-model="enteredDescription" class="w-full" />
    </UFormField>

    <UFormField label="PUBLISHED AT">
      <UInputDate v-model="enteredPublishedAt" type="date" format="yyyy-MM-dd" />
    </UFormField>

    <div class="flex justify-between items-center mt-6">
      <USelect v-model="status" :items="Object.values(POST_STATUS)" />

      <div class="space-x-2">
        <UButton v-if="!postId" color="primary" @click="handleSubmitPost">
          CREATE
        </UButton>
        <UButton v-else color="primary" @click="handleEditPost">
          EDIT
        </UButton>
      </div>
    </div>

    <div class="mt-4">
      <MdEditor v-model="enteredContent" language="ko-KR" @on-upload-img="handleUploadImage" />
    </div>
  </div>
</template>
