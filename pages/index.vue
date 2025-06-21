<script lang="ts" setup>
definePageMeta({
  layout: 'home',
})

const enteredId = ref('')
const enteredPassword = ref('')

async function handleSubmit() {
  try {
    const res = await $fetch(`https://tyange.hopto.org/cms/login`, {
      method: 'POST',
      body: {
        user_id: enteredId.value,
        password: enteredPassword.value,
      },
    })

    console.log(res)
  }
  catch (err) {
    console.log(err)
  }
}
</script>

<template>
  <form
    class="flex gap-5 flex-col"
    @submit.prevent="handleSubmit"
  >
    <label class="input">
      <span class="label">ID</span>
      <input
        v-model="enteredId"
        type="text"
      >
    </label>
    <label class="input">
      <span class="label">PW</span>
      <input
        v-model="enteredPassword"
        type="password"
        class="input"
      >

    </label>
    <button
      type="submit"
      class="btn"
    >
      로그인
    </button>
  </form>
</template>

<style scoped></style>
