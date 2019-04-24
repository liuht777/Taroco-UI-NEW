// layout
import layoutHeaderAside from '@/layout/header-aside'

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    redirect: { name: 'index' },
    component: layoutHeaderAside,
    children: [
      {
        path: 'index',
        name: 'index',
        meta: {
          requiresAuth: true,
          title: '首页'
        },
        component: () => import('@/pages/index')
      }
    ]
  },
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
        component: () => import('@/pages/iframe')
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
        component: () => import('@/views/admin/user')
      },
      {
        path: 'menu',
        name: 'menu',
        meta: {
          requiresAuth: true,
          title: '菜单管理'
        },
        component: () => import('@/views/admin/menu')
      },
      {
        path: 'role',
        name: 'role',
        meta: {
          requiresAuth: true,
          title: '角色管理'
        },
        component: () => import('@/views/admin/role')
      },
      {
        path: 'auth',
        name: 'auth',
        meta: {
          requiresAuth: true,
          title: '权限管理'
        },
        component: () => import('@/views/admin/auth')
      },
      {
        path: 'log',
        name: 'log',
        meta: {
          requiresAuth: true,
          title: '日志管理'
        },
        component: () => import('@/views/admin/log')
      },
      {
        path: 'dict',
        name: 'dict',
        meta: {
          requiresAuth: true,
          title: '字典管理'
        },
        component: () => import('@/views/admin/dict')
      },
      {
        path: 'dept',
        name: 'dept',
        meta: {
          requiresAuth: true,
          title: '部门管理'
        },
        component: () => import('@/views/admin/dept')
      },
      {
        path: 'route',
        name: 'route',
        meta: {
          requiresAuth: true,
          title: '路由管理'
        },
        component: () => import('@/views/admin/route')
      },
      {
        path: 'client',
        name: 'client',
        meta: {
          requiresAuth: true,
          title: '客户端管理'
        },
        component: () => import('@/views/admin/client')
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
        component: () => import('@/views/service/swagger')
      }
    ]
  }
]

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 登陆
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login')
  }
]

/**
 * 错误页面
 */
const errorPage = [
  // 404
  {
    path: '*',
    name: '404',
    component: () => import('@/pages/error-page-404')
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
