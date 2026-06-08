<template>
	<view class="index-page">
		<!-- 顶部自定义头部 -->
		<view class="custom-header">
			<view class="header-left">
				<text class="header-title">幼儿快乐学堂</text>
				<text class="header-sub">小朋友，快来开始快乐学习吧～</text>
			</view>
			<view class="header-right" @click="goMy">
				<text class="my-icon">👤</text>
			</view>
		</view>

		<!-- 科目卡片区域 2*2 网格布局 -->
		<view class="subject-wrap">
			<view class="subject-item" @click="goMath">
				<view class="item-icon math">🐰</view>
				<text class="item-name">趣味口算</text>
			</view>
			<view class="subject-item" @click="goPinyin">
				<view class="item-icon pinyin">🐣</view>
				<text class="item-name">欢乐拼音</text>
			</view>
			<view class="subject-item" @click="goChinese">
				<view class="item-icon chinese">🐇</view>
				<text class="item-name">识字乐园</text>
			</view>
			<view class="subject-item" @click="goEnglish">
				<view class="item-icon english">🔤</view>
				<text class="item-name">英语启蒙</text>
			</view>

		</view>

		<!-- 底部标语 固定在底部 -->
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
					url: `/pages/sub-math/kidsMath?maxNum=${mathMaxNum}`
				})
			}
		},
		methods: {
			goMy() {
				uni.navigateTo({
					url: "/pages/sub-user/login"
				})
			},
			goMath() {
				uni.setStorageSync('currentSubject', 'math');
				uni.navigateTo({
					url: "/pages/sub-math/mathConfig"
				});
			},
			goPinyin() {
				uni.setStorageSync('currentSubject', 'pinyin');
				uni.showToast({
					title: "拼音功能开发中",
					icon: "none"
				});
			},
			goChinese() {
				uni.setStorageSync('currentSubject', 'chinese');
				uni.showToast({
					title: "汉字功能开发中",
					icon: "none"
				});
			},
			goEnglish() {
				uni.setStorageSync('currentSubject', 'english');
				uni.navigateTo({
					url: "/pages/sub-english/kidsEnglish"
				});
			}
		}
	};
</script>

<style scoped>
	view,
	text {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	.index-page {
		min-height: 100vh;
		width: 100%;
		background: linear-gradient(180deg, #fef2f6 0%, #e8f8ff 100%);
		/* 上下内边距只保留左右，底部交给 footer 控制 */
		padding: 70rpx 30rpx 0;
		display: flex;
		flex-direction: column;
	}

	/* 顶部头部 */
	.custom-header {
		width: 100%;
		margin-bottom: 60rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #ff6a8e;
		display: block;
	}

	.header-sub {
		font-size: 28rpx;
		color: #999;
		margin-top: 12rpx;
		display: block;
	}

	.header-right {
		width: 88rpx;
		height: 88rpx;
		background: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(255, 140, 180, 0.15);
	}

	.my-icon {
		font-size: 42rpx;
	}

	/* 中间卡片区域 占满剩余高度 */
	.subject-wrap {
		/* flex: 1; */
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 20rpx;
	}

	.subject-item {
		width: 48.5%;
		height: 260rpx;
		background: #fff;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease;
		margin-bottom: 20rpx;
	}

	.subject-item:active {
		transform: scale(0.96);
	}

	/* 图标区域 */
	.item-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 60rpx;
		margin-bottom: 24rpx;
	}

	.item-icon.math {
		background: #fff3cd;
	}

	.item-icon.pinyin {
		background: #e1f5fe;
	}

	.item-icon.chinese {
		background: #fce4ec;
	}

	.item-icon.english {
		background: #e8f5e9;
	}

	.item-name {
		font-size: 34rpx;
		font-weight: 500;
		color: #333;
	}

	/* 底部固定到底部 */
	.footer-tips {
		position: absolute;
		bottom: 20rpx;
		width: 96%;
		text-align: center;
		margin: auto;
	}

	.tips-text {
		font-size: 30rpx;
		color: #ff6a8e;
		letter-spacing: 2rpx;
	}
</style>