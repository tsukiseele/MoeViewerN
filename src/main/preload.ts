import { BrowserWindow, contextBridge, ipcRenderer, shell } from 'electron'
import { random } from 'lodash'
import { cyrb53 } from './utils/hashcode'
// import { cyrb53 } from './utils/hashcode'

const callbacks = new Map<number, any>()

ipcRenderer.on('appExit', (event, data) => {

  BrowserWindow.getFocusedWindow()?.webContents.send('appEdit')
})
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
console.log(ipcRenderer);

const electronIpc = {
  app: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    maximize() {
      ipcRenderer.send('maximize')
    },
    close() {
      ipcRenderer.send('close')
    },
    openExternal(url: string) {
      shell.openExternal(url)
    },
    writeClipboardText(text: string): Promise<boolean> {
      return ipcRenderer.invoke('writeClipboardText', text)
    },
  },
  io: {
    writeText(text: string, filename: string, dirname?: string): Promise<boolean> {
      return ipcRenderer.invoke('writeText', text, filename, dirname)
    },
    writeFile(base64: string, filename: string, dirname?: string): Promise<boolean> {
      return ipcRenderer.invoke('writeFile', base64, filename, dirname)
    },
    writeDownload(base64: string, filename: string, dirname?: string): Promise<boolean> {
      return ipcRenderer.invoke('writeDownload', base64, filename, dirname)
    },
  },
  db: {
    initSQLite(): Promise<boolean> {
      return ipcRenderer.invoke('initSQLite')
    },
  },
  http: {
    /**
     * 下载二进制数据，回调下载进度
     * @param {*} params
     * @param {*} callback
     */
    download(params: any, callback: (progress: Progress) => void): void {
      if (!params.url) throw new Error('url cannot be empty!')
      if (callback) {
        params.uuid = cyrb53(params.url, 255)
        // params.uuid = cyrb53(random(0, Number.MAX_SAFE_INTEGER).toString(), Date.now() % 256)
        callbacks.set(params.uuid, callback)
      }
      ipcRenderer.send('download', params)
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
}
contextBridge.exposeInMainWorld('electron', electronIpc)

export { electronIpc }
// export declare type EIPC = typeof electronIpc
