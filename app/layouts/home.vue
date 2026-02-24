<script setup lang="ts">

</script>

<template>
  <div class="w-screen h-screen flex flex-col">
    <DashBoardHeader />
    <UMain class="flex-1 flex items-center justify-center">
      <slot />
    </UMain>
  </div>
</template>

<style scoped>

</style>
