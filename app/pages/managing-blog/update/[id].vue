<script setup lang="ts">
import type { PostListItem } from '~/types/post-list-item.types'

const route = useRoute()

const { data } = await useFetch<PostListItem>(`/api/post?id=${route.params.id}`)
</script>

<template>
  <Editor v-if="data" :data="data" />
</template>

<style scoped>

</style>
