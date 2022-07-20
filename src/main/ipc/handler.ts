import { ipcMain, BrowserWindow } from 'electron'
import SiteLoader from '../libs/site-loader'
import Kumoko, { RequestOptions, config as KumokuConfig } from '../libs/kumoko'
import fetch from '../libs/proxy-fetch'
import _ from 'lodash'
import * as cache from '../utils/disk-lru'
import { Base64 } from 'js-base64'
import { resolve } from 'path'
// import log from 'electron-log'
// By default, it writes logs to the following locations:
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log

const DIR_RULE_PATH = resolve(process.cwd(), 'static', 'rules')

const __init_props__ = {
  sites: [] as Site[],
}
const props = {
  sites: [] as Site[],
}
Object.defineProperty(props, 'sites', {
  async get() {
    return __init_props__.sites || (__init_props__.sites = await SiteLoader.loadSites(DIR_RULE_PATH))
  }
})
// async function init() {
//   console.log(props.sites);
// }
// init()

KumokuConfig.request = async (url: string, options: RequestOptions) => {
  options.timeout = 5000
  return await (await fetch(url, options)).text()
}
/**
 * 该文件封装了内容抓取，解析，封装操作的本地逻辑
 */
ipcMain.handle('getSiteList', async (event, query) => props.sites)

ipcMain.handle('request', async (event, params) => {
  const cacheData = cache.get(params.url)
  if (cacheData) return { data: Base64.fromUint8Array(cacheData), type: 'image/png' }

  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  cache.set(params.url, Buffer.from(buffer))
  return { data: base64, type: blob.type }
})

/**
 * 请求数据，并发送IPC消息回调下载进度
 */
ipcMain.on('requestAsync', async (event, params) => {
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
})

ipcMain.handle('loadChildren', async (event, params) => {
  if (params.item && params.item.$children) {
    return JSON.stringify(await new Kumoko(params.item).parseChildrenConcurrency(params.item, params.item.$section.rules))
  }
})
ipcMain.handle('load', async (event, query) => {
  if (!query || !query.siteId) return []
  try {
    // const sites = await SiteLoader.loadSites(DIR_RULE_PATH)
    const site = props.sites.find((site) => site.id == query.siteId)
    if (!site) return []
    const kumoko = new Kumoko<Meta>(site).setPage(query.page).setKeywords(query.keywords)
    const resultSet = await kumoko.parseSite()
    return JSON.stringify(resultSet)
  } catch (error) {
    console.error(error)
    // log.error(error)
  }
  return []
})
