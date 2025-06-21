<script setup lang="ts">
import DashBoardHeader from '~/components/DashBoardHeader.vue'
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle">
    <div class="drawer-content">
      <main>
        <DashBoardHeader />
        <p>default</p>
      </main>
    </div>
    <div class="drawer-side">
      <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" />
      <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        <li><a>Sidebar Item 1</a></li>
        <li><a>Sidebar Item 2</a></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>
