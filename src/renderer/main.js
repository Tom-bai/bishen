import Vue from 'vue'
// import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import './reset.css'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import 'element-ui/lib/theme-chalk/index.css'
import VueI18n from 'vue-i18n'
import VueClipboard from 'vue-clipboard2'
import vuePrototype from './until/vuePrototype'

import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
// import 'echarts/lib/component/legend'
// import 'echarts/lib/component/title'
import 'echarts/lib/component/dataset'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/dataZoom'
Vue.component('chart', ECharts)

import './assets/fonts/iconfont.css'
if(localStorage.getItem('lang')=='en') {
  Vue.use(ElementUI,{locale})
}else {
  Vue.use(ElementUI,{zhLocale})
}
Vue.use(ElementUI,{locale})
Vue.use(VueI18n)
Vue.use(VueClipboard)

// if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const i18n = new VueI18n({
  // locale: 'zh',  // 语言标识
  locale: localStorage.getItem('lang')||'zh',  // 语言标识
  messages: {
      'zh': require('./lang/zh.js'),
      'en': require('./lang/en.js')
  }
})

Vue.use(vuePrototype, { ElementUI, i18n, store, router })
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  i18n,
  store,
  template: '<App/>'
}).$mount('#app')