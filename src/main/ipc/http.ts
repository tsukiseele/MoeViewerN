
import { ipcMain, BrowserWindow } from 'electron'
import fetch from '../libs/proxy-fetch'
import _ from 'lodash'
import { resolve } from 'path'
/**
 * 请求数据，并发送IPC消息回调下载进度
 */
ipcMain.on('download', async (event, params) => {
  // const download = async () => {
    const response = await fetch(params.url, { method: 'GET', ...params.options })
    const total = Number(response.headers.get('content-length'))
    const type = response.headers.get('content-type')
    const chunks: any[] = []
    const progress: Progress = { current: 0, progress: 0, done: false }

    let current = 0
    const throttled = _.throttle(() => event.reply('progress', { progress, uuid: params.uuid }), 200)

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
      throttled()
    })
  // }
  // return await new Promise((resolve, reject) => {

  //   let timeout = setTimeout(() => {
    
  //   }, 10000);
  // })
})
