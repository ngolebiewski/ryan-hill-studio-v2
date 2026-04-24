import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data' })

  const fields: Record<string, string> = {}
  let imageFile: { data: Buffer; name: string; type: string } | null = null
  let videoFile: { data: Buffer; name: string; type: string } | null = null

  // 1. Parse Multipart Form Data
  for (const item of formData) {
    if (!item.name) continue

    if (item.name === 'image' && item.filename) {
      imageFile = {
        data: item.data,
        name: `${Date.now()}-img-${item.filename.replace(/\s+/g, '-')}`,
        type: item.type || 'image/jpeg'
      }
    } else if (item.name === 'video_file' && item.filename) {
      videoFile = {
        data: item.data,
        name: `${Date.now()}-vid-${item.filename.replace(/\s+/g, '-')}`,
        type: item.type || 'video/mp4'
      }
    } else {
      fields[item.name] = item.data.toString()
    }
  }

  // 2. Validation
  const hasImage = imageFile || (fields.image_url && fields.image_url.length > 0)
  if (!fields.title || !hasImage) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Title or Image' })
  }

  try {
    const artworksStore = getStore('artworks')
    let finalImageUrl = fields.image_url || '' 
    let finalVideoUrl = fields.video_url || null 

    // 3. Upload Image Blob
    if (imageFile) {
      // @ts-ignore
      await artworksStore.set(imageFile.name, imageFile.data, { contentType: imageFile.type })
      finalImageUrl = `/api/artworks/blob/${imageFile.name}`
    }

    // 4. Upload Video Blob
    if (videoFile) {
      // @ts-ignore
      await artworksStore.set(videoFile.name, videoFile.data, { contentType: videoFile.type })
      finalVideoUrl = `/api/artworks/blob/${videoFile.name}`
    }

    // 5. Preparation & DB Insert
    const slug = fields.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
    const isVideo = fields.is_video === 'true' || !!videoFile || (fields.video_url?.includes('youtube'))
    const finalAlt = fields.alt_text || `${fields.title}${fields.medium ? ', ' + fields.medium : ''}`

    const res = await pool.query(
      `INSERT INTO artworks (
        title, slug, image_url, video_url, is_video, 
        year, description, size, medium, alt_text, series_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        fields.title, slug, finalImageUrl, finalVideoUrl, isVideo, 
        fields.year ? parseInt(fields.year) : null,
        fields.description || '', fields.size || '', 
        fields.medium || '', finalAlt, fields.series_id || null
      ]
    )
    return res.rows[0]
  } catch (err) {
    console.error('❌ Artwork Post Error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Database save failed' })
  }
})