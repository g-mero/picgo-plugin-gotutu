import https from 'https'
import { URL } from 'url'

function getOptions (): https.RequestOptions {
  let time = Date.now()
  const UserAgent = `Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/${59 + Math.round(Math.random() * 10)}.0.3497.${Math.round(Math.random() * 100)}Safari/537.36`

  const options: https.RequestOptions = {
    method: 'POST',
    hostname: 'tinypng.com',
    path: '/backend/opt/shrink',
    rejectUnauthorized: false,
    headers: {
      'Postman-Token': (time -= 5000),
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UserAgent,
      'X-Forwarded-For': getRandIp(),
      Cookie: ''
    },
    timeout: 5000
  }

  return options
}

function getRandIp (): string {
  const random = (): number => {
    return Math.random() * 256 + 1
  }
  const ip = `${random()}.${random()}.${random()}.${random()}`
  return ip
}

export async function uploadImg (imgData: Buffer): Promise<string> {
  return await new Promise((resolve, reject) => {
    const req = https.request(getOptions(), res => {
      res.on('data', buf => {
        let obj: any

        try {
          obj = JSON.parse(buf.toString())
        } catch (err) {
          reject(new Error(`解析返回值失败JSON: ${err}`))
        }

        if (obj.error) {
          reject(new Error(obj.error))
        } else {
          resolve(obj.output.url)
        }
      })
    })
    req.write(imgData, 'binary')
    req.on('error', (err) => {
      reject(err)
    })
    req.end()
  })
}

export async function downloadFile (url: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    https.get(new URL(url), res => {
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
