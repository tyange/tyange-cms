<script setup lang="ts">
import DashBoardHeader from '~/components/DashBoardHeader.vue'
import Sidebar from '~/components/Sidebar.vue'
import { useDrawer } from '~/composables/useDrawer'

const { isOpen, handleOpenDrawer, handleCloseDrawer } = useDrawer()
</script>

<template>
  <div class="drawer">
    <input type="checkbox" class="drawer-toggle" :checked="isOpen">
    <div class="drawer-content">
      <main class="w-dvw h-dvh flex flex-col">
        <DashBoardHeader @handle-open-drawer="handleOpenDrawer" />
        <slot />
      </main>
    </div>
    <div class="drawer-side">
      <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" @click="handleCloseDrawer" />
      <Sidebar @handle-close-drawer="handleCloseDrawer" />
    </div>
  </div>
</template>

<style scoped>

</style>
