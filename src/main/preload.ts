import { contextBridge, ipcRenderer } from 'electron'

const callbacks = new Map<number, any>()
let seed = 0

ipcRenderer.on('progress', (event, data) => {
  const callback = callbacks.get(data.uuid)
  if (!callback) return
  data.progress.uuid = data.uuid
  callback(data.progress)
  data.progress.done && callbacks.delete(data.uuid)
})
/**
 * 上下文桥，隔离Main和Renderer，暴露声明API
 */
contextBridge.exposeInMainWorld('electron', {
  io: {
    writeFile: async (path: string, blob: any) => {
      ipcRenderer.invoke('writeFile', path, blob)
    }
  },
  ipcRenderer: ipcRenderer,
  invoke: ipcRenderer.invoke,
  send: ipcRenderer.send,
  /**
   * 下载二进制数据，回调下载进度
   * @param {*} params
   * @param {*} callback
   */
  requestAsync: async (params: any, callback: Function) => {
    if (callback) {
      seed += Date.now()
      params.uuid = /*Date.now() + '-' + */seed
      callbacks.set(params.uuid, callback)
    }
  console.log('SEND', params);
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