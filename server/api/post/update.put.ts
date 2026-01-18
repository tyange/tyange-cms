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

  return await $fetch(`${config.public.tyangeCmsApiBase}/post/update/${postId}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'content-type': 'application/json',
    },
    body,
  })
})
