import { app, BrowserWindow, ipcMain, ipcRenderer, shell } from 'electron'
import { join } from 'path'
import * as cache from './utils/disk-lru'
import './ipc/main'

async function createWindow() {
  // see https://www.npmjs.com/package/electron-acrylic-window
  let AcrylicBrowserWindow
  try {
    const eaw = await import('electron-acrylic-window')
    if (eaw) AcrylicBrowserWindow = eaw.BrowserWindow
  } catch (error) {}

  const mainWindow = new (AcrylicBrowserWindow || BrowserWindow)({
    width: 1080,
    height: 720,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    vibrancy: {
      // 'light', 'dark', 'appearance-based' or '#rrggbbaa'
      theme: 'appearance-based',
      // 'acrylic', 'blur'
      effect: 'acrylic',
      useCustomWindowRefreshMethod: true,
      maximumRefreshRate: 60,
      disableOnBlur: true,
    },
  })
  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`)
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', function () {
  cache.saveCacheStatus()
  ipcRenderer.send('appExit')
  if (process.platform !== 'darwin') app.quit()
})
// Listen for web contents being created
app.on('web-contents-created', (e, contents) => {

  // Check for a webview
  if (['window', 'webview'].includes(contents.getType())) {
    // Listen for any new window events
    contents.setWindowOpenHandler((details) => {
      e.preventDefault()
      shell.openExternal(details.url)
      return { action: "deny" }
    })
  }
})