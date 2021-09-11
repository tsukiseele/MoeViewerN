import {
    app,
    protocol,
    BrowserWindow,
    ipcMain,
    net,
} from 'electron';

export default {
    bind(window) {
        // 窗口最小化
        ipcMain.on('window-min', () => {
            window.minimize();
        });
        // 窗口最大化
        ipcMain.on('window-max', () => {
            if (window.isMaximized()) {
                window.restore();
            } else {
                window.maximize();
            }
        });
        // 窗口关闭
        ipcMain.on('window-close', () => {
            // window.close();
            if (process.platform !== 'darwin') app.quit()
        });
    },
};