const { ipcMain, BrowserWindow } = require('electron')
const SiteLoader = require('./libs/site-loader.js')
const Sakurawler = require('./libs/sakurawler.js')
// const delay = require('delay')
let fetch = null

// import async module
;(async () => {
  fetch = await require('./libs/proxy-fetch.js')()
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
  return await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
})
ipcMain.handle('request', async (event, _params) => {
  const params = JSON.parse(_params)
  const response = await fetch(params.url, { method: 'GET', ...params.options })
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return { data: base64, type: blob.type }
})
ipcMain.handle('load', async (event, query) => {
  console.log('query', query)
  if (!query || !query.siteId) return []

  const sites = await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
  const site = sites.find((site) => site.id == query.siteId)
  const request = async (url, options) => {
    options.header = site.headers
    options.timeout = 5000
    return await fetch(url, options)
  }
  const sakurawler = new Sakurawler(site, query.page || 1, query.keywords || '', request)
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
