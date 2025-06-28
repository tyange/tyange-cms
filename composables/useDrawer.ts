export function useDrawer() {
  const isOpen = ref(false)

  function handleOpenDrawer() {
    isOpen.value = true
  }

  function handleCloseDrawer() {
    isOpen.value = false
  }

  return {
    isOpen,
    handleOpenDrawer,
    handleCloseDrawer,
  }
}
