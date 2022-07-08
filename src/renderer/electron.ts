import ElectronApi from './typings/electron'

/**
 * This file is used to typehint the exposed electron api's.
 * The purpose of this is to get static analysis in Vue files without additional plug-ins.
 */
const ipcRenderer = window.electron.ipcRenderer // as IpcRenderer
const send = (channel: string, params?: any) => window.electron.send(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
const invoke = async (channel: string, params?: any) => await window.electron.invoke(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
const invokeAsObject = async (channel: string, params?: any) => JSON.parse(await invoke(channel, params))
const requestAsync = (params: any, callback: (p: Progress) => void) => window.electron.requestAsync(JSON.parse(JSON.stringify(params)), callback)

const minimize = window.$win.minimize
const maximize = window.$win.maximize
const close = window.$win.close
const io = {
  writeFile: (path: string, base64: string ) => {
    return window.electron.io.writeFile(path, base64)
  },
  
  writeClipboardText: (text: string) => {
    return window.electron.io.writeClipboardText(text)
  }
}
// interface Native extends ElectronApi {
//   invokeAsObject(channel: string, params?: any): Promise<any>
// }
export {
  io,
  ipcRenderer,
  send,
  invoke,
  invokeAsObject,
  requestAsync,
  minimize,
  maximize,
  close,
}
