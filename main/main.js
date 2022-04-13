import { ipcMain, BrowserWindow } from 'electron'
import SiteLoader from './libs/site-loader.mjs'

import Sakurawler from './libs/sakurawler.mjs'
// By default, it writes logs to the following locations:
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
import log from 'electron-log'

let fetch = null;
  (async () => {
    fetch = (await import('./libs/proxy-fetch.mjs')).default
    console.log("FFFFFFFFFFFFFFFFFFFFFFFF", fetch);
})()
// import fetch from './libs/proxy-fetch.mjs' //'node-fetch'//'./libs/proxy-fetch.mjs'

ipcMain.on('minimize', () => {
  BrowserWindow.getFocusedWindow().minimize()
})
ipcMain.on('maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && (win.isMaximized() ? win.unmaximize() : win.maximize())
})
ipcMain.on('close', () => {
  BrowserWindow.getFocusedWindow().close()
})

ipcMain.handle('getSiteList', async (event, query) => {
  return await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
})
ipcMain.handle('request', async (event, params) => {
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return { data: base64, type: blob.type }
})
ipcMain.handle('loadChild', async (event, params) => {
  if (params.item && params.item.$children) {
    const request = async (url, options) => {
      options.header = params.item.spider.site.headers
      options.timeout = 5000
      return await fetch(url, options)
    }
    const spider = new Sakurawler(params.item.spider.site, params.item.spider.page, params.item.spider.keywords, request)
    return JSON.stringify(await spider.parseNext(params.item))
  }
  return []
})
ipcMain.handle('load', async (event, query) => {
  if (!query || !query.siteId) return []
  try {
    log.info('query', query)
    log.info('loadSite', `${process.cwd()}/static/rules`)
    const sites = await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
    const site = sites.find((site) => site.id == query.siteId)
    const request = async (url, options) => {
      options.header = site.headers
      options.timeout = 5000
      log.info('request', url, options)
      const resp = await fetch(url, options)
      log.info('RRRRRRRRRRRRRESP', resp)
      return resp
    }

    const sakurawler = new Sakurawler(site, query.page || 1, query.keywords || '', request)
    const [resultSet] = await sakurawler.parseSite()
    log.info('resultSet', resultSet)
    return JSON.stringify(resultSet)
  } catch (error) {
    log.error(error)
  }
  return []
  /*
  const dir = `${process.cwd()}/download`

  fs.mkdir(dir, { recursive: true })
  fs.mkdir(`${dir}/peko`, { recursive: true })
  // 测试
  resultSet.forEach(async (item) => {
    ;(await item.spider.parseNext(item)).forEach(async (child) => {
      const url = child.largerUrl || child.sampleUrl
      if (url) {
        const filename = decodeURI(url.substring(url.lastIndexOf('/') + 1, url.length))
        const buffer = await (await fetch(url)).arrayBuffer()
        fs.writeFile(`${dir}/peko/${filename}`, Buffer.from(buffer))
      }
    })
    if (item.coverUrl) {
      const filename = item.coverUrl.substring(item.coverUrl.lastIndexOf('/') + 1, item.coverUrl.length)
      const buffer = await (await fetch(item.coverUrl)).arrayBuffer()
      fs.writeFile(`${dir}/${filename}`, Buffer.from(buffer))
    }
  })*/
})
