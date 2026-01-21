<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { PostListItem } from '~/types/post-list-item.types'
import type { CMSResponse } from '~/types/response.types'
import KO_KR from '@vavt/cm-extension/dist/locale/ko-KR'
import imageCompression from 'browser-image-compression'
import { X } from 'lucide-vue-next'
import { MdEditor, config as MdEditorConfig } from 'md-editor-v3'
import { POST_STATUS } from '~/constants/post-status.constant'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ data?: PostListItem }>()

MdEditorConfig({
  editorConfig: {
    languageUserDefined: {
      'ko-KR': KO_KR,
    },
  },
})

const config = useRuntimeConfig()
const authObject = useCookie<AuthStore>('auth')

const postId = ref<string | null>(props.data?.post_id ?? null)
const enteredTitle = ref(props.data?.title ?? '')
const enteredDescription = ref(props.data?.description ?? '')
const enteredPublishedAt = ref(props.data?.published_at ?? '')
const enteredTag = ref('')
const enteredTags = ref<string[]>(props.data?.tags ?? [])
const enteredContent = ref(props.data?.content ?? '')
const status = ref<POST_STATUS>(props.data?.status ?? POST_STATUS.DRAFT)

function handleSubmitTag() {
  if (enteredTag.value.trim()) {
    enteredTags.value.push(enteredTag.value)
    enteredTag.value = ''
  }
}

function handleDeleteTag(tag: string) {
  if (enteredTags.value.includes(tag)) {
    enteredTags.value = enteredTags.value.filter(et => et !== tag)
  }
}

async function handleSubmitPost() {
  if (!authObject.value?.accessToken) {
    console.error('access token is missing in handleSubmitPost.')
    return
  }

  try {
    const post = {
      title: enteredTitle.value,
      description: enteredDescription.value,
      published_at: enteredPublishedAt.value,
      tags: enteredTags.value.join(','),
      content: enteredContent.value,
      status: status.value,
    }

    const res = await $fetch<CMSResponse<PostListItem>>(`/api/post/upload`, {
      method: 'POST',
      body: post,
      headers: {
        Authorization: authObject.value.accessToken,
      },
      credentials: 'include',
    })

    if (res.status) {
      await navigateTo('/managing-blog')
    }
  }
  catch (err) {
    console.error(err)
  }
}

async function handleEditPost() {
  if (!authObject.value?.accessToken) {
    console.error('access token is missing in handleEditPost.')
    return
  }

  if (!postId.value) {
    console.error('no post id in handleEditPost.')
    return
  }

  try {
    const post = {
      post_id: postId.value,
      title: enteredTitle.value,
      description: enteredDescription.value,
      published_at: enteredPublishedAt.value,
      tags: enteredTags.value.join(','),
      content: enteredContent.value,
      status: status.value,
    }

    const res = await $fetch<CMSResponse<PostListItem>>(`/api/post/update?id=${postId.value}`, {
      method: 'PUT',
      body: post,
      headers: {
        Authorization: authObject.value.accessToken,
      },
      credentials: 'include',
    })

    if (res.status) {
      await navigateTo('/managing-blog')
    }
  }
  catch (err) {
    console.error(err)
  }
}

async function handleUploadImage(files: Array<File>, callback: (urls: string[] | { url: string, alt: string, title: string }[]) => void) {
  if (!authObject.value?.accessToken) {
    console.error('access token is missing in handleSubmitPost.')
    return
  }

  if (!postId.value) {
    console.error('no post id in handleUploadImage.')
    return
  }

  try {
    const results = []

    for (const file of files) {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.85,
      }

      const compressedFile = await imageCompression(file, options)

      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await $fetch<CMSResponse<{ image_path: string }>>(`/api/post/upload-image?id=${postId.value}`, {
        method: 'POST',
        headers: {
          'Authorization': authObject.value.accessToken,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      results.push(`${config.public.tyangeCmsApiBase}${res.data.image_path}`)
    }

    callback(results)
  }
  catch (error) {
    console.error('파일 업로드 중 오류 발생:', error)
  }
}
</script>

<template>
  <div>
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        TITLE
      </legend>
      <input v-model="enteredTitle" type="text" class="input" placeholder="title">
    </fieldset>
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        DESCRIPTION
      </legend>
      <input v-model="enteredDescription" type="text" class="input w-2/3" placeholder="description">
    </fieldset>
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        PUBLISHED AT
      </legend>
      <input v-model="enteredPublishedAt" type="date" class="input">
    </fieldset>
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        TAGS
      </legend>
      <div class="flex flex-col gap-3 py-1">
        <div v-if="enteredTags.length > 0" class="flex gap-1">
          <button v-for="tag of enteredTags" :key="tag" class="btn" @click="handleDeleteTag(tag)">
            {{ tag }}
            <X class="h-lh" :size="15" />
          </button>
        </div>
        <input v-model="enteredTag" type="text" class="input" @keydown.enter="handleSubmitTag">
      </div>
    </fieldset>
    <div class="mb-5 flex justify-between">
      <select v-model="status">
        <option v-for="s in POST_STATUS" :key="s">
          {{ s }}
        </option>
      </select>
      <button v-if="!postId" class="btn" @click="handleSubmitPost">
        CREATE
      </button>
      <button v-if="postId" class="btn" @click="handleEditPost">
        EDIT
      </button>
    </div>
    <MdEditor v-model="enteredContent" language="ko-KR" @on-upload-img="handleUploadImage" />
  </div>
</template>

<style scoped>

</style>
