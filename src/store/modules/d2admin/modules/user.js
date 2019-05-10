export default {
  namespaced: true,
  state: {
    // 用户信息
    info: {},
    accessToken: '',
    refreshToken: '',
    roles: [],
    menu: [],
    permissions: []
  },
  actions: {
    /**
     * @description 从数据库取用户数据
     * @param {Object} state vuex state
     */
    load ({ state, dispatch }) {
      return new Promise(async resolve => {
        // 从持久化加载用户一系列数据
        state.info = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.info',
          defaultValue: {},
          user: true
        })
        state.accessToken = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.accessToken',
          defaultValue: '',
          user: true
        })
        state.refreshToken = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.refreshToken',
          defaultValue: '',
          user: true
        })
        state.roles = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.roles',
          defaultValue: [],
          user: true
        })
        state.menu = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.menu',
          defaultValue: [],
          user: true
        })
        state.permissions = await this.dispatch('d2admin/db/get', {
          dbName: 'sys',
          path: 'user.permissions',
          defaultValue: [],
          user: true
        })
        // end
        resolve()
      })
    }
  },
  mutations: {
    /**
     * @description 设置用户数据
     * @param {Object} state vuex state
     * @param {*} info info
     */
    SET_USER_INFO (state, info) {
      // store 赋值
      state.info = info
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.info',
        value: info,
        user: true
      })
    },
    /**
     * 设置access_token
     */
    SET_ACCESS_TOKEN (state, accessToken) {
      state.accessToken = accessToken
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.accessToken',
        value: accessToken,
        user: true
      })
    },
    /**
     * 设置refresh_token
     */
    SET_REFRESH_TOKEN (state, refreshToken) {
      state.refreshToken = refreshToken
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.refreshToken',
        value: refreshToken,
        user: true
      })
    },
    /**
     * 设置菜单
     */
    SET_MENU (state, menu) {
      state.menu = menu
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.menu',
        value: menu,
        user: true
      })
    },
    /**
     * 设置角色
     */
    SET_ROLES (state, roles) {
      state.roles = roles
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.roles',
        value: roles,
        user: true
      })
    },
    /**
     * 设置数据权限
     */
    SET_PERMISSIONS (state, permissions) {
      if (!permissions) {
        return
      }
      const list = {}
      for (let i = 0; i < permissions.length; i++) {
        list[permissions[i]] = true
      }
      state.permissions = list
      // 持久化
      this.dispatch('d2admin/db/set', {
        dbName: 'sys',
        path: 'user.permissions',
        value: permissions,
        user: true
      })
    }
  }
}
