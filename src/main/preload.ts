import { contextBridge, ipcRenderer } from 'electron'

const callbacks = new Map<number, any>()

ipcRenderer.on('progress', (event, data) => {
  console.log('ON', callbacks);
  
  const callback = callbacks.get(data.uuid)
  if (!callback) return
  callback(data.progress)
  data.progress.done && callbacks.delete(data.uuid)
})
/**
 * 上下文桥，隔离Main和Renderer，暴露声明API
 */
contextBridge.exposeInMainWorld('electron', {
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
      params.uuid = Date.now()
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