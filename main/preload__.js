// electron/preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// const remote = require('electron/remote')
const { contextBridge, ipcRenderer } = require('electron')
const EventEmitter = require('node:events')

const bridgeEvent = new EventEmitter()
ipcRenderer.on('progress', (event, data) => {
  bridgeEvent.emit(data.uuid, data.progress)
  if (data.progress.done) {
    bridgeEvent.off(data.uuid, )
    console.log('OFFFFFFFFF', data.uuid);
  }
})
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
  async requestAsync(params) {
    return await ipcRenderer.invoke('requestAsync', JSON.parse(params))
  },
  async getSiteList() {
    return await ipcRenderer.invoke('getSiteList')
  },
})
contextBridge.exposeInMainWorld('$invoke', {
  async requestAsync(params, callback) {
    if (callback) {
      params.uuid = `T${Date.now()}`
      bridgeEvent.on(params.uuid, callback)
    }
    ipcRenderer.send('requestAsync', params)
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
