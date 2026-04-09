// import { pool } from '~/server/utils/db'
import { pool } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const series = await pool.query(
    `SELECT * FROM series WHERE slug = $1`,
    [slug]
  )

  const artworks = await pool.query(
    `SELECT * FROM artworks WHERE series_id = $1 ORDER BY order_index`,
    [series.rows[0].id]
  )

  return {
    series: series.rows[0],
    artworks: artworks.rows
  }
})