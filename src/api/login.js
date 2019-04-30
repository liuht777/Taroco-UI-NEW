import request from '@/plugin/axios'

/**
 * 登录
 * @param {用户名} username
 * @param {密码} password
 * @param {验证码} code
 * @param {验证码随机字符串} randomStr
 */
export const loginByUsername = (username, password, code, randomStr) => {
  var grantType = 'password'
  var scope = 'server'
  return request({
    url: '/auth/oauth/token',
    headers: {
      'Authorization': 'Basic dGFyb2NvOnRhcm9jbw=='
    },
    method: 'post',
    params: { username, password, randomStr, code, 'grant_type': grantType, scope }
  })
}

/**
 * 退出登录
 * @param {请求token} accesstoken
 */
export const logout = (accesstoken) => {
  return request({
    url: '/auth/authentication/removeToken',
    method: 'post',
    params: { accesstoken }
  })
}
