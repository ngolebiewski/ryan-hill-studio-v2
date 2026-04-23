// server/api/artworks/[id].patch.ts
import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const formData = await readMultipartFormData(event)
  
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data' })

  const fields: Record<string, string> = {}
  let imageFile: { data: Buffer; name: string } | null = null
  let videoFile: { data: Buffer; name: string } | null = null

  // 1. Parse all incoming parts
  for (const item of formData) {
    if (item.name === 'image' && item.filename) {
      imageFile = { data: item.data, name: `${Date.now()}-img-${item.filename.replace(/\s+/g, '-')}` }
    } else if (item.name === 'video_file' && item.filename) {
      videoFile = { data: item.data, name: `${Date.now()}-vid-${item.filename.replace(/\s+/g, '-')}` }
    } else if (item.name) {
      fields[item.name] = item.data.toString()
    }
  }

  try {
    const store = getStore('artworks')
    
    // 2. Build the Base Query (The columns that always get updated)
    let updateParts = [
      'title = $1', 'description = $2', 'size = $3', 'medium = $4', 
      'alt_text = $5', 'series_id = $6', 'year = $7', 'is_video = $8', 'video_url = $9'
    ]

    let queryParams: any[] = [
      fields.title,
      fields.description || '',
      fields.size || '',
      fields.medium || '',
      fields.alt_text || '',
      fields.series_id ? parseInt(fields.series_id) : null,
      fields.year ? parseInt(fields.year) : null,
      fields.is_video === 'true',
      fields.video_url || null
    ]

    // 3. Conditional Image Update
    if (imageFile) {
      //@ts-ignore
      await store.set(imageFile.name, imageFile.data)
      updateParts.push(`image_url = $${queryParams.length + 1}`)
      queryParams.push(`/api/artworks/blob/${imageFile.name}`)
    }

    // 4. Conditional Video File Update (Overrides the video_url text field if present)
    if (videoFile) {
      //@ts-ignore
      await store.set(videoFile.name, videoFile.data)
      const videoUrlParamIndex = 8 // index 8 in the queryParams array corresponds to $9 (video_url)
      queryParams[videoUrlParamIndex] = `/api/artworks/blob/${videoFile.name}`
    }

    // Push ID as the final parameter for the WHERE clause
    queryParams.push(id)
    const finalQuery = `
      UPDATE artworks 
      SET ${updateParts.join(', ')} 
      WHERE id = $${queryParams.length} 
      RETURNING *`

    const res = await pool.query(finalQuery, queryParams)
    return res.rows[0]

  } catch (err) {
    console.error('❌ Patch Update Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database update failed' })
  }
})