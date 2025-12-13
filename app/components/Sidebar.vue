<script setup lang="ts">
defineEmits<{ (e: 'handleCloseDrawer'): void }>()
</script>

<template>
  <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
    <li>
      <NuxtLink to="/managing-blog" @click="$emit('handleCloseDrawer')">
        블로그 관리
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
</style>
