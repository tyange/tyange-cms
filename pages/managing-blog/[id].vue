<script setup lang="ts">
import type { PostListItem } from '~/types/post-list-item.types'

const config = useRuntimeConfig()

const route = useRoute()

const { data } = await useFetch<PostListItem>(`${config.public.tyangeCmsApiBase}/post/${route.params.id}`)
</script>

<template>
  <Editor v-if="data" :data="data" />
</template>

<style scoped>

</style>
