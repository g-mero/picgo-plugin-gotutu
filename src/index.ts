import { PicGo } from 'picgo'
import { getConfig, uploaderName } from './config'
import { handle } from './handle'

export = (ctx: PicGo) => {
  const register = (): void => {
    ctx.helper.uploader.register(uploaderName, {
      handle,
      name: 'gotutu',
      config: getConfig
    })
  }
  return {
    uploader: uploaderName,
    register
  }
}
