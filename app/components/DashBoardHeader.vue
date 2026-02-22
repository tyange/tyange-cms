<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() =>
  [
    {
      label: '포스트 목록',
      to: '/managing-blog',
      active: route.path === '/managing-blog',
    },
    {
      label: '새 글 쓰기',
      to: '/managing-blog/create',
      active: route.path === '/managing-blog/create',
    },
  ],

)
</script>

<template>
  <UHeader title="tyange-cms">
    <UNavigationMenu :items="items" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<style scoped></style>
