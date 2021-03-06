import axios from "axios";
import { ElMessage } from "element-plus";
import config from "./../config";
import storage from "./storage"
import router from './../router'
const TOKEN_ERROR = "token验证失败，请重新登录"
const NETWORKE_ERROR = "网络异常，请稍后再试"
const service = axios.create({
  baseURL: config.baseApi,
  timeout: 8000
})

service.interceptors.request.use((req) => {
  const { headers } = req;
  const userInfo = storage.getItem('userInfo') || {}
  if (!headers.Authorization) headers.Authorization = userInfo.token;
  return req
})

service.interceptors.response.use((res) => {
  const { code, data, msg } = res.data;
  if (code === 200) {
    return data;
  } else if (code === 500001) {
    ElMessage.error(TOKEN_ERROR);
    router.push('/login')
    return Promise.reject(TOKEN_ERROR)
  } else {
    ElMessage.error(msg || NETWORKE_ERROR);
    return Promise.reject(msg || NETWORKE_ERROR)
  }
})

function request(option) {
  option.method = option.method || 'get'
  if (option.method.toLowerCase() === 'get') {
    option.params = option.data
  }
  if (config.env === 'prod') {
    service.defaults.baseURL = config.baseApi
  } else {
    let isMock = config.mock;
    if ("mock" in option) {
      isMock = option.mock
    }
    service.defaults.baseURL = isMock ? config.mockApi : config.baseApi
  }
  return service(option)
}

['get', 'post', 'put', 'delete', 'patch'].forEach(item => {
  request[item] = (url, data, option) => {
    return request({
      method: item,
      url,
      data,
      ...option
    })
  }
})

export default request