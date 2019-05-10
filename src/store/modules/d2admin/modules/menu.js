// 设置文件
import setting from '@/setting.js'
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
  actions: {
    /**
     * @description 从数据库取菜单数据
     * @param {Object} state vuex state
     */
    load ({ state, commit }) {
      return new Promise(async resolve => {
        // 从持久化加载用户一系列数据
        state.header = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'menu.header',
          defaultValue: [],
          user: true
        })
        commit('d2admin/search/init', state.header, { root: true })
        state.aside = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'menu.aside',
          defaultValue: [],
          user: true
        })
        // end
        resolve()
      })
    },
    /**
     * 设置侧边栏展开或者收缩
     * @param {Object} state vuex state
     * @param {Boolean} collapse is collapse
     */
    asideCollapseSet ({ state, dispatch }, collapse) {
      return new Promise(async resolve => {
        // store 赋值
        state.asideCollapse = collapse
        // 持久化
        await dispatch('d2admin/db/set', {
          dbName: 'sys',
          path: 'menu.asideCollapse',
          value: state.asideCollapse,
          user: true
        }, { root: true })
        // end
        resolve()
      })
    },
    /**
     * 切换侧边栏展开和收缩
     * @param {Object} state vuex state
     */
    asideCollapseToggle ({ state, dispatch }) {
      return new Promise(async resolve => {
        // store 赋值
        state.asideCollapse = !state.asideCollapse
        // 持久化
        await dispatch('d2admin/db/set', {
          dbName: 'sys',
          path: 'menu.asideCollapse',
          value: state.asideCollapse,
          user: true
        }, { root: true })
        // end
        resolve()
      })
    },
    /**
     * 从持久化数据读取侧边栏展开或者收缩
     * @param {Object} state vuex state
     */
    asideCollapseLoad ({ state, dispatch }) {
      return new Promise(async resolve => {
        // store 赋值
        state.asideCollapse = await dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'menu.asideCollapse',
          defaultValue: setting.menu.asideCollapse,
          user: true
        }, { root: true })
        // end
        resolve()
      })
    }
  },
  mutations: {
    /**
     * @description 设置顶栏菜单
     * @param {Object} state vuex state
     * @param {Array} menu menu setting
     */
    headerSet (state, menu) {
      // store 赋值
      state.header = util.initHeaderMenu(menu)
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'menu.header',
        value: state.header,
        user: true
      })
    },
    /**
     * @description 设置侧边栏菜单
     * @param {Object} state vuex state
     * @param {Array} menu menu setting
     */
    asideSet (state, menu) {
      // store 赋值
      state.aside = util.initAsideMenu(menu)
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'menu.aside',
        value: state.aside,
        user: true
      })
    }
  }
}
