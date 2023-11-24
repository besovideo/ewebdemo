import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import devicesJs from './utils/devicesJs.js'
import cookieJs from './utils/cookieJs.js'
// 全局引入element-plus
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn
})
app.use(devicesJs)
app.use(cookieJs)
app.use(store)
app.use(router)
app.mount('#app')
