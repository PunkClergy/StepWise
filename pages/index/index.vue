<template>
	<view class="index-page">
		<!-- 顶部自定义头部 -->
		<view class="custom-header">
			<!-- 左侧标题区域 -->
			<view class="header-left">
				<text class="header-title">🌟幼儿快乐学堂🌟</text>
				<text class="header-sub">小朋友，快来开始快乐学习吧～</text>
			</view>
			
			<!-- 右侧我的图标入口 -->
			<view class="header-right" @click="goMy">
				<text class="my-icon">👤</text>
			</view>
		</view>

		<!-- 单独居中的学科容器 -->
		<view class="center-box">
			<view class="subject-wrap">
				<!-- 口算 -->
				<view class="subject-btn yellow" @click="goMath">
					<view class="btn-icon">
						<text class="icon-emoji">🐰</text>
					</view>
					<text class="btn-name">趣味口算</text>
				</view>

				<!-- 拼音 -->
				<view class="subject-btn blue" @click="goPinyin">
					<view class="btn-icon">
						<text class="icon-emoji">🐣</text>
					</view>
					<text class="btn-name">欢乐拼音</text>
				</view>

				<!-- 汉字 -->
				<view class="subject-btn pink" @click="goChinese">
					<view class="btn-icon">
						<text class="icon-emoji">🐇</text>
					</view>
					<text class="btn-name">识字乐园</text>
				</view>

				<!-- 英语 -->
				<view class="subject-btn green" @click="goEnglish">
					<view class="btn-icon">
						<text class="icon-emoji">🔤</text>
					</view>
					<text class="btn-name">英语启蒙</text>
				</view>
			</view>
		</view>

		<!-- 底部装饰文案 固定页面底部 -->
		<view class="footer-tips">
			<text class="tips-text">🎈 每天十分钟 · 快乐学知识 🎈</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {};
		},
		onLoad() {
			const subject = uni.getStorageSync('currentSubject');
			const mathMaxNum = uni.getStorageSync('mathMaxNum');
			if (subject == 'math' && mathMaxNum) {
				uni.redirectTo({
					url: `/pages/kidsMath/kidsMath?maxNum=${mathMaxNum}`
				})
			}
		},
		methods: {
			// 我的页面入口
			goMy() {
				uni.showToast({
					title: "我的中心",
					icon: "none"
				})
				// 如需跳转真实页面，替换下面代码
				// uni.navigateTo({
				// 	url: "/pages/my/my"
				// })
			},
			// 口算：存入缓存后跳转配置页
			goMath() {
				uni.setStorageSync('currentSubject', 'math');
				uni.navigateTo({
					url: "/pages/mathConfig/mathConfig"
				});
			},
			// 拼音
			goPinyin() {
				uni.setStorageSync('currentSubject', 'pinyin');
				uni.showToast({
					title: "拼音功能开发中",
					icon:"none"
				});
			},
			// 汉字
			goChinese() {
				uni.setStorageSync('currentSubject', 'chinese');
				uni.showToast({
					title: "汉字功能开发中",
					icon:"none"
				});
			},
			// 英语
			goEnglish() {
				uni.setStorageSync('currentSubject', 'english');
				uni.navigateTo({
					url: "/pages/kidsEnglish/kidsEnglish"
				});
			}
		}
	};
</script>

<style scoped>
	/* 全局强制盒模型，杜绝元素宽度溢出 */
	view,
	text {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	/* 页面全局背景 - 幼儿园柔和渐变 */
	.index-page {
		min-height: 100vh;
		width: 100%;
		background: linear-gradient(180deg, #a1e0ff 0%, #d4f5ff 50%, #c5f7bb 100%);
		padding: 70rpx 30rpx 50rpx;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 自定义头部 - 左右布局 */
	.custom-header {
		width: 100%;
		margin-bottom: 50rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	/* 左侧标题 */
	.header-left {
		flex: 1;
	}

	.header-title {
		font-size: 54rpx;
		font-weight: 900;
		color: #ffffff;
		text-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.18);
		display: block;
		letter-spacing: 4rpx;
	}

	.header-sub {
		font-size: 32rpx;
		color: #ffffff;
		margin-top: 16rpx;
		display: block;
		opacity: 0.95;
		font-weight: 500;
	}
	
	/* 右侧我的图标 */
	.header-right {
		width: 80rpx;
		height: 80rpx;
		background: rgba(255,255,255,0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid rgba(255,255,255,0.5);
	}
	
	.my-icon {
		font-size: 40rpx;
	}

	/* 核心：学科区域容器 */
	.center-box {
		flex: 1;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 100rpx;
	}

	/* 科目按钮容器 */
	.subject-wrap {
		width: 100%;
		max-width: 680rpx;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 48rpx;
		padding: 0 20rpx;
	}

	/* 通用按钮样式 - 幼儿园大按钮、易点击 */
	.subject-btn {
		width: 100%;
		height: 150rpx;
		border-radius: 75rpx;
		display: flex;
		align-items: center;
		padding: 0 40rpx;
		box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.subject-btn:active {
		transform: scale(0.95);
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	/* 四种科目柔和配色 - 更适合幼儿视觉 */
	.subject-btn.yellow {
		background: linear-gradient(90deg, #ffe670, #ffd159);
	}

	.subject-btn.blue {
		background: linear-gradient(90deg, #89d8ff, #6ec8ff);
	}

	.subject-btn.pink {
		background: linear-gradient(90deg, #ffbcc7, #ff9cab);
	}

	.subject-btn.green {
		background: linear-gradient(90deg, #a9f08c, #8ae269);
	}

	/* 按钮左侧卡通图标 */
	.btn-icon {
		width: 100rpx;
		height: 100rpx;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 32rpx;
		border: 4rpx solid rgba(255,255,255,0.5);
	}

	.icon-emoji {
		font-size: 52rpx;
	}

	/* 按钮文字 - 更大更清晰 */
	.btn-name {
		font-size: 58rpx;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
		letter-spacing: 3rpx;
	}

	/* 底部装饰文字 */
	.footer-tips {
		margin-top: 40rpx;
	}

	.tips-text {
		font-size: 34rpx;
		color: #fff;
		letter-spacing: 3rpx;
		text-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.12);
		font-weight: 500;
	}
</style>