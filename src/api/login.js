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
  var scope = 'All'
  return request({
    url: '/auth/oauth/token',
    headers: {
      'Authorization': 'Basic NWQyMmViNmU4YjBjN2JhMDY2MDE0Mzk4OjEyMzQ1Ng=='
    },
    method: 'post',
    params: { username, password, randomStr, code, 'grant_type': grantType, scope }
  })
}

/**
 * 手机号登录
 *
 * @param {手机号} mobile
 * @param {验证码} code
 */
export const loginByMobile = (mobile, code) => {
  return request({
    url: '/auth/oauth/mobile',
    headers: {
      'Authorization': 'Basic NWQyMmViNmU4YjBjN2JhMDY2MDE0Mzk4OjEyMzQ1Ng=='
    },
    method: 'post',
    params: { mobile, code }
  })
}
