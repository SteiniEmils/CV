import sharp from 'sharp'

export const UPLOAD_MAX_EDGE = 1400
export const UPLOAD_QUALITY = 75

export async function optimizeUploadImage(input) {
  const image = sharp(input, { failOn: 'truncated', animated: false }).rotate()
  const meta = await image.metadata()
  if (!meta.format || !meta.width || !meta.height) {
    throw new Error('Not a supported image')
  }

  const resized = image.resize({
    width: UPLOAD_MAX_EDGE,
    height: UPLOAD_MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (meta.hasAlpha) {
    return {
      buffer: await resized.webp({ quality: UPLOAD_QUALITY }).toBuffer(),
      ext: '.webp',
    }
  }

  return {
    buffer: await resized
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: UPLOAD_QUALITY, mozjpeg: true })
      .toBuffer(),
    ext: '.jpg',
  }
}
