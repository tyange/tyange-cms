<script setup lang="ts">
import DashBoardHeader from '~/components/DashBoardHeader.vue'
</script>

<template>
  <div>
    <div>
      <DashBoardHeader />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>

</style>
