import axios from 'axios'

const baseConfig = {
    timeout: 10 * 60 * 1000,
    headers: { 'content-type': 'application/json' },
    withCredentials: true
}

const requestInterceptor = config => {
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            timestamp: new Date().getTime()
        }
    }
    return config
}

export const requestHandleError = error => {
    return Promise.reject(error)
}

const responseInterceptor = response => {
    return response.data
}

const responseHandleError = error => {
    return Promise.reject(error)
}

export const createAxiosInstance = config => {
    const instance = axios.create({ ...config })
    instance.interceptors.request.use(requestInterceptor, requestHandleError)
    instance.interceptors.response.use(responseInterceptor, responseHandleError)
    return instance
}

export const service = createAxiosInstance(baseConfig)