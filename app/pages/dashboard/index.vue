<script setup lang="ts">
import NotReadyYet from '~/components/NotReadyYet.vue'

definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <div class="flex-1 flex justify-center items-center">
    <NotReadyYet />
  </div>
</template>

<style scoped>

</style>
