export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const query = getQuery(event)
  const postId = query.id

  return await $fetch(`${config.public.tyangeCmsApiBase}/post/${postId}`)
})
