const { ipcMain, BrowserWindow } = require('electron')

let SiteLoader = null
let Sakurawler = null
let fetch = null
// import ES module
;(async () => {
  SiteLoader = (await import('./libs/site-loader.mjs')).default
  Sakurawler = (await import('./libs/sakurawler.mjs')).default
  fetch = (await import('./libs/proxy-fetch.mjs')).default
  // const fs = await import('fs/promises')
})()

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
  const SiteLoader = (await import('./libs/site-loader.mjs')).default
  console.log('rules path: ', process.cwd());
  return await SiteLoader.loadSites(`${process.cwd()}/static/rules'`)
})
ipcMain.handle('request', async (event, params) => {
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  return response.blob() //arrayBuffer()
})
ipcMain.handle('load', async (event, query) => {
  console.log('query', query)
  if (!query || !query.siteId) return []

  const sites = await SiteLoader.loadSites('./static/rules')

  const site = sites.find((site) => site.id == query.siteId)
  const sakurawler = new Sakurawler(site, query.page || 1, query.keywords || '', fetch)
  const [resultSet] = await sakurawler.parseSite()

  return JSON.stringify(resultSet)
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
