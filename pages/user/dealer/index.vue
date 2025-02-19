<template>
	<view class="page_content">
		<view class="head_content">
			<CustomNavbar title="开通经销商"></CustomNavbar>
		</view>
		<view class="main_content">
			<view class="info_box">
				<view class="user">
					<view class="avatar">
						<image class="image" :src="userInfo.avatar" mode="aspectFill"></image>
					</view>
					<view class="content" v-if="level == 0">
						<view class="p1">亲爱的平台用户，您好</view>
						<view class="p2">您还不是分销商，请在下面点击开通经销商</view>
					</view>
					<view class="content" v-else>
						<view class="p1">亲爱的{{ userInfo.levelText }}，您好</view>
						<view class="p2">恭喜你，您已是我们的{{ userInfo.levelText }}</view>
					</view>
				</view>
				<view class="card">
					<view class="texts" v-if="level == 0">
						<text class="text1">平台用户</text>
						<text class="text3">永久有效</text>
					</view>
					<view class="texts" v-else>
						<text class="text1">{{ userInfo.levelText }}</text>
						<!-- <text class="text2">开通时间:2023年5月26日</text> -->
						<text class="text3">{{ userInfo.expireText }}</text>
					</view>
				</view>
			</view>
			<view class="content_box">
				<view class="level_box">
					<view class="title">等级分类</view>
					<view class="list_box" v-if="levelData.length">
						<view class="item" :class="{ active: item.level == dredgeLevel }" v-for="(item, index) in levelData" :key="index" @click="levelCardClick(item)">
							<view class="text1">{{ item.expire_text }}</view>
							<view class="text2">
								<text>￥</text>
								<text class="num">{{ item.price }}</text>
							</view>
							<view class="text3">直接分润{{ Number(item.direct) }}%</view>
							<view class="text3">间接分润{{ Number(item.indirect) }}%</view>
							<view class="tip">{{ item.name }}</view>
						</view>
					</view>
				</view>
				<view class="text_box">
					<u-parse :content="msg"></u-parse>
				</view>
			</view>
		</view>
		<view class="footer_content" v-if="levelData.length">
			<view class="button_box">
				<u-button text="立即开通" v-if="dredgeLevel != 0" :loading="buttonLoading" :customStyle="buttonStyle" @click="dredgeDealer" />
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from "vuex"
	export default {
		data() {
			return {
				buttonStyle: {
					width: '100%',
					height: '108rpx',
					border: 'none',
					fontSize: '32rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, #F28B45 0%, #FEB787 100%)',
					borderRadius: '16rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				buttonLoading: false,
				msg: '',
				levelData: [], // 等级列表
				level: 0, // 自己的等级
				dredgeLevel: 0, // 需要开通的等级
				maxLevel: 0, // 最大等级
				dredge: { // 需要开通的参数
					reseller_id: '',
					total_fee: ''
				},
				userInfo: ''
			}
		},
		computed: {
			...mapGetters("user", ["token"]),
			...mapGetters("app", ["iosIsPay"])
		},
		watch: {
			
		},
		onPageScroll(e) {
			let colorAlpha = e.scrollTop > 100 ? 0.95 : e.scrollTop * 0.0095
			this.navbarBg = `rgba(255, 255, 255, ${colorAlpha})`
		},
		onLoad() {
			this.getPageData()
		},
		methods: {
			...mapActions("user", ["getUserInfo"]),
			// 开通经销商
			dredgeDealer() {
				// #ifdef MP-WEIXIN
				if(!this.iosIsPay) return this.jumpView('/pages/user/info/contact')
				// #endif
				
				const buy = () => {
					this.buttonLoading = true
					uni.showLoading({
						title: '开通中...',
						mask: true
					})
					
					this.$request('dealer.createOrder', {
						...this.dredge,
						platform: this.$utils.platforms()
					}).then(res => {
						if(res.code === 1) {
							this.callPay(res.data.order_sn, 'wechat', res.data.platform)
						} else {
							this.buttonLoading = false
							uni.hideLoading()
						}
					}).catch(err => {
						this.buttonLoading = false
						uni.hideLoading()
					})
				}
				
				if(this.dredgeLevel < this.level) {
					uni.showModal({
						title: '提示',
						content: '当前购买等级小于已购买等级，是否继续购买？',
						success: (res) => {
							if (res.confirm) {
								buy()
							} else if (res.cancel) {}
						}
					});
				} else {
					buy()
				}
			},
			// 发起支付请求
			callPay(order_sn, payment, platform) {
				this.$request('common.pay', {
					order_sn,
					payment,
					platform
				}).then(res => {
					if(res.code === 1) {
						if(platform == 'H5') {
							const div = document.createElement('divpay');
							div.innerHTML = res.data.pay_data;
							document.body.appendChild(div);
						} else {
							this.pay(res.data.pay_data)
						}
					} else {
						this.buttonLoading = false
						uni.hideLoading()
					}
				}).catch(err => {
					this.buttonLoading = false
					uni.hideLoading()
				})
			},
			// 调起微信小程序/公众号支付
			pay(pay) {
				// #ifdef MP-WEIXIN
				uni.requestPayment({
					timeStamp: pay.timeStamp,
					nonceStr: pay.nonceStr,
					package: pay.package,
					signType: pay.signType,
					paySign: pay.paySign,
					success: success => {
						uni.showToast({
						    title: '支付成功',
							icon: 'none',
							duration: 2000
						});
						this.buttonLoading = false
						this.getPageData()
						uni.hideLoading()
					},
					fail: fail => {
						uni.showToast({
						    title: '支付失败',
							icon: 'none',
							duration: 2000
						});
						this.buttonLoading = false
						uni.hideLoading()
					}
				})
				// #endif
			},
			// 点击的经销商等级
			levelCardClick(item) {
				this.dredgeLevel = item.level
				this.dredgeLevelId = item.id
			
				this.dredge.reseller_id = item.id
				this.dredge.total_fee = item.price
			},
			// 经销商等级
			dealerLevelList() {
				this.$request('dealer.level').then(res => {
					if(res.code === 1) {
						this.levelData = res.data.list
						// this.msg = res.data.list[0].content
						this.msg = res.data.reseller_desc.content
						let level = res.data.list.map(obj => obj.level);
						this.maxLevel = Math.max(...level)
						this.dredgeLevel = this.level + 1 > this.maxLevel ? this.maxLevel : this.level + 1
						if(this.dredgeLevel <= this.maxLevel) {
							let item = res.data.list.filter(item => item.level == this.dredgeLevel)[0]
							this.dredge.reseller_id = item.id
							this.dredge.total_fee = item.price
						}
					}
				})
			},
			// 个人信息
			getPageData() {
				this.getUserInfo().then(res => {
					if(res.code === 1) {
						this.level = res.data.reseller ? res.data.reseller.level : 0
						// this.userInfo = { avatar: res.data.avatar }
						this.userInfo = res.data
						if(res.data.reseller) {
							let obj = {
								id: res.data.reseller.reseller_id,
								level: res.data.reseller.level,
								levelText: res.data.reseller.reseller_json.name,
								expireText: res.data.reseller.expiretime_text
							}
							
							this.userInfo = {
								...this.userInfo,
								...obj
							}
						}
						this.dealerLevelList()
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		position: relative;
		
		&::before {
			content: "";
			width: 100%;
			height: 410rpx;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 0;
			background-image: url('~@/static/images/v_bg.png');
			background-repeat: no-repeat;
			background-size: auto 100%;
			background-position: 110% 100%;
		}
		
		.head_content {
			background: #F9F9FB;
		}
		
		.main_content {
			overflow-x: hidden;
			padding-bottom: 200rpx;
			
			.info_box {
				width: 140%;
				background: #F9F9FB;
				border-radius: 0 0 50% 50%;
				margin-left: -20%;
				padding: 0 calc(20% + 32rpx);
				overflow: hidden;
				  
				.user {
					position: relative;
					display: flex;
					align-items: center;
					margin-top: 10rpx;
					
					.avatar {
						width: 114rpx;
						height: 114rpx;
						border-radius: 50%;
						overflow: hidden;
						
						.image {
							width: 100%;
							height: 100%;
						}
					}
					
					.content {
						margin-left: 24rpx;
						
						.p1 {
							font-size: 32rpx;
							color: #333;
							margin-bottom: 8rpx;
							font-weight: 700;
						}
						
						.p2 {
							font-size: 28rpx;
							color: #999;
						}
					}
				}
				
				.card {
					position: relative;
					height: 120rpx;
					margin-top: 10rpx;
					border-radius: 16rpx;
					padding: 32rpx 40rpx 0 40rpx;
					background: linear-gradient(269.64deg, rgba(92, 86, 96, 1) 0%, rgba(57, 52, 59, 1) 100%);
					
					&::before {
						content: "";
						width: 100%;
						height: 100%;
						position: absolute;
						top: 0;
						left: 0;
						background-image: url('~@/static/images/line_bg.png');
						background-repeat: no-repeat;
						background-size: auto 110%;
						background-position: 50% 0;
					}
					
					.texts {
						position: relative;
						display: flex;
						align-items: center;
						justify-content: space-between;
						
						.text1 {
							font-size: 36rpx;
							// color: #E6BD70;
							// color: #F28C46;
							color: #FEB787;
							font-weight: 700;
						}
						
						.text2 {
							font-size: 24rpx;
							color: #fff;
						}
						
						.text3 {
							font-size: 24rpx;
							color: #fff;
						}
					}
				}
			}
			
			.content_box {
				padding: 32rpx;
				
				.level_box {
					position: relative;
					background: #fff;
					
					.title {
						font-size: 36rpx;
						font-weight: 700;
						color: #272D2F;
					}
					
					.list_box {
						margin-top: 36rpx;
						display: flex;
						flex-wrap: wrap;
						
						.item {
							position: relative;
							width: calc((100% - 60rpx) / 3);
							border-radius: 20rpx;
							padding: 72rpx 20rpx 36rpx 20rpx;
							border: 4rpx solid transparent;
							background: rgba(77, 77, 77, 1);
							margin: 0 30rpx 30rpx 0;
							
							&:nth-child(3n) {
								margin-right: 0;
							}
							
							&.active {
								background-clip: padding-box, border-box;
								background-origin: padding-box, border-box;
								background-image: linear-gradient(to right, #000, #000), linear-gradient(90deg, #F28D48 0%, #FEB685 100%);
							}
							
							.text1 {
								font-size: 28rpx;
								color: #fff;
							}
							
							.text2 {
								font-size: 36rpx;
								color: #F28C46;
								margin: 8rpx 0;
								
								.num {
									font-size: 64rpx;
									font-weight: 900;
								}
							}
							
							.text3 {
								font-size: 24rpx;
								color: #fff;
							}
							
							.tip {
								font-size: 24rpx;
								font-weight: 700;
								color: #fff;
								padding: 8rpx 16rpx;
								border-radius: 0 20rpx 0 20rpx;
								background: linear-gradient(90deg, #F28B45 0%, #FEB787 100%);
								position: absolute;
								top: -4rpx;
								right: -4rpx;
							}
						}
					}
				}
				
				.text_box {
					margin-top: 40rpx;
					border-radius: 16rpx;
					box-shadow: 0 0 60rpx 0 rgba(102, 102, 102, 0.15);
					padding: 40rpx;
					font-size: 28rpx;
					color: rgba(51, 51, 51, 1);
					overflow: hidden;
					
					.title {
						font-weight: bold;
						padding-bottom: 36rpx;
						border-bottom: 2rpx solid rgba(221, 221, 221, 1);
						margin-bottom: 36rpx;
					}
				}
			}
		}
	
		.footer_content {
			width: 100%;
			padding: 0 32rpx;
			position: fixed;
			bottom: 40rpx;
			left: 0;
		}
	}
</style>
