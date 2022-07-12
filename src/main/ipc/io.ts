import { app, clipboard, ipcMain } from 'electron'
import fs from 'fs/promises'
import Base64 from 'js-base64'
import { resolve } from 'path'
/**
 * 该文件封装了文件IO的本地逻辑
 */
const REG_FILENAME = /[\\/:*?"<>|]/g

const getWindowsFileName = (text: string) => {
  return text.replace(REG_FILENAME, '_')
}

ipcMain.handle('writeFile', async (event, filename: string, base64: string, dirname?: string): Promise<boolean> => {
  const dir = resolve(process.cwd(), 'download')
  await fs.mkdir(dir, { recursive: true })
  console.log('patyhy', resolve(dir, dirname || '', getWindowsFileName(filename)));
  
  return Boolean(await fs.writeFile(resolve(dir, dirname || '', getWindowsFileName(filename)), Base64.toUint8Array(base64)))
})

ipcMain.handle('writeClipboardText', async (event, text): Promise<boolean> => {
  clipboard.writeText(text)
  return true
})
