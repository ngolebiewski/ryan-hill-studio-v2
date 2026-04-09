// server/api/pages/[slug].ts

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  // 1. Fetch the page content from the 'pages' table
  // We use the 'pool' auto-imported from server/utils/db.ts
  const pageRes = await pool.query(
    `SELECT id, title, slug, content_markdown, updated_at 
     FROM pages 
     WHERE slug = $1 LIMIT 1`,
    [slug]
  )

  const page = pageRes.rows[0]

  // 2. Error handling if the page doesn't exist
  if (!page) {
    throw createError({
      statusCode: 404,
      statusMessage: `Page "${slug}" not found`
    })
  }

  // 3. Return the page object
  return page
})