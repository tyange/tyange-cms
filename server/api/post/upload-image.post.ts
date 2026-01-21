export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const postId = query.id

  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded',
    })
  }

  const authHeader = getRequestHeader(event, 'Authorization')

  const newFormData = new FormData()
  formData.forEach((part) => {
    if (part.name === 'file' && part.data) {
      const blob = new Blob([part.data], { type: part.type })
      newFormData.append('file', blob, part.filename || 'image.jpg')
    }
  })

  return await $fetch(`${config.public.tyangeCmsApiBase}/upload-image?post_id=${postId}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader || '',
    },
    body: newFormData,
  })
})
