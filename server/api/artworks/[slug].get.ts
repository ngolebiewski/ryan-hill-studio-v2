// server/api/artworks/[slug].get.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Option A: Standard Nuxt way
  let slug = getRouterParam(event, 'slug')

  // Option B: Fallback if Option A is undefined (manual parse)
  if (!slug) {
    const urlParts = event.path.split('/')
    //@ts-ignore
    slug = urlParts[urlParts.length - 1].split('?')[0]
  }

  console.log('Final extracted slug:', slug)

  if (!slug || slug === 'artworks') {
     throw createError({ statusCode: 400, statusMessage: 'Could not parse slug' })
  }

  try {
    const result = await pool.query(
      `SELECT a.*, s.title as series_title, s.slug as series_slug 
       FROM artworks a
       LEFT JOIN series s ON a.series_id = s.id
       WHERE a.slug = $1 LIMIT 1`,
      [slug]
    )

    const artwork = result.rows[0]

    if (!artwork) {
      throw createError({
        statusCode: 404,
        statusMessage: `Artwork "${slug}" not found in database`
      })
    }

    return artwork
  } catch (error: any) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})