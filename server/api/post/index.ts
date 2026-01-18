export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const query = getQuery(event)
  const postId = query.id

  return await $fetch(`${config.public.tyangeCmsApiBase}/post/${postId}`)
})
