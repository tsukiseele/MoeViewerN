import {
    app,
    protocol,
    BrowserWindow,
    ipcMain,
} from 'electron';
const DEV_SERVER_URL = process.env.DEV_SERVER_URL
const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

import CatalogWindow from '../windows/CatalogWindow';

export default {
    register() {
        app.whenReady().then(() => {
            ipcMain.on("openSectionWindow", (pagePath) => {
                return new CatalogWindow().loadPage(pagePath);
                /*
                  if (!this.browserWindow) return Promise.reject(new Error('The page could not be loaded before win \'created\' event'))
                  const serverUrl = isDev ? DEV_SERVER_URL : 'app://./index.html'
                  const fullPath = serverUrl + '#' + pagePath;
                  await this.browserWindow.loadURL(fullPath)
                  require(catalogWindow);*/
                /*
                // Create the browser window.
                const window = new BrowserWindow({
                  width: 1200,
                  height: 800,
                  frame: false,
                  webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    webSecurity: false,
                  },
                });
                window.loadURL("http://localhost:8081/#/catalog")
                */

            })
        })
    }
}