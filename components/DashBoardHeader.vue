<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
</script>

<template>
  <header>
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <label for="my-drawer" class="btn drawer-button btn-square btn-ghost"><Menu /></label>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">tyange-cms</a>
      </div>
      <div class="flex-none" />
    </div>
  </header>
</template>

<style scoped>

</style>
