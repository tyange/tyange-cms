<script setup lang="ts">
import type { PostListItem } from '~/types/post-list-item.types'
import type { CMSResponse } from '~/types/response.types'

definePageMeta({
  layout: 'default',
})

const config = useRuntimeConfig()

const { data } = await useFetch<CMSResponse<{ posts: PostListItem[] }>>(`${config.public.tyangeCmsApiBase}/posts`)

const postList = computed(() => data.value?.data.posts ?? [])
</script>

<template>
  <div class="w-full h-full">
    <ul v-if="postList.length > 0" class="w-full h-full p-10 flex flex-col items-center space-y-6">
      <li v-for="post in postList" :key="post.post_id" class="w-full max-w-3xl bg-gray-800/50 border border-gray-700 shadow-lg rounded-2xl p-6 text-gray-300 transition-all duration-300 backdrop-blur-sm">
        <NuxtLink :to="`/managing-blog/${post.post_id}`">
          <div class="flex flex-col gap-6">
            <div>
              <label class="text-xs text-gray-500 font-medium mb-2 block">
                TITLE
              </label>
              <h2 class="text-xl font-semibold text-white leading-tight break-words">
                {{ post.title }}
              </h2>
            </div>
            <div>
              <label class="text-xs text-gray-500 font-medium mb-2 block">
                DESCRIPTION
              </label>
              <p class="text-base text-gray-300">
                {{ post.description }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label class="text-xs text-gray-500 font-medium mb-2 block">
                  POST ID
                </label>
                <span class="text-base text-gray-300">
                  {{ post.post_id }}
                </span>
              </div>
              <div>
                <label class="text-xs text-gray-500 font-medium mb-2 block">
                  PUBLISHED
                </label>
                <time class="text-base text-gray-300">
                  {{ post.published_at }}
                </time>
              </div>
            </div>
            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
              <label class="text-xs text-gray-500 font-medium w-full mb-2">
                TAGS
              </label>
              <span v-for="tag in post.tags" :key="tag" class="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-600">
                {{ tag }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="flex items-center justify-center h-64">
      <p class="text-gray-500 text-lg">
        No posts available
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
