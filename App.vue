<script>
	import { mapState, mapGetters, mapMutations, mapActions } from "vuex"
	export default {
		onLaunch: function(options) {
			console.log("App Launch");
			
			// 保存分享参数（H5、小程序）
			options.query.scene && this.setShare({ spm: options.query.scene })
			// 获取配置信息
			this.getConfigInfo()
			
			// #ifdef MP-WEIXIN
			// 朋友圈场景
			if(options.scene === 1155) {
				if(options.path != 'pages/home/index') {
					uni.switchTab({
						url: '/pages/home/index'
					})
				}
			}
			// 小程序更新
			const updateManager = uni.getUpdateManager()
			updateManager.onCheckForUpdate(function (res) {
				// 请求完新版本信息的回调
				console.log(res.hasUpdate, "版本检测");
				if(res.hasUpdate) {
					updateManager.onUpdateReady(function (res) {
						uni.showModal({
							title: '更新提示',
							content: '新版本已经准备好，是否重启应用？',
							success: res => {
								if (res.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate()
								}
							}
						})
					})
					updateManager.onUpdateFailed(function (res) {
						// 新版本下载失败
						uni.showModal({
							title: '提示',
							content: '新版小程序下载失败\n请自行退出程序，手动卸载本程序，再运行',
							confirmText: "知道了"
						});
					})
				}
			})
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			...mapActions("app", ["getConfigInfo"]),
			...mapMutations("app", ["setShare"])
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/uview-ui/index.scss";
	@import "@/common/style/style.scss";
</style>
