// server/api/series/[slug].ts
// import { pool } from '~/server/api/utils/db'
// import { pool } from '#server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  // 1. Fetch the main series first
  const seriesRes = await pool.query(
    `SELECT * FROM series WHERE slug = $1 LIMIT 1`,
    [slug]
  )
  const series = seriesRes.rows[0]

  // 🚨 MUST check existence before querying children
  if (!series) {
    throw createError({
      statusCode: 404,
      statusMessage: `Series with slug "${slug}" not found`
    })
  }

  // 2. Run child series and artworks queries in parallel (faster performance)
  const [childrenRes, artworksRes] = await Promise.all([
    pool.query(
      `SELECT * FROM series WHERE parent_id = $1 ORDER BY order_index ASC`,
      [series.id]
    ),
    pool.query(
      `SELECT * FROM artworks WHERE series_id = $1 ORDER BY order_index ASC, created_at DESC`,
      [series.id]
    )
  ])

  return {
    series,
    children: childrenRes.rows,
    artworks: artworksRes.rows
  }
})