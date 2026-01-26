<script setup lang="ts">
defineEmits<{ (e: 'handleCloseDrawer'): void }>()
</script>

<template>
  <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
    <li>
      <NuxtLink to="/managing-blog" @click="$emit('handleCloseDrawer')">
        포스트 목록
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/managing-blog/create" @click="$emit('handleCloseDrawer')">
        새 글 쓰기
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
</style>
