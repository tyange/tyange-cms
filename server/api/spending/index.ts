export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const week = Array.isArray(query.week) ? query.week[0] : query.week
  const requestPath = week
    ? `${config.public.tyangeCmsApiBase}/budget/spending?week=${encodeURIComponent(String(week))}`
    : `${config.public.tyangeCmsApiBase}/budget/spending`

  const authHeader = getRequestHeader(event, 'Authorization')
  const headers = new Headers()

  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(requestPath, { headers })
})
