// server/api/pages/[slug].put.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  console.log(`💾 [API] Updating page content for slug: ${slug}`)

  try {
    // We update based on slug, setting the content and refreshing updated_at
    const res = await pool.query(
      `UPDATE pages 
       SET content_markdown = $1, updated_at = NOW() 
       WHERE slug = $2 
       RETURNING id, title, updated_at`,
      [body.content_markdown, slug]
    )

    if (res.rowCount === 0) {
      console.log(`❌ [API] Page "${slug}" not found for update`)
      throw createError({
        statusCode: 404,
        statusMessage: `Page "${slug}" not found`
      })
    }

    console.log(`✅ [API] Update successful for: ${res.rows[0].title}`)
    return res.rows[0]
  } catch (err) {
    console.error('❌ [API] Database Error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update page'
    })
  }
})