export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const query = getQuery(event)
  const postId = query.id

  const body = await readBody<{ formData: FormData }>(event)

  const authHeader = getRequestHeader(event, 'Authorization')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(`${config.public.tyangeCmsApiBase}/upload-image?post_id=${postId}`, {
    method: 'POST',
    headers,
    body: body.formData,
  })
})
