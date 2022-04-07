const { ipcMain, BrowserWindow } = require('electron')
const SiteLoader = require('./libs/site-loader.js')
const Sakurawler = require('./libs/sakurawler.js')
const delay = require('delay')
let pRetry = null
let pTimeout = null
let fetch = null

// import async module
;(async () => {
  fetch = await require('./libs/proxy-fetch.js')()
  // console.log(await import('p-retry'));
  pRetry = (await import('p-retry')).default
  pTimeout = (await import('p-timeout')).default
  // pRetry = await require('p-retry')
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
  console.log('request: ', params.url)
  const response = await pRetry(async () => await pTimeout(fetch(params.url, { method: 'GET', ...params.options }), 5000), {
    retries: 3,
    onFailedAttempt: async (error) => {
      // console.log('Waiting for 1 second before retrying')
      // await delay(1000)
    },
  })
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return base64
})
ipcMain.handle('load', async (event, query) => {
  console.log('query', query)
  if (!query || !query.siteId) return []

  const sites = await SiteLoader.loadSites(`${process.cwd()}/static/rules`)
  const site = sites.find((site) => site.id == query.siteId)
  const request = async (url, options) => {
    options.header = site.headers
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
