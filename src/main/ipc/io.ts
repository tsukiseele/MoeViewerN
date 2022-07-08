import { app, clipboard, ipcMain } from 'electron'
import fs from 'fs/promises'
import Base64 from 'js-base64'
/**
 * 该文件封装了文件IO的本地逻辑
 */
const REG_FILENAME = /[\\/:*?"<>|]/g

const getWindowsFileName = (text: string) => {
  return text.replace(REG_FILENAME, '_')
}

ipcMain.handle('writeFile', async (event, filename, base64): Promise<boolean> => {
  const dir = `${process.cwd()}/download`
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(`${dir}/${getWindowsFileName(filename)}`, Base64.toUint8Array(base64)))
})

ipcMain.handle('writeClipboardText', async (event, text): Promise<boolean> => {
  clipboard.writeText(text)
  return true
})
