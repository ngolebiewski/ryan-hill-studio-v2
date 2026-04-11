import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { title, description, parent_id } = await readBody(event)
  
  // 1. Automate the Slug
  const slug = title.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

  // 2. Get the next order index
  const countRes = await pool.query('SELECT COUNT(*) FROM series WHERE parent_id IS NOT DISTINCT FROM $1', [parent_id])
  const nextOrder = parseInt(countRes.rows[0].count)

  try {
    const res = await pool.query(
      `INSERT INTO series (title, slug, description, parent_id, order_index) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, slug, description, parent_id, nextOrder]
    )
    return res.rows[0]
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Slug must be unique' })
  }
})