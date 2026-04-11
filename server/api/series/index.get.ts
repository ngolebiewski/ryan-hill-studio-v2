// server/api/series/index.ts

export default defineEventHandler(async (event) => {
  try {
    // Fetch all series, ordered by their custom index
    const res = await pool.query(`
      SELECT * FROM series 
      ORDER BY order_index ASC, title ASC
    `)

    return res.rows
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch series list',
    })
  }
})