import { app, clipboard, ipcMain } from 'electron'
import fs from 'fs/promises'
import Base64 from 'js-base64'
import { resolve } from 'path'
/**
 * 该文件封装了文件IO的本地逻辑
 */
const REG_FILENAME = /[\\/:*?"<>|]/g

const DIR_APP = process.cwd()
const DIR_DOWNLOAD = resolve(DIR_APP, 'download')

const getWindowsFileName = (text: string) => {
  return text.replace(REG_FILENAME, '_')
}

ipcMain.handle('writeText', async (event, text: string, filename: string, dirname?: string): Promise<boolean> => {
  const dir = resolve(DIR_APP, dirname || '').trim()
  const path = resolve(dir, getWindowsFileName(filename)).trim()
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(path, text))
})

ipcMain.handle('writeFile', async (event, base64: string, filename: string, dirname?: string): Promise<boolean> => {
  const dir = resolve(DIR_APP, dirname || '').trim()
  const path = resolve(dir, getWindowsFileName(filename)).trim()
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(path, Base64.toUint8Array(base64)))
})

ipcMain.handle('writeDownload', async (event, base64: string, filename: string, dirname?: string): Promise<boolean> => {
  console.log('SAVE TO', resolve(DIR_DOWNLOAD, dirname || '', getWindowsFileName(filename)));
  const dir = resolve(DIR_DOWNLOAD, dirname || '').trim()
  const path = resolve(dir, getWindowsFileName(filename)).trim()
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(path, Base64.toUint8Array(base64)))
})

ipcMain.handle('writeClipboardText', async (event, text): Promise<boolean> => {
  clipboard.writeText(text)
  return true
})
