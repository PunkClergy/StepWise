<template>
	<view class="index-page">
		<!-- 顶部自定义头部 适配状态栏 -->
		<view class="custom-header">
			<view class="header-left">
				<text class="header-title">知拾</text>
				<text class="header-sub">小朋友，快来开始快乐学习吧～</text>
			</view>
		</view>

		<!-- 科目卡片区域（单栏通栏布局） -->
		<view class="subject-wrap">
			<view class="subject-item" @click="goMath">
				<view class="item-icon math">🐰</view>
				<text class="item-name">趣味口算</text>
			</view>
			<view class="subject-item" @click="goChinese">
				<view class="item-icon chinese">🐇</view>
				<text class="item-name">识字乐园</text>
			</view>
			<view class="subject-item" @click="goEnglish">
				<view class="item-icon english">🔤</view>
				<text class="item-name">英语启蒙</text>
			</view>
			<!-- 日常短句 -->
			<view class="subject-item" @click="goSentence">
				<view class="item-icon sentence">💬</view>
				<text class="item-name">日常短句</text>
			</view>
		</view>

		<!-- 底部 TabBar -->
		<view class="bottom-tabbar">
			<view class="tab-item" :class="{ active: tabIndex === 0 }" @click="switchTab(0)">
				<text class="tab-icon">🏠</text>
				<text class="tab-text">首页</text>
			</view>
			<view class="tab-item" :class="{ active: tabIndex === 1 }" @click="switchTab(1)">
				<text class="tab-icon">👤</text>
				<text class="tab-text">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabIndex: 0
			};
		},
		onLoad() {
			const subject = uni.getStorageSync('currentSubject');
			const mathMaxNum = uni.getStorageSync('mathMaxNum');
			if (subject === 'math' && mathMaxNum) {
				uni.redirectTo({
					url: `/pages/sub-math/kidsMath?maxNum=${mathMaxNum}`
				});
			}
		},
		methods: {
			switchTab(index) {
				this.tabIndex = index;
				if (index === 1) {
					uni.reLaunch({
						url: '/pages/sub-user/MyCenter'
					});
				}
			},
			goMath() {
				uni.setStorageSync('currentSubject', 'math');
				uni.navigateTo({
					url: '/pages/sub-math/mathConfig'
				});
			},
			goChinese() {
				uni.setStorageSync('currentSubject', 'chinese');
				uni.navigateTo({
					url: '/pages/sub-chinese/kidsChinese'
				});
			},
			goEnglish() {
				uni.setStorageSync('currentSubject', 'english');
				uni.navigateTo({
					url: '/pages/sub-english/kidsEnglish'
				});
			},
			goSentence() {
				uni.setStorageSync('currentSubject', 'sentence');
				uni.navigateTo({
					url: '/pages/sub-sentence/kidsSentence'
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

	/* 页面整体：低饱和浅绿渐变，护眼柔和底色 */
	.index-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
		padding: calc(var(--status-bar-height) + 40rpx) 30rpx 150rpx;
		display: flex;
		flex-direction: column;
	}

	/* 顶部头部 */
	.custom-header {
		margin-bottom: 70rpx;
		padding: 10rpx 0;
	}

	.header-title {
		font-size: 52rpx;
		font-weight: 700;
		color: #56a071;
		letter-spacing: 2rpx;
	}

	.header-sub {
		font-size: 30rpx;
		color: #798680;
		margin-top: 15rpx;
		display: block;
		letter-spacing: 1rpx;
	}

	/* 科目卡片容器 */
	.subject-wrap {
		display: flex;
		flex-direction: column;
		gap: 25rpx;
	}

	/* 卡片通栏拉满宽度 */
	.subject-item {
		width: 100%;
		height: 200rpx;
		background: #ffffff;
		border-radius: 36rpx;
		box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.1);
		display: flex;
		align-items: center;
		padding: 0 40rpx;
		transition: all 0.2s ease;
	}

	/* 点击按压动效 */
	.subject-item:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(86, 160, 113, 0.15);
	}

	/* 图标圆形容器 */
	.item-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 60rpx;
		margin-right: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	/* 各科目图标：低饱和柔和配色 */
	.item-icon.math {
		background: linear-gradient(135deg, #f9f7e8, #f3f0dc);
	}

	.item-icon.chinese {
		background: linear-gradient(135deg, #f8f0f2, #f2e6e9);
	}

	.item-icon.english {
		background: linear-gradient(135deg, #f0f7f3, #e6f0eb);
	}

	.item-icon.sentence {
		background: linear-gradient(135deg, #edf2f8, #e2eaf5);
	}

	.item-name {
		font-size: 38rpx;
		font-weight: 500;
		color: #3a4742;
	}

	/* 底部 TabBar 美化 */
	.bottom-tabbar {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 120rpx;
		background: #ffffff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 -4rpx 15rpx rgba(86, 160, 113, 0.08);
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #88948e;
		font-size: 24rpx;
	}

	.tab-icon {
		font-size: 48rpx;
		margin-bottom: 6rpx;
	}

	.tab-item.active {
		color: #56a071;
	}
</style>