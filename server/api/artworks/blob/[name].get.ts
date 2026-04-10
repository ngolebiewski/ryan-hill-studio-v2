import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) throw createError({ statusCode: 400 })

  const store = getStore('artworks')
  const blob = await store.get(name, { type: 'stream' })

  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  // Set the correct content type if you want (optional, but good practice)
  // setResponseHeader(event, 'Content-Type', 'image/jpeg')
  
  return blob
})