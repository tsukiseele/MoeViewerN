/**
 * This file is used to typehint the exposed electron api's.
 * The purpose of this is to get static analysis in Vue files without additional plug-ins.
 */
import { IpcRenderer } from 'electron'

const ipcRenderer = window.electron.ipcRenderer as IpcRenderer
const send = (channel: string, params: any) => window.electron.send(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
const invoke = async (channel: string, params: any) => await window.electron.invoke(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
const invokeAsObject = async (channel: string, params: any) => JSON.parse(await invoke(channel, params))
const requestAsync = (params: any, callback: Function) => window.electron.requestAsync(JSON.parse(JSON.stringify(params)), callback)

const minimize = window.$win.minimize
const maximize = window.$win.maximize
const close = window.$win.close

export {
  ipcRenderer,
  send,
  invoke,
  invokeAsObject,
  requestAsync,
  minimize,
  maximize,
  close
}
 