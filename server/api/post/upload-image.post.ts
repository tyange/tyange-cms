export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const query = getQuery(event)
  const postId = query.id

  const body = await readBody(event)

  const authHeader = getRequestHeader(event, 'Authorization')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }
  headers.append('Content-Type', 'multipart/form-data')

  return await $fetch(`${config.public.tyangeCmsApiBase}/upload-image?post_id=${postId}`, {
    method: 'POST',
    headers,
    body,
  })
})
