<template>
	<view class="page_content">
		<view class="head_content">
			<CustomNavbar title="积分充值"></CustomNavbar>
		</view>
		<view class="main_content">
			<view class="box1">
				<view class="box_title">充值后积分余额永不过期</view>
				<view class="box_content">
					<view class="list_box">
						<view class="item" :class="{ active: item.id == integralActiveId, badge: item.flag }" :data-flag="item.flag" v-for="(item, index) in integralData" :key="item.id" @click="integralItem(item.id, item.price)">
							<view class="line1">{{ item.usable }}积分</view>
							<view class="line2">
								<text class="text1">￥</text>
								<text class="text2">{{ item.price }}</text>
							</view>
							<view class="line3">
								<text class="text">￥{{ item.original_price }}</text>
							</view>
							<view class="line4">
								<view class="">虚拟产品</view>
								<view class="">一经充值不可退款</view>
							</view>
						</view>
					</view>
					<view class="button_box">
						<u-button :loading="!buttonLoading" text="立即充值" :customStyle="buttonStyle" @click="createOrder"/>
					</view>
				</view>
			</view>
			<view class="box3">
				<view class="box_title">注意事项</view>
				<view class="box_content">
					<view class="text_info">
						<u-parse :content="textInfo"></u-parse>
					</view>
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
				buttonStyle: {
					width: '100%',
					height: '100rpx',
					border: 'none',
					fontSize: '24rpx',
					color: '#fff',
					background: 'linear-gradient(90deg, #F28B45 0%, #FEB787 100%)',
					borderRadius: '16rpx',
					margin: '0',
					fontWeight: 'bold'
				},
				buttonLoading: true,
				integralData: [],
				integralActiveId: 0,
				integralActivePrice: 0,
				textInfo: "",
			}
		},
		computed: {
			...mapGetters("user", ["token"]),
			...mapGetters("app", ["iosIsPay"]),
		},
		watch: {
			
		},
		onLoad() {
			this.getIntegralList()
		},
		methods: {
			...mapActions("user", ["getUserInfo"]),
			// 选择套餐
			integralItem(id, price) {
				this.integralActiveId = id
				this.integralActivePrice = price
			},
			// 获取积分套餐列表
			getIntegralList() {
				this.$request('integral.list').then(res => {
					if(res.code === 1) {
						if(res.data.list && res.data.list.length) {
							this.integralData = res.data.list
							this.integralActiveId = res.data.list[0].id
							this.integralActivePrice = res.data.list[0].price
						}
						res.data.usable_desc && (this.textInfo = res.data.usable_desc.content)
					}
				})
			},
			// 创建订单
			createOrder() {
				if(!this.integralActiveId || !this.integralActivePrice) return this.$u.toast('请选择积分套餐')
				this.recharge(this.integralActiveId, this.integralActivePrice)
			},
			// 充值
			recharge(id, price) {
				// #ifdef MP-WEIXIN
				if(!this.iosIsPay) return this.jumpView('/pages/user/info/contact')
				// #endif
			
				if(this.buttonLoading) {
					this.buttonLoading = false
					uni.showLoading({
						title: '开通中...',
						mask: true
					})
					
					this.$request('integral.create', {
						usable_id: id,
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
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page_content {
		.main_content {
			padding: 24rpx 20rpx 60rpx 20rpx;
			overflow-y: auto;
			
			.box_title {
				font-size: 30rpx;
				color: #000;
				font-weight: 700;
			}
			
			.box1 {
				margin-bottom: 36rpx;
				
				.box_content {
					.list_box {
						display: flex;
						flex-wrap: wrap;
						justify-content: space-between;
						margin: 40rpx 0 16rpx 0;
						
						.item {
							width: 224rpx;
							margin-bottom: 20rpx;
							border-radius: 10rpx;
							border: 2rpx solid transparent;
							box-shadow: 0 0 12rpx rgba(153, 153, 153, 0.16);
							text-align: center;
							padding: 60rpx 0 20rpx 0;
							
							&.active {
								background-clip: padding-box, border-box;
								background-origin: padding-box, border-box;
								background-image: linear-gradient(to right, #FFE0CC, #FFE0CC), linear-gradient(90deg, #FEB787 0%, #F18A43 100%);
							
								.line2 {
									color: #FEB787;
									@supports (-webkit-background-clip: text) or (background-clip: text) {
										background: linear-gradient(to right, #FEB787 20%, #F18A43 100% 100%);
										-webkit-background-clip: text;
										background-clip: text;
										color: transparent;
									}
								}
								
								.line3 {
									color: #FEB787;
								}
							}
							
							&.badge {
								position: relative;
								
								&::before {
									// content: '限时优惠';
									content: attr(data-flag);
									position: absolute;
									top: 0;
									right: -2rpx;
									transform: translate(0, -50%);
									background: linear-gradient(90deg, #F28B45 0%, #FEB787 100%);
									font-size: 24rpx;
									color: #fff;
									padding: 4rpx 10rpx;
									border-radius: 8rpx;
								}
							}
							
							.line1 {
								font-size: 32rpx;
							}
							
							.line2 {
								margin: 20rpx 0;
								
								.text1 {
									font-size: 24rpx;
								}
								
								.text2 {
									font-size: 52rpx;
								}
							}
							
							.line3 {
								font-size: 24rpx;
								text-decoration: line-through;
								margin-bottom: 8rpx;
							}
							
							.line4 {
								font-size: 24rpx;
								color: rgba(153, 153, 153, 1);
							}
						}
					}
				}
			}
			
			.box3 {
				.box_content {
					margin-top: 24rpx;
					
					.text_info {
						border: 2rpx solid rgba(238, 238, 238, 1);
						font-size: 24rpx;
						color: #7F7F7F;
						padding: 24rpx 32rpx;
						border-radius: 20rpx;
						line-height: 36rpx;
					}
				}
			}
		}
	}
</style>
