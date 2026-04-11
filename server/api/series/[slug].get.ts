// server/api/series/[slug].get.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Try three different ways to resolve the parameter
  const slugFromParam = getRouterParam(event, 'slug')
  const slugFromContext = event.context.params?.slug
  const slugFromPath = getRequestPath(event).split('/').pop()

  const slug = slugFromParam || slugFromContext || slugFromPath

  console.log(`📡 [DEBUG] Resolution - Param: ${slugFromParam}, Context: ${slugFromContext}, Path: ${slugFromPath}`)

  if (!slug || slug === 'undefined' || slug === 'api') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: `Route parameter 'slug' is missing. Filename must be [slug].get.ts` 
    })
  }

  try {
    const seriesRes = await pool.query(
      'SELECT * FROM series WHERE slug = $1 LIMIT 1',
      [slug]
    )

    if (seriesRes.rowCount === 0) {
      throw createError({ statusCode: 404, statusMessage: `Series "${slug}" not found` })
    }

    const series = seriesRes.rows[0]
    
    const [children, artworks] = await Promise.all([
      pool.query('SELECT * FROM series WHERE parent_id = $1 ORDER BY order_index ASC', [series.id]),
      pool.query('SELECT * FROM artworks WHERE series_id = $1 ORDER BY order_index ASC', [series.id])
    ])

    return {
      series,
      children: children.rows,
      artworks: artworks.rows
    }
  } catch (err: any) {
    console.error('🔥 [DEBUG] DB Error:', err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})