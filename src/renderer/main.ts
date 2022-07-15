// import { createApp } from 'vue'
// import App from './App.vue'

// const app = createApp(App);

// app.mount('#app');

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as EAPI from './electron'
import App from './App.vue'
import router from './router'
import { createDiscreteApi, NMessageProvider , useMessage} from 'naive-ui'
import { Base64 } from 'js-base64'
// 
import '@mdi/font/css/materialdesignicons.min.css'
import '@/assets/styles/main.scss'

window.eapi = EAPI

const app = createApp(App)

app.provide('utils', {
  base64ToBlob(base64: string, type: string) {
    return new Blob([Base64.toUint8Array(base64)], { type: type })
  },
})

app.use(createPinia())
app.use(router)


app.mount('#app')

const { message, notification, dialog, loadingBar } = createDiscreteApi(['message', 'dialog', 'notification', 'loadingBar'])

window.$message = message
window.$notification = notification
window.$dialog = dialog
window.$loadingBar = loadingBar