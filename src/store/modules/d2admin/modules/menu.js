// 设置文件
import setting from '@/setting.js'
import { validatenull } from '@/libs/validate'
import util from '@/libs/util.js'

export default {
  namespaced: true,
  state: {
    // 顶栏菜单
    header: [],
    // 侧栏菜单
    aside: [],
    // 侧边栏收缩
    asideCollapse: setting.menu.asideCollapse
  },
  mutations: {
    /**
     * @description 设置顶栏菜单
     * @param {Object} state vuex state
     * @param {Array} menu menu setting
     */
    async headerSet (state, menu) {
      if (validatenull(menu)) {
        menu = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.menu',
          defaultValue: null,
          user: true
        })
      }
      state.header = util.initHeaderMenu(menu)
    },
    /**
     * @description 设置侧边栏菜单
     * @param {Object} state vuex state
     * @param {Array} menu menu setting
     */
    async asideSet (state, menu) {
      state.aside = util.initAsideMenu(menu)
    },
    /**
     * 设置侧边栏展开或者收缩
     * @param {Object} state vuex state
     * @param {Boolean} collapse is collapse
     */
    asideCollapseSet (state, collapse) {
      // store 赋值
      state.asideCollapse = collapse
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'menu.asideCollapse',
        value: state.asideCollapse,
        user: true
      })
    },
    /**
     * 切换侧边栏展开和收缩
     * @param {Object} state vuex state
     */
    asideCollapseToggle (state) {
      // store 赋值
      state.asideCollapse = !state.asideCollapse
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'menu.asideCollapse',
        value: state.asideCollapse,
        user: true
      })
    },
    /**
     * 从持久化数据读取侧边栏展开或者收缩
     * @param {Object} state vuex state
     */
    async asideCollapseLoad (state) {
      // store 赋值
      state.asideCollapse = await this.dispatch('d2admin/db/get', {
        dbName: 'sys',
        path: 'menu.asideCollapse',
        defaultValue: setting.menu.asideCollapse,
        user: true
      })
    }
  }
}
