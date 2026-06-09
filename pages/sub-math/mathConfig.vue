<template>
	<view class="home-page">
		<!-- 顶部首页按钮 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
		</view>

		<!-- 内容容器：整体居中 -->
		<view class="content-wrap">
			<!-- 🔔 自定义顶部头部 -->
			<view class="custom-header">
				<text class="header-title">口算小达人</text>
				<text class="header-desc">快乐学习 · 轻松练习</text>
			</view>

			<!-- 数字输入区域 -->
			<view class="input-wrap">
				<text class="tip-text">请输入最大数字</text>
				<view class="input-box">
					<input class="num-input" type="number" v-model="maxNum" placeholder="例：输入10，生成10以内加减法" />
				</view>
				<text class="range-desc">范围：5 ~ 1000 之间的整数</text>
			</view>

			<!-- 操作按钮 -->
			<view class="btn-group">
				<view class="start-btn" @click="startMath">
					<text class="btn-text">开始练习</text>
				</view>
				<view class="clear-btn" @click="clearInput">
					<text class="clear-text">清空输入</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				maxNum: ""
			};
		},
		onLoad() {},
		methods: {
			clearInput() {
				this.maxNum = "";
			},
			startMath() {
				const num = Number(this.maxNum);
				if (!this.maxNum) {
					uni.showModal({
						title: "提示",
						content: "请输入5~1000之间的数字",
						showCancel: false
					});
					return;
				}
				if (num < 5 || num > 1000) {
					uni.showModal({
						title: "数字超出范围",
						content: "仅支持 5 ~ 1000 的数字，请重新输入",
						showCancel: false
					});
					return;
				}
				uni.setStorageSync('mathMaxNum', num);
				uni.navigateTo({
					url: `/pages/sub-math/kidsMath?maxNum=${num}`
				});
			},
			// 返回首页
			goHome() {
				uni.reLaunch({
					url: "/pages/index/index"
				})
			}
		}
	};
</script>

<style scoped>
	view,
	text,
	input {
		box-sizing: border-box;
	}

	/* 页面根容器：全屏 + 弹性布局，整体居中 + 统一护眼渐变背景 */
	.home-page {
		min-height: 100vh;
		width: 100%;
		/* 全局统一护眼浅绿渐变，和识字、英语页面一致 */
		background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(var(--status-bar-height) + 20rpx) 30rpx 30rpx;
		overflow-x: hidden;
	}

	/* 顶部首页按钮区域 */
	.top-icon-wrap {
		position: fixed;
		top: var(--status-bar-height);
		left: 30rpx;
		z-index: 99;
	}
	.icon-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(86, 160, 113, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
	}
	.icon-btn:active {
		transform: scale(0.95);
	}

	/* 内容外层容器：左右最大宽度限制，内部垂直排布 */
	.content-wrap {
		width: 100%;
		max-width: 640rpx;
		display: flex;
		flex-direction: column;
	}

	/* 自定义头部：适配护眼色系 */
	.custom-header {
		width: 100%;
		background: linear-gradient(90deg, #87b99c 0%, #56a071 100%);
		padding: 60rpx 30rpx 40rpx;
		border-radius: 40rpx;
		text-align: center;
		margin-bottom: 60rpx;
		box-shadow: 0 8rpx 25rpx rgba(86, 160, 113, 0.2);
	}

	.header-title {
		font-size: 52rpx;
		font-weight: bold;
		color: #fff;
		text-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.1);
		display: block;
		line-height: 1.2;
	}

	.header-desc {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-top: 10rpx;
		display: block;
		line-height: 1.2;
	}

	/* 输入卡片 */
	.input-wrap {
		width: 100%;
		background: #ffffff;
		border-radius: 40rpx;
		padding: 60rpx 40rpx;
		border: 4rpx solid #e1ede8;
		margin-bottom: 50rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.tip-text {
		font-size: 44rpx;
		color: #3a4742;
		font-weight: bold;
		text-align: center;
		display: block;
		margin-bottom: 35rpx;
		line-height: 1.2;
	}

	.input-box {
		border: 4rpx solid #d8e4dd;
		border-radius: 35rpx;
		padding: 0 30rpx;
		height: 120rpx;
		background: #f8faf9;
		transition: all 0.2s ease;
	}

	.input-box:focus-within {
		border-color: #56a071;
		box-shadow: 0 0 0 6rpx rgba(86, 160, 113, 0.2);
	}

	.num-input {
		height: 100%;
		font-size: 30rpx;
		color: #2d3742;
		text-align: center;
	}

	.range-desc {
		font-size: 28rpx;
		color: #798680;
		text-align: center;
		display: block;
		margin-top: 25rpx;
		line-height: 1.2;
	}

	/* 按钮区域 */
	.btn-group {
		width: 100%;
	}

	.start-btn {
		width: 100%;
		height: 100rpx;
		border-radius: 70rpx;
		background: linear-gradient(90deg, #87b99c, #56a071);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(86, 160, 113, 0.3);
		margin-bottom: 30rpx;
		transition: all 0.18s ease;
	}

	.start-btn:active {
		transform: scale(0.96);
		opacity: 0.9;
		box-shadow: 0 4rpx 10rpx rgba(86, 160, 113, 0.1);
	}

	.btn-text {
		font-size: 48rpx;
		color: #fff;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		line-height: 1.2;
	}

	.clear-btn {
		width: 100%;
		height: 100rpx;
		border-radius: 50rpx;
		background: #f1f5f3;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.18s ease;
	}

	.clear-btn:active {
		background: #e6edea;
		transform: scale(0.96);
	}

	.clear-text {
		font-size: 36rpx;
		color: #55635d;
		line-height: 1.2;
	}
</style>