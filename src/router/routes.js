import layoutHeaderAside from '@/layout/header-aside'

// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    redirect: { name: 'index' },
    component: layoutHeaderAside,
    children: [
      // 首页
      {
        path: 'index',
        name: 'index',
        meta: {
          auth: true
        },
        component: _import('system/index')
      },
      // 系统 前端日志
      {
        path: 'log',
        name: 'log',
        meta: {
          title: '前端日志',
          auth: true
        },
        component: _import('system/log')
      },
      // 刷新页面 必须保留
      {
        path: 'refresh',
        name: 'refresh',
        hidden: true,
        component: _import('system/function/refresh')
      },
      // 页面重定向 必须保留
      {
        path: 'redirect/:route*',
        name: 'redirect',
        hidden: true,
        component: _import('system/function/redirect')
      }
    ]
  },
  // iframe
  {
    path: '/myiframe',
    redirect: '/myiframe',
    component: layoutHeaderAside,
    children: [
      {
        path: ':routerPath',
        name: 'iframe',
        meta: {
          requiresAuth: true,
          title: 'iframe'
        },
        component: () => import('@/views/system/iframe')
      }
    ]
  },
  {
    path: '/admin',
    component: layoutHeaderAside,
    meta: {
      requiresAuth: true,
      title: '系统管理'
    },
    children: [
      {
        path: 'user',
        name: 'user',
        meta: {
          requiresAuth: true,
          title: '用户管理'
        },
        component: () => import('@/views/taroco/admin/user')
      },
      {
        path: 'menu',
        name: 'menu',
        meta: {
          requiresAuth: true,
          title: '菜单管理'
        },
        component: () => import('@/views/taroco/admin/menu')
      },
      {
        path: 'role',
        name: 'role',
        meta: {
          requiresAuth: true,
          title: '角色管理'
        },
        component: () => import('@/views/taroco/admin/role')
      },
      {
        path: 'auth',
        name: 'auth',
        meta: {
          requiresAuth: true,
          title: '权限管理'
        },
        component: () => import('@/views/taroco/admin/auth')
      },
      {
        path: 'log',
        name: 'log',
        meta: {
          requiresAuth: true,
          title: '日志管理'
        },
        component: () => import('@/views/taroco/admin/log')
      },
      {
        path: 'dict',
        name: 'dict',
        meta: {
          requiresAuth: true,
          title: '字典管理'
        },
        component: () => import('@/views/taroco/admin/dict')
      },
      {
        path: 'dept',
        name: 'dept',
        meta: {
          requiresAuth: true,
          title: '部门管理'
        },
        component: () => import('@/views/taroco/admin/dept')
      },
      {
        path: 'route',
        name: 'route',
        meta: {
          requiresAuth: true,
          title: '路由管理'
        },
        component: () => import('@/views/taroco/admin/route')
      },
      {
        path: 'client',
        name: 'client',
        meta: {
          requiresAuth: true,
          title: '客户端管理'
        },
        component: () => import('@/views/taroco/admin/client')
      }
    ]
  },
  {
    path: '/taroco-admin',
    component: layoutHeaderAside,
    meta: {
      requiresAuth: true,
      title: '服务管理'
    },
    children: [
      {
        path: 'taroco-api',
        name: 'taroco-api',
        meta: {
          requiresAuth: true,
          title: '接口文档'
        },
        component: () => import('@/views/taroco/service/swagger')
      },
      {
        path: 'taroco-governance',
        name: 'taroco-governance',
        meta: {
          requiresAuth: true,
          title: '服务治理'
        },
        component: () => import('@/views/taroco/service/governance')
      }
    ]
  }
]

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 登录
  {
    path: '/login',
    name: 'login',
    component: _import('system/login')
  }
]

/**
 * 错误页面
 */
const errorPage = [
  {
    path: '*',
    name: '404',
    component: _import('system/error/404')
  }
]

// 导出需要显示菜单的
export const frameInRoutes = frameIn

// 重新组织后导出
export default [
  ...frameIn,
  ...frameOut,
  ...errorPage
]
