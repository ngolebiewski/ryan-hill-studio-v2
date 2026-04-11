// server/api/artworks/blob/[name].get.ts
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) throw createError({ statusCode: 400 })

  const store = getStore('artworks')
  const blob = await store.get(name, { type: 'stream' })

  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  // Optional: Set long-term caching for better performance
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  
  return blob
})