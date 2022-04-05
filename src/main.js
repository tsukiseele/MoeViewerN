import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 
import '@mdi/font/css/materialdesignicons.min.css'
import '@/assets/styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
