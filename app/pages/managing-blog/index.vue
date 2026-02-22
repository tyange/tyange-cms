<script setup lang="ts">
import type { AuthStore } from '~/types/auth-store.types'
import type { PostListItem } from '~/types/post-list-item.types'
import type { CMSResponse } from '~/types/response.types'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authObject = useCookie<AuthStore>('auth')

const { data, refresh, status } = await useFetch<CMSResponse<{ posts: PostListItem[] }>>(`/api/posts`, {
  headers: { Authorization: authObject.value!.accessToken! },
  credentials: 'include',
  server: false,
})

const postList = computed(() => data.value?.data.posts ?? [])
const isLoading = computed(() => status.value === 'pending')

async function handleDeletePost(postId: string) {
  if (!authObject.value?.accessToken) {
    console.error('access token is missing in handleSubmitPost.')
    return
  }

  try {
    const res = await $fetch<CMSResponse<{ post_id: string }>>(`/api/post/delete?id=${postId}`, {
      method: 'DELETE',
      headers: { Authorization: authObject.value.accessToken },
      credentials: 'include',
    })

    if (res.status) {
      await refresh()
    }
  }
  catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="px-6 py-4 max-w-4xl mx-auto space-y-3">
    <template v-if="isLoading">
      <UCard v-for="i in 5" :key="i">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <USkeleton class="h-5 w-1/3" />
            <USkeleton class="h-4 w-2/3" />
            <div class="flex gap-4">
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-3 w-24" />
            </div>
            <div class="flex gap-1">
              <USkeleton v-for="j in 3" :key="j" class="h-5 w-12 rounded-full" />
            </div>
          </div>
          <USkeleton class="h-8 w-8 rounded-md" />
        </div>
      </UCard>
    </template>

    <template v-else-if="postList.length > 0">
      <UCard
        v-for="post in postList"
        :key="post.post_id"
        :ui="{ body: 'flex items-start justify-between gap-4' }"
      >
        <NuxtLink :to="`/managing-blog/update/${post.post_id}`" class="flex-1 min-w-0 space-y-2">
          <h2 class="font-semibold truncate">
            {{ post.title }}
          </h2>
          <p class="text-sm text-muted truncate">
            {{ post.description }}
          </p>
          <div class="flex items-center gap-4 text-xs text-muted">
            <span class="font-mono">{{ post.post_id }}</span>
            <time>{{ post.published_at }}</time>
          </div>
          <div v-if="post.tags?.length" class="flex flex-wrap gap-1">
            <UBadge
              v-for="tag in post.tags"
              :key="tag"
              variant="subtle"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
        </NuxtLink>

        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash"
          size="sm"
          @click.prevent="handleDeletePost(post.post_id)"
        />
      </UCard>
    </template>

    <UEmpty
      v-else
      icon="i-lucide-inbox"
      label="No posts available"
    />
  </div>
</template>
