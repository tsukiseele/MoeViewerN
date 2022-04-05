// electron/preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// import SiteLoader from './libs/site-loader.js'
// import Sakurawler from './libs/sakurawler.js'
// import fetch from './libs/proxy-fetch.js'
// import fs from 'fs/promises'

// const remote = require('electron/remote')
const { contextBridge, ipcRenderer } = require('electron')

// DOMLoaded
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
// bridge
contextBridge.exposeInMainWorld('$native', {
  async load(query) {
    return JSON.parse(await ipcRenderer.invoke('load', query))
  },
  async getSiteList(query) {
    return await ipcRenderer.invoke('getSiteList', query)
  },
})

contextBridge.exposeInMainWorld('$win', {
  minimize() {
    ipcRenderer.send('minimize')
  },
  maximize() {
    ipcRenderer.send('maximize')
  },
  close() {
    ipcRenderer.send('close')
  },
})
