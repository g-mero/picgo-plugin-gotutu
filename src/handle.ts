import { IOldReqOptions, PicGo } from 'picgo'
import { UserConfig, bedName } from './config'
import CompressImg, { isSupportImg } from './tinypng'
import { extname } from 'path'

export const handle = async (ctx: PicGo): Promise<PicGo> => {
  const userConfig: UserConfig = ctx.getConfig(bedName)
  if (!userConfig) {
    throw new Error('没有找到配置')
  }

  let apiUrl = userConfig.url + '/api/upload'

  const imgList = ctx.output

  for (let i = 0; i < imgList.length; i += 1) {
    try {
      const img = imgList[i]
      let buffer = img.buffer || Buffer.from(img.base64Image, 'base64')
      const fileName = imgList[i].fileName

      ctx.log.info(`[文件后缀] ${extname(fileName)}`)

      // 图片压缩
      if (userConfig.compressed === '开启') {
        // gotutu自带的压缩
        apiUrl += '?compress=true'
      } else if (userConfig.tinypng === '开启' && isSupportImg(extname(fileName))) {
        // tinypng压缩
        buffer = await CompressImg(buffer)
      }

      const postOption: IOldReqOptions = {
        method: 'POST',
        url: apiUrl,
        headers: {
          Authorization: userConfig.token,
          ContentType: 'multipart/form-data'
        },
        formData: {
          image: {
            value: buffer,
            options: {
              filename: fileName
            }
          }
        }
      }
      const str = await ctx.request(postOption)
      const res = JSON.parse(str)
      if (res.code !== 200) {
        ctx.log.error(`[错误]: ${res.message}`)
        throw new Error(res.message)
      } else {
        delete img.base64Image
        delete img.buffer
        img.imgUrl = res.data.thumb_url
        ctx.log.info(res.data)
      }
    } catch (err) {
      ctx.log.error(err)
      ctx.emit('notification', {
        title: '上传失败',
        body: err.message
      })
    }
  }

  return ctx
}
