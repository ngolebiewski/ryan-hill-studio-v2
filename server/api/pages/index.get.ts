// server/api/pages/index.get.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  console.log('📄 [API] Fetching all pages for management')
  try {
    const res = await pool.query(`
      SELECT id, slug, title, content_markdown, updated_at 
      FROM pages 
      ORDER BY title ASC
    `)
    return res.rows
  } catch (err) {
    console.error('❌ [API] Page fetch error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database Error' })
  }
})