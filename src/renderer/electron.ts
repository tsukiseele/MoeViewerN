/**
 * This file is used to typehint the exposed electron api's.
 * The purpose of this is to get static analysis in Vue files without additional plug-ins.
 */
const ipcRenderer = window.electron.ipcRenderer // as IpcRenderer
const send = (channel: string, params?: any) => window.electron.send(channel, JSON.parse(JSON.stringify(params)))
const invoke = async (channel: string, params?: any) => await window.electron.invoke(channel, JSON.parse(JSON.stringify(params)))
const invokeAsObject = async (channel: string, params?: any) => JSON.parse(await invoke(channel, params))
const requestAsync = (params: any, callback: (p: Progress) => void) => window.electron.requestAsync(JSON.parse(JSON.stringify(params)), callback)

const io = {
  writeFile: (path: string, base64: string) => {
    return window.electron.io.writeFile(path, base64)
  },
  writeClipboardText: (text: string) => {
    return window.electron.io.writeClipboardText(text)
  },
}
const db = {
  initSQLite: (path: string, base64: string) => {
    return window.electron.io.writeFile(path, base64)
  },
}

const win = {
  minimize: window.electron.win.minimize,
  maximize: window.electron.win.maximize,
  close: window.electron.win.close,
}


export { win, io, db, ipcRenderer, send, invoke, invokeAsObject, requestAsync }

