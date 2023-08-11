import type { IPluginConfig, PicGo } from 'picgo'

export const uploaderName = 'gotutu'
export const bedName = `picBed.${uploaderName}`

export interface UserConfig {
  url: string
  token: string
  compressed: string
  tinypng: string
}

export const getConfig = (ctx: PicGo): IPluginConfig[] => {
  let userConfig: UserConfig = ctx.getConfig(bedName)

  if (!userConfig) {
    userConfig = {} as any
  }

  const config: IPluginConfig[] = [
    {
      name: 'url',
      type: 'input',
      default: userConfig.url ?? '',
      required: true,
      alias: 'gotutu地址'
    },
    {
      name: 'token',
      type: 'password',
      required: true,
      alias: '你的apiToken'
    },
    {
      name: 'compressed',
      type: 'list',
      choices: ['开启', '关闭'],
      required: true,
      default: '开启',
      alias: '原图压缩(与tinypng只需要开启一个)'
    },
    {
      name: 'tinypng',
      type: 'list',
      choices: ['开启', '关闭'],
      required: true,
      default: '关闭',
      alias: '开启tinypng压缩(需联网)'
    }
  ]

  return config
}
