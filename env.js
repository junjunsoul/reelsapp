// #ifdef MP-WEIXIN
let BASE_URL = '', SIGN = ''
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
extConfig = Object.keys(extConfig).length==0?{
	domain:'duanju.nymaite.cn',
	sign:''
}:extConfig

if(Object.keys(extConfig).length === 0) {
	uni.showModal({
		title: '未配置ext信息，请联系管理员'
	})
} else {
	if(!extConfig.domain) {
		uni.showModal({
			title: '域名信息有误，请联系管理员'
		})
	}
	BASE_URL = 'https://' + extConfig.domain
	SIGN = extConfig.sign
}
export {
	BASE_URL,
	SIGN
}
// #endif
 