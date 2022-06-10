import { ipcMain, BrowserWindow } from 'electron'
import SiteLoader from './libs/site-loader'
import Kumoko from './libs/kumoko'
import fetch from './libs/proxy-fetch'
import _ from 'lodash'
// import log from 'electron-log'
// By default, it writes logs to the following locations:
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log

ipcMain.on('minimize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && win.minimize()
})
ipcMain.on('maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && (win.isMaximized() ? win.unmaximize() : win.maximize())
})
ipcMain.on('close', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && win.close()
})

ipcMain.handle('getSiteList', async (event, query) => {
  // log.info('loadSite', `${process.cwd()}/static/rules`)
  return await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
})
ipcMain.handle('request', async (event, params) => {
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return { data: base64, type: blob.type }
})

interface Progress {
  progress?: number
  total?: number
  current?: number
  response?: any
  done?: boolean
}
ipcMain.on('requestAsync', async (event, params) => {
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const total = Number(response.headers.get('content-length'))
  const type = response.headers.get('content-type')
  const chunks: any[] = []
  const progress: Progress = {}

  let current = 0
  const throttled = _.throttle(() => event.reply('progress', { progress, uuid: params.uuid }), 200)
  response.body.on('data', chunk => {
    current += chunk.length
    chunks.push(chunk)
    progress.progress = current / total
    progress.total = total
    progress.current = current
    throttled()
  })

  response.body.on('end', () => {
    let chunksAll = new Uint8Array(current)
    let position = 0
    for (let chunk of chunks) {
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
    const requestAsText = async (url, options) => {
      options.headers = { ...params.item.$site.headers }
      options.timeout = 5000
      return await (await fetch(url, options)).text()
    }
    return JSON.stringify(await new Kumoko(params.item, 0, null, requestAsText).parseChildrenConcurrency(params.item, params.item.$section.rules))
  }
})
ipcMain.handle('load', async (event, query) => {
  if (!query || !query.siteId) return []
  try {
    const sites = await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
    const site = sites.find(site => site.id == query.siteId)
    if (!site) return []
    const requestAsText = async (url, options) => {
      options.headers = { ...site.headers }
      options.timeout = 5000
      return await (await fetch(url, options)).text()
    }

    const kumoko = new Kumoko(site, query.page || 1, query.keywords || '', requestAsText)
    const resultSet = await kumoko.parseSite()
    return JSON.stringify(resultSet)
  } catch (error) {
    console.error(error)
    // log.error(error)
  }
  return []
})