import request from '@/plugin/axios'

export function roleList () {
  return request({
    url: '/admin/role/roleList',
    method: 'get'
  })
}

export function fetchList (query) {
  return request({
    url: '/admin/role/rolePage',
    method: 'get',
    params: query
  })
}

export function deptRoleList (deptId) {
  return request({
    url: '/admin/role/roleList/' + deptId,
    method: 'get'
  })
}

export function getObj (id) {
  return request({
    url: '/admin/role/' + id,
    method: 'get'
  })
}

export function addObj (obj) {
  return request({
    url: '/admin/role/',
    method: 'post',
    data: obj
  })
}

export function putObj (obj) {
  return request({
    url: '/admin/role/',
    method: 'put',
    data: obj
  })
}

export function delObj (id) {
  return request({
    url: '/admin/role/' + id,
    method: 'delete'
  })
}

export function roleMenuUpd (roleId, menuIds) {
  return request({
    url: '/admin/role/roleMenuUpd',
    method: 'put',
    data: {
      roleId: roleId,
      menuIds: menuIds
    }
  })
}

export function fetchRoleTree (roleName) {
  return request({
    url: '/admin/menu/roleTree/' + roleName,
    method: 'get'
  })
}

export function fetchDeptTree (query) {
  return request({
    url: '/admin/dept/tree',
    method: 'get',
    params: query
  })
}

// 成员设置
export function roleMembersUpd (roleId, userIds, operate) {
  return request({
    url: `/admin/role/members/${operate}`,
    method: 'put',
    data: {
      roleId,
      userIds
    }
  })
}

export function roleMembersAdded (roleId, params) {
  return request({
    url: `/admin/role/members/added/${roleId}`,
    method: 'get',
    params
  })
}

export function roleMembersNotin (roleId, params) {
  return request({
    url: `/admin/role/members/notin/${roleId}`,
    method: 'get',
    params
  })
}

// 权限设置
export function rolePermissionsUpd (roleId, permissionIds, operate) {
  return request({
    url: `/admin/role/permissions/${operate}`,
    method: 'put',
    data: {
      roleId,
      permissionIds
    }
  })
}

export function rolePermissionsAdded (roleId, params) {
  return request({
    url: `/admin/role/permissions/added/${roleId}`,
    method: 'get',
    params
  })
}

export function rolePermissionsNotin (roleId, params) {
  return request({
    url: `/admin/role/permissions/notin/${roleId}`,
    method: 'get',
    params
  })
}
