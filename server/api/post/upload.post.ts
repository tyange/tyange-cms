export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const body = await readBody(event)
  const authHeader = getRequestHeader(event, 'Authorization')

  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(`${config.public.tyangeCmsApiBase}/post/upload`, {
    method: 'POST',
    headers,
    body,
  })
})
