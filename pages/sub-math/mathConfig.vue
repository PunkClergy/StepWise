<template>
	<view class="home-page">
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
				// 修改为分包路由地址
				uni.navigateTo({
					url: `/pages/sub-math/kidsMath?maxNum=${num}`
				});
			}
		}
	};
</script>

<style scoped>
	/* 全局盒模型防横向滚动，和首页统一 */
	view,
	text,
	input {
		box-sizing: border-box;
	}

	/* 页面整体：增加状态栏安全顶部内边距 */
	.home-page {
		min-height: 100vh;
		width: 100%;
		background: linear-gradient(180deg, #91d4ff 0%, #c7f0ff 45%, #b8f0a8 100%);
		padding-top: 60rpx;
		padding-left: 30rpx;
		padding-right: 30rpx;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 自定义头部：优化上下内边距，文字完整展示 */
	.custom-header {
		width: 100%;
		background: linear-gradient(90deg, #87CEEB 0%, #98FB98 100%);
		padding: 60rpx 30rpx 40rpx;
		border-radius: 40rpx;
		text-align: center;
		margin-bottom: 60rpx;
		box-shadow: 0 8rpx 25rpx rgba(135, 206, 235, 0.2);
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

	/* 输入卡片：统一首页大圆角、柔和阴影、浅蓝边框幼儿风 */
	.input-wrap {
		width: 100%;
		max-width: 640rpx;
		background: #ffffff;
		border-radius: 40rpx;
		padding: 60rpx 40rpx;
		border: 4rpx solid #e1f5fe;
		margin-bottom: 50rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}

	.tip-text {
		font-size: 44rpx;
		color: #3d5a80;
		font-weight: bold;
		text-align: center;
		display: block;
		margin-bottom: 35rpx;
		line-height: 1.2;
	}

	.input-box {
		border: 4rpx solid #bde0fe;
		border-radius: 35rpx;
		padding: 0 30rpx;
		height: 120rpx;
		background: #f9fdff;
		transition: all 0.2s ease;
	}

	/* 输入框聚焦高亮，和首页柔和交互统一 */
	.input-box:focus-within {
		border-color: #87CEEB;
		box-shadow: 0 0 0 6rpx rgba(135, 206, 235, 0.2);
	}

	.num-input {
		height: 100%;
		font-size: 30rpx;
		color: #2a3950;
		text-align: center;
	}

	.range-desc {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		display: block;
		margin-top: 25rpx;
		line-height: 1.2;
	}

	/* 按钮容器：宽度限制和首页按钮一致 */
	.btn-group {
		width: 100%;
		max-width: 640rpx;
	}

	/* 开始按钮：复刻首页大圆角渐变、按压缩放动效、白色文字阴影 */
	.start-btn {
		width: 100%;
		height: 100rpx;
		border-radius: 70rpx;
		background: linear-gradient(90deg, #ff9f80, #ff7a7a);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(255, 122, 122, 0.3);
		margin-bottom: 30rpx;
		transition: all 0.18s ease;
	}

	.start-btn:active {
		transform: scale(0.96);
		opacity: 0.9;
		box-shadow: 0 4rpx 10rpx rgba(255, 122, 122, 0.1);
	}

	.btn-text {
		font-size: 48rpx;
		color: #fff;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		line-height: 1.2;
	}

	/* 清空按钮：同步首页圆角、按压变色交互 */
	.clear-btn {
		width: 100%;
		height: 100rpx;
		border-radius: 50rpx;
		background: #f1f5f9;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.18s ease;
	}

	.clear-btn:active {
		background: #e6eaf0;
		transform: scale(0.96);
	}

	.clear-text {
		font-size: 36rpx;
		color: #64748b;
		line-height: 1.2;
	}
</style>