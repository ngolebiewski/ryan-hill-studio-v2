// server/api/series/reorder.post.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { orders } = body // Expecting [{ id, order_index, parent_id }, ...]

  if (!Array.isArray(orders)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const item of orders) {
      await client.query(
        `UPDATE series 
         SET order_index = $1, 
             parent_id = $2 
         WHERE id = $3`,
        [item.order_index, item.parent_id || null, item.id]
      )
    }

    await client.query('COMMIT')
    return { success: true }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Reorder Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update order' })
  } finally {
    client.release()
  }
})