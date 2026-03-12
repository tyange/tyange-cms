export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<{ id_token: string }>(event)

  return await $fetch(`${config.public.tyangeCmsApiBase}/login/google`, {
    method: 'POST',
    body: {
      id_token: body.id_token,
    },
  })
})
