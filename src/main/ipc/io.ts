import { ipcMain } from 'electron'
import fs from 'fs/promises'
import Base64 from 'js-base64'

const getWindowsFileName = (text: string) => {
  return text.replace(/[\\/:*?"<>|]/g, '_')
}

ipcMain.handle('writeFile', async (event, filename, base64): Promise<boolean> => {
  const dir = `${process.cwd()}/download`
  await fs.mkdir(dir, { recursive: true })
  return Boolean(await fs.writeFile(`${dir}/${getWindowsFileName(filename)}`, Base64.toUint8Array(base64)))
})