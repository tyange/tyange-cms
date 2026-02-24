<template>
  <div class="w-screen h-screen flex flex-col">
    <DashBoardHeader />
    <UMain class="flex-1 p-5">
      <slot />
    </UMain>
  </div>
</template>
