import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import './handler'

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
  // mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../dist/index.html')}`)
  // // Open the DevTools.
  // if (isDev) {
  //   // mainWindow.webContents.openDevTools()
  // }

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`)
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
}
// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//   })

//   if (process.env.NODE_ENV === 'development') {
//     const rendererPort = process.argv[2]
//     mainWindow.loadURL(`http://localhost:${rendererPort}`)
//   } else {
//     mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
//   }
// }

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
  if (process.platform !== 'darwin') app.quit()
})
