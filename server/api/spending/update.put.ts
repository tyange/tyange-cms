export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const body = await readBody(event)

  const recordId = Array.isArray(query.id) ? query.id[0] : query.id

  if (!recordId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'record id is required',
    })
  }

  const authHeader = getRequestHeader(event, 'Authorization')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(`${config.public.tyangeCmsApiBase}/budget/spending/${String(recordId)}`, {
    method: 'PUT',
    headers,
    body,
  })
})
