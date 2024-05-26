import request from 'common/request/index.js'
import { BASE_URL, SIGN } from '@/env.js';
import store from '..'

export default {
	namespaced: true,
	state: {
		token: "",
		userInfo: "",
		usable: 0,
		uid: 0
	},
	getters: {
		token: state => state.token,
		userInfo: state => state.userInfo,
		usable: state => state.usable,
		uid: state => state.uid
	},
	mutations: {
		setToken(state, token) {
			state.token = token
		},
		setUserInfo(state, data) {
			state.userInfo = data
		},
		setUsable(state, data) {
			state.usable = data
		},
		setUid(state, data) {
			state.uid = data
		}
	},
	actions: {
		// 获取用户信息
		async getUserInfo({ commit, dispatch, getters, state }, token = "") {
			const result = await new Promise((resolve, reject) => {
				token && commit("setToken", token)
				request("user.info")
					.then(res => {
						if (res.code === 1) {
							commit("setUserInfo", res.data)
							commit("setUsable", res.data.usable)
							commit("setUid", res.data.user_id)
							if(!store.state.app.jwx) {
								store.dispatch("app/getWxShareConfigInfo")
							}
							resolve(res)
						} else {
							reject(res)
						}
					})
					.catch(err => {
						reject(err)
					})
			})
			return result
		},
		// 清除权限
		async logout({ commit, dispatch, getters, state }) {
			commit("setToken", "")
			commit("setUserInfo", "")
			if(store.state.app.jwx) {
				store.dispatch("app/getWxShareConfigInfo")
			}
		}
	}
}
