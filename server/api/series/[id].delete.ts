// server/api/series/[id].delete.ts
import { pool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  console.log(`🗑️ [API] Attempting to delete Series ID: ${id}`)

  try {
    // 1. Check if this series has sub-series (children)
    const childCheck = await pool.query(
      'SELECT id FROM series WHERE parent_id = $1 LIMIT 1',
      [id]
    )

    // Use ?? 0 to satisfy TypeScript that this is always a number
    if ((childCheck.rowCount ?? 0) > 0) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Cannot delete a series that contains sub-series. Delete children first.' 
      })
    }

    // 2. Perform the deletion
    const res = await pool.query(
      'DELETE FROM series WHERE id = $1 RETURNING title',
      [id]
    )

    // Check again with ?? 0
    if ((res.rowCount ?? 0) === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Series not found' })
    }

    return { 
      message: `Successfully deleted series: ${res.rows[0].title}`,
      id 
    }
  } catch (err: any) {
    // ... rest of your error handling
    if (err.statusCode) throw err; // Re-throw createError objects
    
    console.error('❌ [API] Series Delete Error:', err)
    if (err.code === '23503') {
       throw createError({ 
         statusCode: 400, 
         statusMessage: 'Cannot delete: Artworks are still assigned to this series.' 
       })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})