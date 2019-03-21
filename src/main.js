// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'lib-flexible/flexible.js'
import { axios } from './axios/axios.js'
import 'jquery'
import 'element-ui/lib/theme-chalk/index.css'
import fastClick from 'fastclick'
fastClick.attach(document.body)
Vue.config.productionTip = false
Vue.use(ElementUI)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
