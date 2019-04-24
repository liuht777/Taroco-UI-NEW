import request from '@/plugin/axios'

export function fetchList (query) {
  return request({
    url: '/admin/permission/page',
    method: 'get',
    params: query
  })
}

export function addObj (obj) {
  return request({
    url: '/admin/permission',
    method: 'post',
    data: obj
  })
}

export function getObj (id) {
  return request({
    url: '/admin/permission/' + id,
    method: 'get'
  })
}

export function delObj (id) {
  return request({
    url: '/admin/permission/' + id,
    method: 'delete'
  })
}

export function putObj (obj) {
  return request({
    url: '/admin/permission',
    method: 'put',
    data: obj
  })
}
