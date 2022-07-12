// import { createApp } from 'vue'
// import App from './App.vue'

// const app = createApp(App);

// app.mount('#app');

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as EAPI from './electron'
import App from './App.vue'
import router from './router'
import ElectronApi from './typings/electron'
// 
import '@mdi/font/css/materialdesignicons.min.css'
import '@/assets/styles/main.scss'

const app = createApp(App)

app.config.globalProperties.$eapi = EAPI

app.provide<typeof EAPI>('$eapi', app.config.globalProperties.$eapi)

app.use(createPinia())
app.use(router)
 
app.mount('#app')
