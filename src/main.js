// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import '@/common/styles/index.scss'

Vue.use(VueResource)

Vue.config.productionTip = false  // 设置为false以阻止vue在启动时生成生产提示

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  data: {eventHub: new Vue()}  // 用于非父子组件通信
})
