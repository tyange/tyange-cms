<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { PostListItem } from '~/types/post-list-item.types'
import type { CMSResponse } from '~/types/response.types'
import KO_KR from '@vavt/cm-extension/dist/locale/ko-KR'
import { X } from 'lucide-vue-next'

import { MdEditor, config as MdEditorConfig } from 'md-editor-v3'
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
const route = useRoute()
const authObject = useCookie<AuthStore>('auth')

const postId = ref<string | null>(props.data?.post_id ?? null)
const enteredTitle = ref(props.data?.title ?? '')
const enteredDescription = ref(props.data?.description ?? '')
const enteredPublishedAt = ref(props.data?.published_at ?? '')
const enteredTag = ref('')
const enteredTags = ref<string[]>(props.data?.tags ?? [])
const enteredContent = ref(props.data?.content ?? '')

const isNew = computed(() => route.name === 'managing-blog-create')
const uploadButtonText = computed(() => isNew.value ? 'UPLOAD' : 'SAVE')

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

  if (!postId.value) {
    console.error('no post id in handleSubmitPost.')
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
    }

    await $fetch(`${config.public.tyangeCmsApiBase}/post/update/${postId.value}`, {
      method: 'PUT',
      body: post,
      headers: {
        'content-type': 'application/json',
        'Authorization': authObject.value.accessToken,
      },
    })
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
      const formData = new FormData()
      formData.append('file', file)

      const res = await $fetch<CMSResponse<{ image_path: string }>>(`${config.public.tyangeCmsApiBase}/upload-image?post_id=${postId.value}`, {
        headers: {
          Authorization: authObject.value.accessToken,
        },
        method: 'POST',
        body: formData,
      })

      results.push(res.data.image_path)
    }

    callback(results)
  }
  catch (error) {
    console.error('파일 업로드 중 오류 발생:', error)
  }
}

onMounted(async () => {
  if (authObject?.value?.accessToken && isNew.value) {
    try {
      const res = await $fetch<CMSResponse<{ post_id: string }>>(`${config.public.tyangeCmsApiBase}/post/upload`, {
        headers: {
          Authorization: authObject.value.accessToken,
        },
        method: 'POST',
        body: {
          title: '',
          description: '',
          published_at: '',
          tags: '',
          content: '',
          status: 'draft',
        },
      })
      postId.value = res.data.post_id
    }
    catch (err) {
      console.error(`failed to initializing post in onMounted: `, err)
    }
  }
})
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
    <div class="mb-5">
      <button class="btn" @click="handleSubmitPost">
        {{ uploadButtonText }}
      </button>
    </div>
    <MdEditor v-model="enteredContent" language="ko-KR" @on-upload-img="handleUploadImage" />
  </div>
</template>

<style scoped>

</style>
