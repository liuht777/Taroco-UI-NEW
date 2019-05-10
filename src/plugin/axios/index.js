import { validatenull } from '@/libs/validate'
import axios from 'axios'
import store from '@/store'
import util from '@/libs/util'
import { Message } from 'element-ui'
import router from '@/router'

// 创建一个 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  withCredentials: true, // 跨域请求，允许保存cookie
  timeout: 30000 // 请求超时时间
})

// HTTPrequest拦截
service.interceptors.request.use(config => {
  if (util.cookies.get('token')) {
    config.headers['Authorization'] = 'Bearer ' + util.cookies.get('token') // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
  }
  return config
}, error => {
  return Promise.reject(error)
})
// HTTPresponse拦截
service.interceptors.response.use(data => {
  let res = data.data
  if (res.status && res.status !== 'SUCCEED') {
    let errMsg = res.errorMessage
    if (!validatenull(errMsg)) {
      Message({
        message: errMsg,
        type: 'error'
      })
    }
  }
  return data
}, error => {
  let errMsg
  if (error && error.response) {
    if (error.response.data && error.response.data.status && error.response.data.status === 'FAILED') {
      errMsg = error.response.data.errorMessage
    }
    if (validatenull(errMsg)) {
      switch (error.response.status) {
        case 400:
          errMsg = '错误请求, 请检查请求参数'
          if (error.response.data.error_description) {
            errMsg = error.response.data.error_description
          }
          break
        case 401:
          errMsg = '当前操作没有权限'
          if (error.response.data && error.response.data.error === 'invalid_token') {
            errMsg = '无效的Token'
            util.cookies.remove('token')
            util.cookies.remove('uuid')
            // 清空db中用户数据
            store.dispatch('d2admin/db/databaseClear', {
              dbName: 'sys',
              user: true
            })
            router.push({
              name: 'login'
            })
          }
          break
        case 403:
          errMsg = '当前操作没有权限'
          break
        case 404:
          errMsg = '未找到该资源'
          break
        case 405:
          errMsg = '请求方法未允许'
          break
        case 408:
          errMsg = '请求超时'
          break
        case 478:
          errMsg = '验证码错误,请重新输入'
          break
        case 479:
          errMsg = '演示环境，没有权限操作'
          break
        case 500:
          errMsg = '服务器端出错'
          break
        case 501:
          errMsg = '网络未实现'
          break
        case 502:
          errMsg = '网络错误'
          break
        case 503:
          errMsg = '服务不可用'
          break
        case 504:
          errMsg = '网络超时'
          break
        case 505:
          errMsg = 'http版本不支持该请求'
          break
        default:
          errMsg = '系统未知错误,请反馈给管理员'
          break
      }
    }
  }

  if (!validatenull(errMsg)) {
    error.message = errMsg
    Message({
      message: errMsg,
      type: 'error'
    })
  }
  return Promise.reject(error)
})
export default service
