const { app, BrowserWindow } = require('electron')
const path = require('path')
const { BrowserWindow: AcrylicBrowserWindow, setVibrancy } = require('electron-acrylic-window')
const isDev = process.env.IS_DEV == 'true' ? true : false

require('./main.js')

function createWindow() {
  // see https://www.npmjs.com/package/electron-acrylic-window
  const mainWindow = new AcrylicBrowserWindow({
    width: 1080,
    height: 720,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
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
  // setVibrancy(mainWindow, {})
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../dist/index.html')}`)
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
