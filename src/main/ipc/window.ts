import { ipcMain, BrowserWindow } from 'electron'

/**
 * 该文件封装了窗口操作IO的本地逻辑
 */
ipcMain.on('minimize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && win.minimize()
})
ipcMain.on('maximize', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && (win.isMaximized() ? win.unmaximize() : win.maximize())
})
ipcMain.on('close', () => {
  const win = BrowserWindow.getFocusedWindow()
  win && win.close()
})
