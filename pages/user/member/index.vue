<template>
	<view class="page_content">
		<view class="head_content">
			<CustomNavbar title="会员中心" color="#fff" bg="#262626"></CustomNavbar>
		</view>
		<view class="main_content">
			<view class="vip_box">
				<view class="top" v-if="userInfo.is_vip == 1">
					<view class="line1">尊贵的VIP用户</view>
					<view class="line2">
						<text class="text1"></text>
						<text class="text2">{{ userInfo.vip_expiretime_text }}到期</text>
					</view>
				</view>
				<view class="top" v-else>
					<view class="line1">月度会员</view>
					<view class="line2">
						<text class="text1">开通会员享受</text>
						<text class="text2">更好的服务</text>
					</view>
				</view>
				<view class="bottom">
					<view class="line1">
						<text class="text1">开通会员即享会员专属视频免费看</text>
						<!-- <text class="text2">Ai智能助手</text> -->
					</view>
					<view class="line2"></view>
				</view>
				<image class="vip_image" src="/static/icons/vip.png" mode="widthFix"></image>
			</view>
			<view class="pay_box box_bg">
				<view class="title_box">
					<image class="image1" src="/static/images/arrow.png" mode="widthFix"></image>
					<text class="text">开通会员选择</text>
					<image class="image2" src="/static/images/arrow.png" mode="widthFix"></image>
				</view>
				<view class="card_box">
					<view class="item" v-for="(item, index) in vipList" :key="item.id" @click="openVip(item.id, item.price)">
						<view class="price">
							<view class="oprice">￥{{ item.original_price }}</view>
							<view class="cprice">
								<text class="text1">￥</text>
								<text class="text2">{{ item.price }}</text>
								<text class="text3">/{{ item.type_text }}</text>
							</view>
						</view>
						<view class="button">立即开通</view>
					</view>
				</view>
			</view>
			
			<view class="task_box box_bg">
				<view class="title_box">
					<image class="image1" src="/static/images/arrow.png" mode="widthFix"></image>
					<text class="text">{{ textTitle }}</text>
					<image class="image2" src="/static/images/arrow.png" mode="widthFix"></image>
				</view>
				<view class="info_box">
					<u-parse :content="textInfo"></u-parse>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapMutations, mapActions } from "vuex"
	export default {
		data() {
			return {
				vipList: [],
				buttonLoading: true,
				textTitle: "",
				textInfo: "",
			}
		},
		computed: {
			...mapGetters("user", ["token", "userInfo"]),
			...mapGetters("app", ["iosIsPay"]),
		},
		watch: {

		},
		onLoad() {
			this.getVipList()
		},
		methods: {
			...mapActions("user", ["getUserInfo"]),
			// 获取vip类型
			getVipList() {
				this.$request('user.vip').then(res => {
					if(res.code === 1) {
						if(res.data.list && res.data.list.length) {
							this.vipList = res.data.list
						}
						this.textTitle = res.data?.vip_desc?.title || ""
						this.textInfo = res.data?.vip_desc?.content || ""
					}
				})
			},
			// 开通vip
			openVip(id, price) {
				// #ifdef MP-WEIXIN
				if(!this.iosIsPay) return this.jumpView('/pages/user/info/contact')
				// #endif

				if(this.buttonLoading) {
					this.buttonLoading = false
					uni.showLoading({
						title: '开通中...',
						mask: true
					})
					
					this.$request('order.create', {
						vip_id: id,
						total_fee: price,
						platform: this.$utils.platforms()
					}).then(res => {
						if(res.code === 1) {
							this.callPay(res.data.order_sn, 'wechat', res.data.platform)
						}
					})
				}
			},
			// 获取支付参数
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
					}
				})
			},
			// 发起 小程序/公众号 支付
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
						this.buttonLoading = true
						this.getUserInfo()
						uni.$emit('updateUserInfo', true)
						uni.hideLoading()
					},
					fail: fail => {
						uni.showToast({
						    title: '支付失败',
							icon: 'none',
							duration: 2000
						});
						this.buttonLoading = true
						uni.hideLoading()
					}
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		background: #262626;
		
		.main_content {
			overflow-y: auto;
			padding: 24rpx 32rpx 60rpx 32rpx;
			position: relative;
			
			.vip_box {
				height: 300rpx;
				border: 2rpx solid transparent;
				border-radius: 40rpx;
				background-clip: padding-box, border-box;
				background-origin: padding-box, border-box;
				background-image: linear-gradient(90deg, #1F2123, #141211), linear-gradient(90deg, #D2D2BB, #393834);
			
				padding: 32rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				position: relative;
				
				.top {
					.line1 {
						color:transparent;
						background: linear-gradient(90deg, #F1B873 0%, #F2DBA8 100%);
						-webkit-background-clip: text;
						font-size: 48rpx;
						font-weight: 900;
						// font-style: italic;
					}
					
					.line2 {
						font-size: 24rpx;
						margin-top: 12rpx;
						
						.text1 {
							color: #827F75;
						}
						
						.text2 {
							color: #E4CEAC;
						}
					}
				}
				
				.bottom {
					.line1 {
						font-size: 24rpx;
						color: #E4CEAC;
						display: flex;
						align-items: center;
						justify-content: space-between;
						
						.text1 {}
						.text2 {}
					}
					
					.line2 {
						width: 100%;
						height: 8rpx;
						border-radius: 8rpx;
						background: linear-gradient(90deg, #EDD9AB 0%, #F6C787 100%);
						margin-top: 12rpx;
					}
				}
				
				.vip_image {
					width: 260rpx;
					position: absolute;
					top: -52rpx;
					right: 0;
				}
			}
			
			.title_box {
				margin-bottom: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.image1 {
					width: 56rpx;
					transform: rotate(180deg);
				}
				
				.text {
					font-size: 40rpx;
					color: #EAD0AE;
					text-shadow: 0 2rpx 0 0 #000000;
					font-weight: bold;
					margin: 0 56rpx;
				}
				
				.image2 {
					width: 56rpx;
				}
			}
			
			.info_box {
				color: #FAD9B4;
				font-size: 28rpx;
			}
			
			.box_bg {
				border-radius: 20rpx;
				padding: 40rpx 32rpx 48rpx 32rpx;
				border: 2rpx solid #96948C;
				background: linear-gradient(225deg, #3D3D3B 0%, #2F2D2D 100%);
				box-shadow: 0 0 16rpx 0rpx rgba(#000, 0.2);
			}
			
			.pay_box {
				margin-top: 48rpx;
				
				.card_box {
					display: flex;
					flex-wrap: wrap;
					margin-bottom: -20rpx;
					
					.item {
						width: calc((100% - 60rpx) / 3);
						height: 284rpx;
						background-image: url('~@/static/images/card_1.png');
						background-repeat: no-repeat;
						background-size: 100% 100%;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						align-items: center;
						padding: 40rpx 0 24rpx;
						font-weight: bold;
						margin: 0 30rpx 30rpx 0;
						
						&:nth-child(3n) {
							margin-right: 0;
						}
						
						.price {
							text-align: center;
							margin-top: 10rpx;
							
							.oprice {
								font-size: 24rpx;
								color: #62615D;
								text-decoration: line-through;
								margin-bottom: 4rpx;
							}
							
							.cprice {
								color: #603B25;

								.text1 {
									font-size: 24rpx;
								}
								
								.text2 {
									font-size: 32rpx;
								}
								
								.text3 {
									font-size: 32rpx;
								}
							}
						}

						.button {
							width: 164rpx;
							height: 56rpx;
							line-height: 54rpx;
							text-align: center;
							color: #D2BB9F;
							font-size: 28rpx;
							background-image: url('~@/static/images/button.png');
							background-repeat: no-repeat;
							background-size: 100% 100%;
							font-weight: bold;
						}
					}
				}
			}
			
			.task_box {
				margin-top: 32rpx;
			}
		}
	}
</style>
