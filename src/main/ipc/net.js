import {
    app,
    protocol,
    BrowserWindow,
    ipcMain,
    net,
    session
} from 'electron';

export default {
    register() {
        app.whenReady().then(() => {
            ipcMain.on('setCookies', (event, url, cookie) => {
                for (const item of cookie.split(';')) {
                    let [k, v] = item.split('=');
                    if (k) {
                        v = v || ""
                        const name = k.trim();
                        const value = v.trim();
                        session.defaultSession.cookies.set({
                            url,
                            name,
                            value,
                            sameSite: "unspecified",
                            secure: true,
                        }).then(null, e => {
                            console.log(e);
                        })
                    }
                }
            })
        })
    }
}