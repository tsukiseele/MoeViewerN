import { app } from 'electron'
import net from './ipc/net'
import scene from './ipc/scene'

// 注册IPC
net.register()
scene.register()

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

// Load here all startup windows
require("./mainWindow");