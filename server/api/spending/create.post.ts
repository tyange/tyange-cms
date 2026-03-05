export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const authHeader = getRequestHeader(event, 'Authorization')
  const requestApiKey = getRequestHeader(event, 'X-API-Key')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  if (requestApiKey) {
    headers.append('X-API-Key', requestApiKey)
  }
  else if (config.tyangeCmsApiKey) {
    headers.append('X-API-Key', config.tyangeCmsApiKey)
  }

  return await $fetch(`${config.public.tyangeCmsApiBase}/budget/spending`, {
    method: 'POST',
    headers,
    body,
  })
})
