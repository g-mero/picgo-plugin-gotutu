import { extname } from 'node:path'
import type { IReqOptions, PicGo } from 'picgo'
import FormData from 'form-data'
import type { UserConfig } from './config'
import { bedName } from './config'
import CompressImg, { isSupportImg } from './tinypng'

export const handle = async (ctx: PicGo): Promise<PicGo> => {
  const userConfig: UserConfig = ctx.getConfig(bedName)
  if (!userConfig) {
    throw new Error('没有找到配置')
  }

  let apiUrl = `${userConfig.url}/api/upload`

  const imgList = ctx.output

  for (const img of imgList) {
    try {
      let buffer = img.buffer || Buffer.from(img.base64Image, 'base64')
      const fileName = img.fileName

      // 图片压缩
      if (userConfig.compressed === '开启') {
        // gotutu自带的压缩
        apiUrl += '?compress=true'
      } else if (userConfig.tinypng === '开启') {
        if (!isSupportImg(extname(fileName))) {
          ctx.log.warn(`tinypng不支持压缩 ${fileName} , 使用默认压缩`)
          apiUrl += '?compress=true'
        } else {
          ctx.log.info(`[tinypng压缩]: ${fileName}`)
          // tinypng压缩
          buffer = await CompressImg(buffer)
        }
      }

      const formData = new FormData()
      formData.append('file', buffer, fileName)

      const length = formData.getLengthSync()

      ctx.log.info(`[上传]: ${fileName}, ${length} bytes`)

      const postOption: IReqOptions = {
        method: 'POST',
        url: apiUrl,
        headers: {
          'API-KEY': userConfig.token,
          'Content-Type': 'multipart/form-data',
          'Content-Length': length,
        },
        resolveWithFullResponse: true,
        data: formData,
      }
      const res = await ctx.request<string, IReqOptions>(postOption)
      ctx.log.info(`[响应]: ${res.statusCode}`)
      if (res.statusCode !== 200 || !res.data) {
        ctx.log.error(`[错误]: ${res.statusText}`)
        throw new Error(res.statusText)
      } else {
        ctx.log.info(`[成功]: ${res.data}`)
        delete img.base64Image
        delete img.buffer
        img.imgUrl = `${userConfig.url}/pic/${res.data}?size=small`
      }
    } catch (err) {
      ctx.log.error(err)
      ctx.emit('notification', {
        title: '上传失败',
        body: err.message,
      })
    }
  }

  return ctx
}
