import Vue from 'vue'
import App from './App.vue'
import router from './router'
//导入全局样式表
import './assets/css/global.css'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入NProgress
import NProgress from 'nprogress'

import axios from 'axios'
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor);
//配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//配置请求拦截器，使得在每次请求前，先处理以下函数
axios.interceptors.request.use(config => {
    //在request中展示进度条
    NProgress.start();
    console.log(config)
    config.headers.Authorization = window.sessionStorage.getItem('token')
    //最后必须return 
    return config
})
axios.interceptors.response.use(config => {
    //在response中隐藏进度条
    NProgress.done();
    return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.filter('dataFormate', function (originval) {
    const dt = new Date(originval);
    const y = dt.getFullYear();
    const m = (dt.getMonth() + 1 + '').padStart(2, '0');
    const d = (dt.getDate() + '').padStart(2, '0');
    const hh = (dt.getHours() + '').padStart(2, '0');
    const mm = (dt.getMinutes() + '').padStart(2, '0');
    const ss = (dt.getSeconds() + '').padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
