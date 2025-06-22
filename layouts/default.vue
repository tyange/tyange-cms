<script setup lang="ts">
import DashBoardHeader from '~/components/DashBoardHeader.vue'
import Sidebar from '~/components/Sidebar.vue'
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle">
    <div class="drawer-content">
      <main class="w-dvw h-dvh flex flex-col">
        <DashBoardHeader />
        <slot />
      </main>
    </div>
    <div class="drawer-side">
      <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" />
      <Sidebar />
    </div>
  </div>
</template>

<style scoped>

</style>
