<script setup lang="ts">
import NotReadyYet from '~/components/NotReadyYet.vue'

definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <div>
    <NotReadyYet />
  </div>
</template>

<style scoped>

</style>
