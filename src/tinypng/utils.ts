import https from 'node:https'
import { URL } from 'node:url'
import axios from 'axios'

function getRandIp(): string {
  const random = (): number => {
    return Math.random() * 256 + 1
  }
  const ip = `${random()}.${random()}.${random()}.${random()}`
  return ip
}

export async function uploadImg(imgData: Buffer) {
  const UserAgent = `Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/${
    59 + Math.round(Math.random() * 10)
  }.0.3497.${Math.round(Math.random() * 100)}Safari/537.36`
  try {
    const res = await axios.post(
      'https://tinypng.com/backend/opt/shrink',
      imgData,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': UserAgent,
          'X-Forwarded-For': getRandIp(),
        },
      },
    )

    return res.headers.location
  } catch (error) {
    throw new Error(error)
  }
}

export function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(new URL(url), (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`请求失败: ${res.statusMessage}`))
      }

      const chunks = []

      res.on('data', (chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        const imgData = Buffer.concat(chunks)
        resolve(imgData)
      })
    })
  })
}
