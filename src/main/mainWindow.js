import BrowserWinHandler from './BrowserWinHandler'
import control from './ipc/control'

const winHandler = new BrowserWinHandler({
    height: 600,
    width: 1000,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
    }
})

winHandler.onCreated(_browserWindow => {
    winHandler.loadPage('/')
    control.bind(_browserWindow)
        // Or load custom url
        // _browserWindow.loadURL('https://google.com')
})

export default winHandler