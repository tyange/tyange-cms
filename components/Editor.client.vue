<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { PostListItem } from '~/types/post-list-item.types'
import KO_KR from '@vavt/cm-extension/dist/locale/ko-KR'
import { X } from 'lucide-vue-next'

import { MdEditor, config as MdEditorConfig } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import '@vavt/cm-extension/dist/previewTheme/arknights.css'

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

const enteredTitle = ref(props.data?.title ?? '')
const enteredDescription = ref(props.data?.description ?? '')
const enteredPublishedAt = ref(props.data?.published_at ?? '')
const enteredTag = ref('')
const enteredTags = ref<string[]>(props.data?.tags ?? [])
const enteredContent = ref(props.data?.content ?? '')

const isNew = computed(() => route.name === 'managing-blog-new')
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

  try {
    const post = {
      title: enteredTitle.value,
      description: enteredDescription.value,
      published_at: enteredPublishedAt.value,
      tags: enteredTags.value.join(','),
      content: enteredContent.value,
    }

    await $fetch(`${config.public.tyangeCmsApiBase}/post/upload`, {
      method: 'POST',
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
    <div>
      <button class="btn" @click="handleSubmitPost">
        {{ uploadButtonText }}
      </button>
    </div>
    <MdEditor v-model="enteredContent" language="ko-KR" preview-theme="arknights" />
  </div>
</template>

<style scoped>

</style>
