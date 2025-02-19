import apiList from './api.js';
import { BASE_URL, SIGN } from '@/env.js';
import store from '@/common/store/index.js'

// 组装接口路径
const getApiPath = path => {
	let apiArray = path.split("."),
		api = apiList
	apiArray.forEach(v => {
		api = api[v]
	});
	return api
}

// 发起请求的函数
const request = (path, data, error = true) => {
	if(!BASE_URL) {
		uni.showModal({ title: '未检测到域名地址，请联系管理员' })
		throw (`未检测到域名, 已阻止此次API请求`)
	}
	const api = getApiPath(path)
	if(!api) throw (`接口未定义, 已阻止此次API请求`)
	const url = BASE_URL + api.url,
		  method = api.method
	// 通过Promise封装请求, 返回异步请求结果
	return new Promise(async (resolve, reject) => {
		uni.request({
			url,
			data,
			method,
			header: {
				'Content-Type': method === 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
				'Token': store.state.user.token || '',
				'Sign': SIGN || ''
			},
			success: res => {
				if(res.statusCode === 200) {
					if(res.data.code != 1 && res.data.code != 1314 && error) {
						uni.showToast({
							title: res.data.msg || `error => ${BASE_URL || 'NULL'} => ${SIGN || 'NULL'}`,
							icon: 'none',
							mask: true,
							duration: 3000
						})
					}
				} else if (res.statusCode === 401){
					if(res.data.code === 401) {
						store.dispatch('user/logout')
						
						uni.showModal({
							title: '系统提示',
							content: '本操作需要您进行登录验证',
							success: res => {
								if(res.confirm) {
									uni.navigateTo({
										url: '/pages/login/login'
									})
								}
							}
						})
					}
				} else {
					uni.showToast({
						title: res.statusCode.toString(),
						icon: 'none'
					})
				}

				resolve(res.data)
			},
			fail: err => {
				uni.showToast({
					title: err.errMsg,
					icon: 'none',
					duration: 3000
				})
				// uni.showToast({
				// 	title: `服务器开小差 => ${BASE_URL || 'NULL'} => ${SIGN || 'NULL'}`,
				// 	icon: 'none'
				// })
				reject(err)
			}
		})
	})
}

export default request