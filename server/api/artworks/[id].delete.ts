// server/api/artworks/[id].delete.ts
import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // 1. Get the image URL first so we can delete the blob
  const artResult = await pool.query('SELECT image_url FROM artworks WHERE id = $1', [id])
  const artwork = artResult.rows[0]

  if (artwork) {
    // Extract filename from "/api/artworks/blob/123-file.jpg"
    const blobName = artwork.image_url.split('/').pop()
    const store = getStore('artworks')
    await store.delete(blobName)
  }

  // 2. Delete from Postgres
  await pool.query('DELETE FROM artworks WHERE id = $1', [id])

  return { message: 'Artwork and associated blob deleted' }
})