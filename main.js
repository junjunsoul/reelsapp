import Vue from 'vue'
import App from './App'

import { BASE_URL, SIGN } from './env.js'
Vue.prototype.$BASE_URL = BASE_URL
Vue.prototype.$SIGN = SIGN

import uView from '@/uview-ui'
Vue.use(uView)

import request from '@/common/request/index.js'
Vue.prototype.$request = request

import utils from '@/common/utils/index.js'
Vue.prototype.$utils = utils

import store from '@/common/store/index.js'
Vue.prototype.$store = store

import CustomNavbar from '@/components/CustomNavbar.vue'
Vue.component('CustomNavbar', CustomNavbar)

import CustomBackTop from '@/components/CustomBackTop.vue'
Vue.component('CustomBackTop', CustomBackTop)

Vue.mixin({
	data() {
		return {
			shareData: {
				spm: this.$store.state.user.userInfo?.id ? `${this.$store.state.user?.userInfo?.id}.1.0.3.1` : "",
				title: this.$store.state.app.config?.share?.title ? this.$store.state.app.config?.share?.title : "",
				imageUrl: this.$store.state.app.config?.share?.image ? this.$store.state.app.config?.share?.image : "",
				desc: this.$store.state.app.config?.share?.description ? this.$store.state.app.config?.share?.description : ""
			}
		}
	},
	onLoad(option) {
		// #ifdef MP-WEIXIN
		wx.showShareMenu({
			withShareTicket: false,
			menus: ["shareAppMessage", "shareTimeline"]
		})
		// #endif
	},
	onShow() {
		
	},
	onShareAppMessage(res) {
		// #ifdef MP-WEIXIN
		this.$request('user.taskFinish', { type: 'share_wx_after' })
		return {
			title: this.shareData.title,
			path: `/pages/home/index?scene=${this.shareData.spm}`,
			imageUrl: this.shareData.imageUrl
		}
		// #endif
	},
	onShareTimeline(res) {
		// #ifdef MP-WEIXIN
		this.$request('user.taskFinish', { type: 'share_wxf_after' })
		return {
			title: this.shareData.title,
			query: `scene=${this.shareData.spm}`,
			imageUrl: this.shareData.imageUrl
		}
		// #endif
	},
	methods: {
		// 跳转页面
		jumpView(url) {
			uni.navigateTo({ url })
		},
		// 视频详情
		openVideoDetail(id, title, image, desc) {
			
		},
	}
})

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	store,
	...App
})
app.$mount()
