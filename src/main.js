// Vue
import Vue from 'vue'
import App from './App'
// 核心插件
import d2Admin from '@/plugin/d2admin'
// store
import store from '@/store/index'
// 多国语
import i18n from './i18n'
import * as filters from './filters'

// 菜单和路由设置
import router from './router'
import { frameInRoutes } from '@/router/routes'

// 核心插件
Vue.use(d2Admin)

// 全局filter
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
  created () {
    // 处理路由 得到每一级的路由设置
    this.$store.commit('d2admin/page/init', frameInRoutes)
  },
  mounted () {
    // 展示系统信息
    this.$store.commit('d2admin/releases/versionShow')
    // 用户登录后从数据库加载一系列的设置
    this.$store.dispatch('d2admin/account/load')
    // 获取并记录用户 UA
    this.$store.commit('d2admin/ua/get')
    // 初始化全屏监听
    this.$store.dispatch('d2admin/fullscreen/listen')
  },
  watch: {
    // 监听路由 控制侧边栏显示
    '$route.matched' (val) {
      const allMenu = this.$store.state.d2admin.user.menu
      if (allMenu) {
        const _side = allMenu.filter(menu => menu.path === val[0].path)
        this.$store.commit('d2admin/menu/asideSet', _side.length > 0 ? _side : [])
      }
    }
  }
}).$mount('#app')
