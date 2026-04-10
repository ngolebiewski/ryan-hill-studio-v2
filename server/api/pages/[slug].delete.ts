// server/api/pages/[slug].delete.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  console.log(`🗑️ [API] Deleting page: ${slug}`)

  try {
    const res = await pool.query(
      'DELETE FROM pages WHERE slug = $1 RETURNING title',
      [slug]
    )

    if (res.rowCount === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }

    return { 
      message: `Successfully deleted ${res.rows[0].title}`,
      slug 
    }
  } catch (err) {
    console.error('❌ [API] Delete Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete page' })
  }
})