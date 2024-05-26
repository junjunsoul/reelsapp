import request from 'common/request/index.js'
import utils from 'common/utils/index.js'

import store from '..'
import { BASE_URL, SIGN } from '@/env.js';

export default {
	namespaced: true,
	state: {
		config: "",
		appid: "",
		title: "",
		copyright: [],
		richtext: "",
		options: "",
		share: "",
		jwx: false,
		iosIsPay: false,
		updateInfo: {},
		videoAutoplay: 0,
		playletShare: {
			id: "",
			title: "",
			image: "",
			desc: ""
		}
	},
	getters: {
		config: state => state.config,
		appid: state => state.appid,
		title: state => state.title,
		copyright: state => state.copyright,
		richtext: state => state.richtext,
		options: state => state.options,
		share: state => state.share,
		jwx: state => state.jwx,
		iosIsPay: state => state.iosIsPay,
		updateInfo: state => state.updateInfo,
		videoAutoplay: state => state.videoAutoplay
	},
	mutations: {
		setConfig(state, data) {
			state.config = data
		},
		setAppid(state, data) {
			state.appid = data
		},
		setTitle(state, data) {
			state.title = data
		},
		setCopyright(state, data) {
			state.copyright = data
		},
		setRichtext(state, data) {
			state.richtext = data
		},
		setOptions(state, data) {
			state.options = data
		},
		setShare(state, data) {
			state.share = data
		},
		setJwx(state, data) {
			state.jwx = data
		},
		setIosIsPay(state, data) {
			state.iosIsPay = data
		},
		setUpdateInfo(state, data) {
			state.updateInfo = data
		},
		setVideoAutoplay(state, data) {
			state.videoAutoplay = data
		}
	},
	actions: {
		// 获取配置信息
		async getConfigInfo({ commit, dispatch, getters, state }, options) {
			const result = await request("common.init", {
				platform: utils.platforms() || 'H5'
			})
			if(result.code === 1) {
				commit("setConfig", result.data)
				
				if(utils.platforms() === 'wxOfficialAccount' || utils.platforms() === 'wxMiniProgram') {
					commit("setAppid", result.data.wechat.appid)
				}
	
				const isIos = uni.getSystemInfoSync().osName == 'ios' ? true : false
				const apay = result.data.apple_pay == 0 ? false : true
				commit("setIosIsPay", !apay && isIos ? false : true)
				commit("setTitle", result.data.system.name)
				commit("setCopyright", result.data.system.copyright)
				commit("setRichtext", result.data.system)
				return result.data
			}
			return false
		},
		// 微信分享配置信息
		async getWxShareConfigInfo({ commit, dispatch, getters, state }) {
			
		}
	}
}