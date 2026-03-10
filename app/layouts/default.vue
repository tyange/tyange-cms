<template>
  <div class="flex min-h-screen flex-col">
    <DashBoardHeader />
    <UMain class="flex flex-1 px-5 py-6">
      <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <slot />
      </div>
    </UMain>
  </div>
</template>
