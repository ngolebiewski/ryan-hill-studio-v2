import { pool } from '../../utils/db'

export default defineEventHandler(async () => {
  const res = await pool.query(`
    SELECT * FROM artworks
    ORDER BY order_index ASC, created_at DESC
  `)

  return res.rows
})