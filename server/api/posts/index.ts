export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authHeader = getRequestHeader(event, 'Authorization')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(
    `${config.public.tyangeCmsApiBase}/admin/posts`,
    {
      headers,
    },
  )
})
