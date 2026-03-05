export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const authHeader = getRequestHeader(event, 'Authorization')

  const multipart = await readMultipartFormData(event)
  if (!multipart?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'multipart/form-data body is required',
    })
  }

  const formData = new FormData()

  for (const field of multipart) {
    if (!field.name) {
      continue
    }

    if (field.filename) {
      const blob = new Blob([field.data], {
        type: field.type || 'application/octet-stream',
      })
      formData.append(field.name, blob, field.filename)
      continue
    }

    formData.append(field.name, field.data.toString('utf8'))
  }

  const headers = new Headers()
  if (authHeader) {
    headers.append('Authorization', authHeader)
  }

  return await $fetch(`${config.public.tyangeCmsApiBase}/budget/card-excel/remaining-weekly-budget`, {
    method: 'POST',
    headers,
    body: formData,
  })
})
