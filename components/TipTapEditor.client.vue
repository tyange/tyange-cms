<script setup lang="ts">
import type { PostListItem } from '~/types/post-list-item.types'
import { X } from 'lucide-vue-next'

const props = defineProps<{ data: PostListItem }>()

const enteredTitle = ref(props.data.title)
const enteredDescription = ref(props.data.description)
const enteredPublishedAt = ref(props.data.published_at)
const enteredTag = ref('')
const enteredTags = ref<string[]>(props.data.tags)

const editor = useEditor({
  content: props.data.content ?? '<p>I\'m running Tiptap with Vue.js. 🎉</p>',
  extensions: [TiptapStarterKit],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
    },
  },
})

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

onBeforeUnmount(() => {
  unref(editor)?.destroy()
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
        <div v-if="enteredTags.length > 0">
          <button v-for="tag of enteredTags" :key="tag" class="btn" @click="handleDeleteTag(tag)">
            {{ tag }}
            <X class="h-lh" :size="15" />
          </button>
        </div>
        <input v-model="enteredTag" type="text" class="input" @keydown.enter="handleSubmitTag">
      </div>
    </fieldset>
    <fieldset />
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        CONTENT
      </legend>
      <div v-if="editor" class="flex gap-2 flex-wrap">
        <button
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          class="btn"
          :class="{ 'is-active': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          bold
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          class="btn"
          :class="{ 'is-active': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          italic
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          class="btn"
          :class="{ 'is-active': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          strike
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          class="btn"
          :class="{ 'is-active': editor.isActive('code') }"
          @click="editor.chain().focus().toggleCode().run()"
        >
          code
        </button>
        <button class="btn" @click="editor.chain().focus().unsetAllMarks().run()">
          clear marks
        </button>
        <button class="btn" @click="editor.chain().focus().clearNodes().run()">
          clear nodes
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('paragraph') }"
          @click="editor.chain().focus().setParagraph().run()"
        >
          paragraph
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          h1
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          h2
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          h3
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        >
          h4
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        >
          h5
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        >
          h6
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          bullet list
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          ordered list
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          code block
        </button>
        <button
          class="btn"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          blockquote
        </button>
        <button
          class="btn" @click="editor.chain().focus().setHorizontalRule().run()"
        >
          horizontal rule
        </button>
        <button
          class="btn" @click="editor.chain().focus().setHardBreak().run()"
        >
          hard break
        </button>
        <button
          class="btn"
          :disabled="!editor.can().chain().focus().undo().run()"
          @click="editor.chain().focus().undo().run()"
        >
          undo
        </button>
        <button
          class="btn"
          :disabled="!editor.can().chain().focus().redo().run()"
          @click="editor.chain().focus().redo().run()"
        >
          redo
        </button>
        <button class="btn btn-primary">
          UPLOAD
        </button>
        <button class="btn btn-error">
          DELETE
        </button>
      </div>
    </fieldset>
    <TiptapEditorContent :editor="editor" />
  </div>
</template>

<style scoped>

</style>
