import { downloadFile, uploadImg } from './utils'

export default async function CompressImg (buffer: Buffer): Promise<Buffer> {
  const tinypngedUrl = await uploadImg(buffer)
  const compressData = await downloadFile(tinypngedUrl)

  return compressData
}

export function isSupportImg (ext: string): boolean {
  const lowerExt = ext.toLowerCase()

  const tinyExt = ['.webp', '.png', '.jpg']

  return tinyExt.includes(lowerExt)
}
