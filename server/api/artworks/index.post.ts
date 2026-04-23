import { pool } from '~/server/utils/db'
import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No data' })

  const fields: Record<string, string> = {}
  let imageFile: { data: Buffer; name: string; type: string } | null = null
  let videoFile: { data: Buffer; name: string; type: string } | null = null

  const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10MB

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
      if (item.data.length > MAX_VIDEO_SIZE) {
        throw createError({ statusCode: 413, statusMessage: 'Video exceeds 10MB limit' })
      }
      videoFile = {
        data: item.data,
        name: `${Date.now()}-vid-${item.filename.replace(/\s+/g, '-')}`,
        type: item.type || 'video/mp4'
      }
    } else {
      fields[item.name] = item.data.toString()
    }
  }

  // Validation
  if (!imageFile || !fields.title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Title or Image' })
  }

  const artworksStore = getStore('artworks')

  // 2. Upload Image (Still/Thumbnail)
  // Converting Buffer to Uint8Array.from() satisfies the BlobInput type
  //@ts-ignore
  await artworksStore.set(imageFile.name, Uint8Array.from(imageFile.data))
  const finalImageUrl = `/api/artworks/blob/${imageFile.name}`

  // 3. Handle Video Logic
  let finalVideoUrl = fields.video_url || null 

  
  if (videoFile) {
    //@ts-ignore
    await artworksStore.set(videoFile.name, Uint8Array.from(videoFile.data))
    finalVideoUrl = `/api/artworks/blob/${videoFile.name}`
  }

  // 4. Data Preparation
  const slug = fields.slug || fields.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
  const isVideo = fields.is_video === 'true' || !!videoFile
  const year = fields.year ? parseInt(fields.year) : null
  const seriesId = fields.series_id ? parseInt(fields.series_id) : null

  try {
    const res = await pool.query(
      `INSERT INTO artworks (
        title, slug, image_url, video_url, is_video, year, 
        description, size, medium, alt_text, series_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        fields.title, 
        slug, 
        finalImageUrl, 
        finalVideoUrl, 
        isVideo, 
        year, 
        fields.description || '', 
        fields.size || '', 
        fields.medium || '', 
        fields.alt_text || '', 
        seriesId
      ]
    )
    return res.rows[0]
  } catch (err: any) {
    console.error('❌ Artwork Post Error:', err)
    if (err.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Database save failed' })
  }
})