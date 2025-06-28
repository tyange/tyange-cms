<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

defineEmits<{ (e: 'handleOpenDrawer'): void }>()
</script>

<template>
  <header>
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <button class="btn drawer-button btn-square btn-ghost" @click="$emit('handleOpenDrawer')">
          <Menu />
        </button>
        <div class="flex-1">
          <a class="btn btn-ghost text-xl">tyange-cms</a>
        </div>
        <div class="flex-none" />
      </div>
    </div>
  </header>
</template>

<style scoped>

</style>
