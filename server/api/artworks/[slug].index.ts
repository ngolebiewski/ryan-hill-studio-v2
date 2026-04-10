// server/api/artworks/[slug].ts

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

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
      statusMessage: `Artwork "${slug}" not found`
    })
  }

  return artwork
})