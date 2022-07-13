import { app, clipboard, ipcMain } from 'electron'
import fs from 'fs/promises'
import Base64 from 'js-base64'
import { resolve } from 'path'
/**
 * 该文件封装了文件IO的本地逻辑
 */
const REG_FILENAME = /[\\/:*?"<>|]/g

const DIR_DOWNLOAD = resolve(process.cwd(), 'download')


const getWindowsFileName = (text: string) => {
  return text.replace(REG_FILENAME, '_')
}

ipcMain.handle('writeFile', async (event, base64: string, filename: string, dirname?: string): Promise<boolean> => {
  console.log('patyhy', resolve(DIR_DOWNLOAD, dirname || '', getWindowsFileName(filename)));
  const dir = resolve(DIR_DOWNLOAD, dirname || '')
  const path = resolve(dir, getWindowsFileName(filename))
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(path, Base64.toUint8Array(base64)))
})

ipcMain.handle('writeClipboardText', async (event, text): Promise<boolean> => {
  clipboard.writeText(text)
  return true
})
