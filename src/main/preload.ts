import { contextBridge, ipcRenderer } from 'electron'
import { random } from 'lodash'
import { cyrb53 } from './utils/hashcode'

const callbacks = new Map<number, any>()

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
    },
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
      params.uuid = cyrb53(random(0, Number.MAX_SAFE_INTEGER).toString(), Date.now() % 256)
      callbacks.set(params.uuid, callback)
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
