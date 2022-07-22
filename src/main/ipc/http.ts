import { ipcMain, BrowserWindow } from 'electron'
import fetch from '../libs/proxy-fetch'
import _, { reject } from 'lodash'
import { resolve } from 'path'
import pQueue from 'p-queue'

const queue = new pQueue({ concurrency: 5 })

const STATE_WAIT = 1
const STATE_READY = 2
const STATE_DOWNLOADING = 4
const STATE_DONE = 8
const STATE_ERROR = 16
/**
 * 请求数据，并发送IPC消息回调下载进度
 */
ipcMain.on('download', async (event, params) => {
  const progress: Progress = { current: 0, progress: 0, done: false, status: STATE_WAIT }
  event.reply('progress', { progress, uuid: params.uuid })
  await queue.add<Progress>(() =>
    new Promise<Progress>(async (resolve, reject) => {
      progress.status = STATE_READY
      const response = await fetch(params.url, { method: 'GET', ...params.options })
      const total = Number(response.headers.get('content-length'))
      const type = response.headers.get('content-type')
      const chunks: any[] = []

      const throttled = _.throttle(() => event.reply('progress', { progress, uuid: params.uuid }), 500)

      let current = 0
      progress.status = STATE_DOWNLOADING
      response.body.on('data', (chunk: Uint8Array) => {
        current += chunk.length
        chunks.push(chunk)
        progress.progress = current / total
        progress.total = total
        progress.current = current
        throttled()
      })
      response.body.on('end', () => {
        const chunksAll = new Uint8Array(current)
        let position = 0
        for (const chunk of chunks) {
          chunksAll.set(chunk, position)
          position += chunk.length
        }
        const base64 = Buffer.from(chunksAll).toString('base64')
        progress.response = { data: base64, type }
        progress.done = true
        progress.status = STATE_DONE
        throttled()
        resolve(progress)
      })
    })
  )
})
