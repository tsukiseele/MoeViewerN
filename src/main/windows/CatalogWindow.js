import { BrowserWindow, app } from "electron";
const DEV_SERVER_URL = process.env.DEV_SERVER_URL;
const isDev = process.env.NODE_ENV === "development";

export default class CatalogWindow {
  constructor(options) {
    this.options = options;
  }
  newBrowserWindow() {
    return new BrowserWindow({
      height: 600,
      width: 1000,
      frame: false,
      // ...this.options,
      webPreferences: {
        // ...this.options.webPreferences,
        webSecurity: false, // disable on dev to allow loading local resources
        nodeIntegration: true, // allow loading modules via the require () function
        contextIsolation: false // https://github.com/electron/electron/issues/18037#issuecomment-806320028
      }
    });
  }

  async loadPage(pagePath) {
    const serverUrl = isDev ? "│  http://localhost:9080" : "app://./index.html";
    const fullPath = serverUrl + "#" + pagePath;
    console.log(fullPath.toString());
    await this.newBrowserWindow().loadURL(fullPath);
  }
}
