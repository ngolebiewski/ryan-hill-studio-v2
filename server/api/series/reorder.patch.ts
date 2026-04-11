// server/api/series/reorder.patch.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { artworkIds } = await readBody(event)

  try {
    // We use a transaction to ensure all updates succeed or all fail
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      for (let i = 0; i < artworkIds.length; i++) {
        await client.query(
          'UPDATE artworks SET order_index = $1 WHERE id = $2',
          [i, artworkIds[i]]
        )
      }
      
      await client.query('COMMIT')
      return { success: true }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Reorder failed' })
  }
})