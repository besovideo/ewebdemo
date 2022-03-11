import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import devicesJs from "./utils/devicesJs"
import cookieJs from "./utils/cookieJs"

Vue.config.productionTip = false;

Vue.use(devicesJs)
Vue.use(cookieJs)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
