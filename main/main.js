import { ipcMain, BrowserWindow } from 'electron'
import SiteLoader from './libs/site-loader.mjs'
import Kumoko from './libs/kumoko.mjs'
import fetch from './libs/proxy-fetch.mjs'
import log from 'electron-log'
// By default, it writes logs to the following locations:
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log

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
  log.info('loadSite', `${process.cwd()}/static/rules`)
  return await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
})
ipcMain.handle('request', async (event, params) => {
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return { data: base64, type: blob.type }
})
ipcMain.handle('loadChildren', async (event, params) => {
  if (params.item && params.item.$children) {
    const request = async (url, options) => {
      options.header = { ...params.headers }
      options.timeout = 5000
      return await fetch(url, options)
    }
    console.log('PARAMS', params)
    await new Kumoko(params.item, null, null, request).parseChildrenConcurrency(params.item, params.item.$section.rules)
    return true // JSON.stringify(await spider.parseNext(params.item))
  }
  return false
})
ipcMain.handle('load', async (event, query) => {
  if (!query || !query.siteId) return []
  try {
    const sites = await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
    const site = sites.find((site) => site.id == query.siteId)
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
    log.error(error)
  }
  return []
})
