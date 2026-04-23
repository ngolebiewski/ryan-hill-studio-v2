import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const formData = await readMultipartFormData(event)
  
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data received' })

  const fields: Record<string, string> = {}
  let imageFile: { data: Buffer; name: string } | null = null
  let videoFile: { data: Buffer; name: string } | null = null

  const MAX_VIDEO_SIZE = 10 * 1024 * 1024

  // 1. Parse all incoming parts
  for (const item of formData) {
    if (item.name === 'image' && item.filename) {
      imageFile = { data: item.data, name: `${Date.now()}-img-${item.filename.replace(/\s+/g, '-')}` }
    } else if (item.name === 'video_file' && item.filename) {
      if (item.data.length > MAX_VIDEO_SIZE) throw createError({ statusCode: 413, statusMessage: 'Video > 10MB' })
      videoFile = { data: item.data, name: `${Date.now()}-vid-${item.filename.replace(/\s+/g, '-')}` }
    } else if (item.name) {
      fields[item.name] = item.data.toString()
    }
  }

  try {
    const store = getStore('artworks')
    
    // Start building the dynamic query
    // We start with the basic text fields that are always present
    let updateFields = [
      `title = $1`,
      `description = $2`,
      `size = $3`,
      `medium = $4`,
      `alt_text = $5`,
      `series_id = $6`,
      `year = $7`,
      `is_video = $8`,
      `video_url = $9`
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

    // 2. Handle Image Upload Update
    if (imageFile) {
      //@ts-ignore - because we don't care about the Buffer vs Uint8Array battle
      await store.set(imageFile.name, imageFile.data)
      updateFields.push(`image_url = $${queryParams.length + 1}`)
      queryParams.push(`/api/artworks/blob/${imageFile.name}`)
    }

    // 3. Handle Video File Upload Update
    if (videoFile) {
      //@ts-ignore
      await store.set(videoFile.name, videoFile.data)
      // If a file is uploaded, it overrides whatever was in the video_url text field
      const videoUrlIdx = 9 // This is the index of video_url in our initial array
      queryParams[videoUrlIdx - 1] = `/api/artworks/blob/${videoFile.name}`
    }

    // Add ID as the final parameter
    queryParams.push(id)
    const idParamIndex = queryParams.length

    const query = `
      UPDATE artworks 
      SET ${updateFields.join(', ')}
      WHERE id = $${idParamIndex} 
      RETURNING *
    `

    const res = await pool.query(query, queryParams)
    return res.rows[0]

  } catch (err) {
    console.error('Update Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database update failed' })
  }
})