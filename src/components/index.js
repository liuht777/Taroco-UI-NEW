import Vue from 'vue'

import d2Container from './d2-container'
import d2ContainerFrame from './d2-container-frame'

// 注意 有些组件使用异步加载会有影响
Vue.component('d2-container', d2Container)
Vue.component('d2-container-iframe', d2ContainerFrame)
Vue.component('d2-icon', () => import('./d2-icon'))
Vue.component('d2-icon-svg', () => import('./d2-icon-svg/index.vue'))
Vue.component('d2-icon-select', () => import('./d2-icon-select/index.vue'))
Vue.component('d2-icon-svg-select', () => import('./d2-icon-svg-select/index.vue'))
Vue.component('tree-table', () => import('./TreeTable/index.vue'))
Vue.component('ta-role-member-set', () => import('./taroco/role/member-set.vue'))
Vue.component('ta-role-permission-set', () => import('./taroco/role/permission-set.vue'))
