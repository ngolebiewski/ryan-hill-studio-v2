// server/api/pages/index.post.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { title, slug, content_markdown } = await readBody(event)
  
  console.log(`🆕 [API] Creating new page: ${title}`)

  try {
    const res = await pool.query(
      `INSERT INTO pages (title, slug, content_markdown, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [title, slug, content_markdown]
    )
    return res.rows[0]
  } catch (err) {
    console.error('❌ [API] Create Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to create page' })
  }
})