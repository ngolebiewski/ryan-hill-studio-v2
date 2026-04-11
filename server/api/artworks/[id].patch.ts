import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const formData = await readMultipartFormData(event)
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No data received' })
  }

  const fields: Record<string, string> = {}
  let fileData: Buffer | null = null
  let fileName = ''
  let fileType = ''

  // Parse the fields and the file
  for (const item of formData) {
    if (item.name === 'image' && item.filename) {
      fileData = item.data
      fileName = `${Date.now()}-${item.filename.replace(/\s+/g, '-')}`
      fileType = item.type || 'image/jpeg'
    } else if (item.name) {
      fields[item.name] = item.data.toString()
    }
  }

  try {
    // 1. If a new image was uploaded, handle the Blob storage
    let imageUrlUpdate = ''
    let queryParams = [
      fields.title, 
      fields.description, 
      fields.size, 
      fields.medium, 
      fields.alt_text, 
      fields.series_id || null, 
      id
    ]

    if (fileData) {
      const store = getStore('artworks')
      //@ts-ignore
      await store.set(fileName, fileData, { contentType: fileType })
      imageUrlUpdate = `, image_url = $8`
      queryParams.push(`/api/artworks/blob/${fileName}`)
    }

    // 2. Update the Database
    const res = await pool.query(
      `UPDATE artworks 
       SET title = $1, 
           description = $2, 
           size = $3, 
           medium = $4, 
           alt_text = $5, 
           series_id = $6
           ${imageUrlUpdate}
       WHERE id = $7 RETURNING *`,
      queryParams
    )

    return res.rows[0]
  } catch (err) {
    console.error('Update Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database update failed' })
  }
})