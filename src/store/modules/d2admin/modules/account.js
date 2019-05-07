import util from '@/libs/util.js'
import { loginByUsername, logout } from '@/api/login'
import { GetMenu } from '@/api/menu'
import { frameInRoutes } from '@/router/routes'
import { Loading } from 'element-ui'

export default {
  namespaced: true,
  actions: {
    /**
     * @description 登陆
     * @param {Object} param context
     * @param {Object} param username {String} 用户账号
     * @param {Object} param password {String} 密码
     */
    login ({ commit, dispatch }, { vm, username, password, code, randomStr }) {
      // 开始请求登录接口
      const loading = Loading.service()
      loginByUsername(username, password, code, randomStr)
        .then(res => {
          // 设置 cookie 一定要存 uuid 和 token 两个 cookie
          // 整个系统依赖这两个数据进行校验和存储
          // uuid 是用户身份唯一标识 用户注册的时候确定 并且不可改变 不可重复
          // token 代表用户当前登录状态 建议在网络请求中携带 token
          // 如有必要 token 需要定时更新，默认保存一天
          util.cookies.set('uuid', res.data.userId)
          util.cookies.set('token', res.data.access_token)
          util.setToken(res.data.access_token)
          // 设置 vuex token信息
          commit('d2admin/user/SET_ACCESS_TOKEN', res.data.access_token, { root: true })
          commit('d2admin/user/SET_REFRESH_TOKEN', res.data.refresh_token, { root: true })
          commit('d2admin/user/SET_USER_INFO', {username: res.data['x-user-name']}, { root: true })
          commit('d2admin/user/SET_ROLES', res.data['x-user-role'], { root: true })
          commit('d2admin/user/SET_PERMISSIONS', res.data['x-user-permission'], { root: true })
          // 用户登陆后从持久化数据加载一系列的设置
          commit('load')
          GetMenu().then(res => {
            // 设置用户菜单
            commit('d2admin/user/SET_MENU', res.data, { root: true })
            // 多页面控制: 处理路由 得到每一级的路由设置
            commit('d2admin/page/init', frameInRoutes, { root: true })
            // 设置顶栏菜单
            commit('d2admin/menu/headerSet', res.data, { root: true })
            // 跳转路由
            vm.$router.push({
              name: 'index'
            })
          })
        })
        .finally(() => {
          loading.close()
        })
        .catch(err => {
          console.group('登陆出错')
          console.log('err: ', err)
          console.groupEnd()
        })
    },
    /**
     * @description 注销用户并返回登陆页面
     * @param {Object} param context
     * @param {Object} param vm {Object} vue 实例
     * @param {Object} param confirm {Boolean} 是否需要确认
     */
    logout ({ commit }, { vm, confirm = false }) {
      /**
       * @description 注销
       */
      function doLogout () {
        logout(util.getToken()).then(() => {
          // 删除cookie
          util.cookies.remove('token')
          util.cookies.remove('uuid')
          util.removeToken()
          // 跳转路由
          vm.$router.push({
            name: 'login'
          })
        }).catch(error => {
          console.group('退出登录出错')
          console.log('err: ', error)
          console.groupEnd()
        })
      }
      // 判断是否需要确认
      if (confirm) {
        commit('d2admin/gray/set', true, { root: true })
        vm.$confirm('注销当前账户吗?  打开的标签页和用户设置将会被保存。', '确认操作', {
          confirmButtonText: '确定注销',
          cancelButtonText: '放弃',
          type: 'warning'
        })
          .then(() => {
            commit('d2admin/gray/set', false, { root: true })
            // 清空db中用户数据
            vm.$store.dispatch('d2admin/db/databaseClear', {
              dbName: 'sys',
              user: true
            })
            doLogout()
          })
          .catch(() => {
            commit('d2admin/gray/set', false, { root: true })
            vm.$message('放弃注销用户')
          })
      } else {
        doLogout()
      }
    }
  },
  mutations: {
    /**
     * @description 用户登陆后从持久化数据加载一系列的配置
     * @param {Object} state vuex state
     */
    load (state) {
      // DB -> store 加载用户所有信息, 包括动态添加路由
      this.commit('d2admin/user/load')
      // DB -> store 加载主题
      this.commit('d2admin/theme/load')
      // DB -> store 加载页面过渡效果设置
      this.commit('d2admin/transition/load')
      // DB -> store 持久化数据加载上次退出时的多页列表
      this.commit('d2admin/page/openedLoad')
      // DB -> store 持久化数据加载这个用户之前设置的侧边栏折叠状态
      this.commit('d2admin/menu/asideCollapseLoad')
    }
  }
}
