// electron/preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

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
  async load(params) {
    return await ipcRenderer.invoke('load', JSON.parse(params))
  },
  async loadChildren(params) {
    return await ipcRenderer.invoke('loadChildren', JSON.parse(params))
  },
  async request(params) {
    return await ipcRenderer.invoke('request', JSON.parse(params))
  },
  async getSiteList() {
    return await ipcRenderer.invoke('getSiteList')
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
