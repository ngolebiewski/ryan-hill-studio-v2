// server/api/artworks/index.post.ts
import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data' })

  const fields: Record<string, string> = {}
  let fileData: Buffer | null = null
  let fileName = ''
  let fileType = ''

  for (const item of formData) {
    if (item.name === 'image' && item.filename) {
      fileData = item.data
      // Clean filename for URL safety
      fileName = `${Date.now()}-${item.filename.replace(/\s+/g, '-')}`
      fileType = item.type || 'image/jpeg'
    } else if (item.name) {
      fields[item.name] = item.data.toString()
    }
  }

  if (!fileData || !fields.title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Title or Image' })
  }

  // 1. Upload to Netlify Blob Storage
  const artworksStore = getStore('artworks')
  // @ts-ignore
  await artworksStore.set(fileName, fileData, { contentType: fileType })

  // 2. Prepare Database Data
  const imageUrl = `/api/artworks/blob/${fileName}`
  const slug = fields.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
  
  // Auto-generate Alt Text if empty
  const finalAlt = fields.alt_text || `${fields.title}${fields.medium ? ', ' + fields.medium : ''}`

  try {
    const res = await pool.query(
      `INSERT INTO artworks (title, slug, image_url, description, size, medium, alt_text, series_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        fields.title, 
        slug, 
        imageUrl, 
        fields.description || '', 
        fields.size || '', 
        fields.medium || '', 
        finalAlt, 
        fields.series_id || null
      ]
    )
    return res.rows[0]
  } catch (err) {
    console.error('❌ Artwork Post Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database save failed' })
  }
})