/**
 * This file is used to typehint the exposed electron api's.
 * The purpose of this is to get static analysis in Vue files without additional plug-ins.
 */
const ipcRenderer = window.electron.ipcRenderer
/**
 * 发送消息
 * @param channel
 * @param params
 */
async function send(channel: string, params?: any) {
  window.electron.send(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
}
/**
 * 序列化参数后调用，并返回一个未反序列化的Promise
 * @param channel
 * @param params
 * @returns
 */
async function invoke(channel: string, params?: any) {
  return await window.electron.invoke(channel, params ? JSON.parse(JSON.stringify(params)) : undefined)
}
/**
 * 序列化参数后调用，并返回一个反序列化的Promise
 * @param channel
 * @param params
 * @returns
 */
async function invokeAsObject(channel: string, params?: any) {
  return JSON.parse(await invoke(channel, params))
}
/**
 * 发送异步请求，并回调进度
 * @param params
 * @param callback
 */
async function requestAsync(params: any, callback: (p: Progress) => void) {
  window.electron.requestAsync(JSON.parse(JSON.stringify(params)), callback)
}
const ipc = { invoke, invokeAsObject, send }
const http = window.electron.http
const io = window.electron.io
const db = window.electron.db
const app = window.electron.app

export { ipc, app, http, io, db, ipcRenderer, send, invoke, invokeAsObject, requestAsync }
