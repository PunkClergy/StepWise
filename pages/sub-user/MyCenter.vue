<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">

		<!-- 头像+昵称区域 -->
		<view class="user-card">
			<view class="avatar">👧</view>
			<view class="user-info">
				<text class="username">小学学习者</text>
				<text class="desc">快乐学习，每天进步一点点✨</text>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stat-card">
			<!-- 跳动发光的星星 -->
			<view class="star-wrap">
				<text class="star-icon">⭐</text>
				<text class="star-x">x</text>
				<text class="star-text">{{ starNum }}</text>
			</view>
			<view class="stat-item">
				<text class="num">{{ totalError }}</text>
				<text class="label">总错题</text>
			</view>
		</view>

		<!-- 错题分类入口 -->
		<view class="func-list">
			<view class="func-item" @click="goErrorBook('en')">
				<view class="func-icon">📕</view>
				<text class="func-name">英语错题</text>
				<text class="count-tag">{{ enErrorCount }} 道</text>
				<view class="arrow">➡️</view>
			</view>
			<view class="func-item" @click="goErrorBook('math')">
				<view class="func-icon">📘</view>
				<text class="func-name">数学错题</text>
				<text class="count-tag">{{ mathErrorCount }} 道</text>
				<view class="arrow">➡️</view>
			</view>
			<view class="func-item" @click="goErrorBook('char')">
				<view class="func-icon">📗</view>
				<text class="func-name">汉字错题</text>
				<text class="count-tag">{{ charErrorCount }} 道</text>
				<view class="arrow">➡️</view>
			</view>
			<view class="func-item" @click="goErrorBook('sentence')">
				<view class="func-icon">📙</view>
				<text class="func-name">短句错题</text>
				<text class="count-tag">{{ sentenceErrorCount }} 道</text>
				<view class="arrow">➡️</view>
			</view>
		</view>

		<!-- 其他功能 -->
		<view class="func-list" style="margin-top: 20rpx;">
			<view class="func-item" @click="goSetting">
				<view class="func-icon">⚙️</view>
				<text class="func-name">设置</text>
				<view class="arrow">➡️</view>
			</view>
			<view class="func-item" @click="goAbout">
				<view class="func-icon">💡</view>
				<text class="func-name">关于我们</text>
				<view class="arrow">➡️</view>
			</view>
		</view>

		<!-- 底部 TabBar -->
		<view class="custom-tabbar">
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
	const STORAGE_KEYS = {
		en: 'en_test_error_word',
		math: 'math_error_questions',
		char: 'char_error_questions',
		sentence: 'sentence_error_questions'
	};

	const ROUTE_STRATEGY = {
		en: '/pages/sub-english/errorBook',
		math: '/pages/sub-math/errorBook',
		char: '/pages/sub-chinese/errorBook',
		sentence: '/pages/sub-sentence/errorBook'
	};

	// 星星本地存储key
	const STAR_STORAGE_KEY = 'user_star_num';

	export default {
		data() {
			return {
				safeTop: 0,
				tabIndex: 1,
				totalError: 0,
				enErrorCount: 0,
				mathErrorCount: 0,
				charErrorCount: 0,
				sentenceErrorCount: 0,
				starNum: 0 // 星星数量
			};
		},
		onLoad() {
			this.calcSafeTop();
		},
		onShow() {
			// 读取星星数量
			const star = uni.getStorageSync(STAR_STORAGE_KEY);
			this.starNum = Number(star) || 0;
			this.initUserData();
		},
		methods: {
			calcSafeTop() {
				const systemInfo = uni.getSystemInfoSync();
				if (systemInfo.platform === 'android' || systemInfo.platform === 'ios') {
					this.safeTop = systemInfo.statusBarHeight + 44;
					return;
				}
				const menuButton = uni.getMenuButtonBoundingClientRect();
				this.safeTop = systemInfo.statusBarHeight + menuButton.height + 12;
			},

			initUserData() {
				this.enErrorCount = (uni.getStorageSync(STORAGE_KEYS.en) || []).length;
				this.mathErrorCount = (uni.getStorageSync(STORAGE_KEYS.math) || []).length;
				this.charErrorCount = (uni.getStorageSync(STORAGE_KEYS.char) || []).length;
				this.sentenceErrorCount = (uni.getStorageSync(STORAGE_KEYS.sentence) || []).length;
				this.totalError = this.enErrorCount + this.mathErrorCount + this.charErrorCount + this.sentenceErrorCount;
			},

			goErrorBook(type) {
				const url = ROUTE_STRATEGY[type];
				uni.navigateTo({
					url: `${url}?type=${type}`
				});
			},

			goSetting() {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				});
			},

			goAbout() {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				});
			},

			switchTab(index) {
				this.tabIndex = index;
				if (index === 0) {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			}
		}
	};
</script>

<style scoped>
	page {
		navigation-bar-hidden: true;
	}

	.page {
		min-height: 100vh;
		background: linear-gradient(to bottom, #f5f9f4, #edf4f2);
		padding-bottom: 130rpx;
		box-sizing: border-box;
	}

	/* 用户卡片 */
	.user-card {
		margin: 20rpx 30rpx;
		background: #fff;
		border-radius: 30rpx;
		padding: 35rpx;
		box-shadow: 0 6rpx 18rpx rgba(86, 160, 113, 0.12);
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: #f0f7f3;
		font-size: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}

	.user-info {
		flex: 1;
	}

	.username {
		font-size: 38rpx;
		font-weight: bold;
		color: #3a6b54;
		display: block;
		margin-bottom: 10rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #607069;
	}

	/* 统计卡片 */
	.stat-card {
		margin: 0 30rpx 20rpx;
		background: #fff;
		border-radius: 30rpx;
		padding: 30rpx 20rpx;
		display: flex;
		justify-content: space-around;
		box-shadow: 0 6rpx 18rpx rgba(86, 160, 113, 0.12);
	}

	/* 跳动星星容器：强制垂直居中 */
	.star-wrap {
		background: #f0f7f3;
		padding: 0rpx 50rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.star-x {
		color: #999;
	}

	.star-icon {
		font-size: 50rpx;
		color: #ffca3e;
		/* 合并动画，以自身中心点变换，不偏移 */
		animation: starAni 1s infinite alternate ease-in-out;
		/* 变换中心点设为中心，防止缩放错位 */
		transform-origin: center center;
	}

	.star-text {
		font-size: 40rpx;
		color: #56a071;
		font-weight: bold;
		line-height: 1;
		margin-top: 10rpx;
	}

	/* 合并跳动+闪烁缩放动画，基于中心点变化，不偏移 */
	@keyframes starAni {
		0% {
			transform: translateY(0) scale(1);
			opacity: 0.8;
		}

		100% {
			transform: translateY(-6rpx) scale(1.1);
			opacity: 1;
		}
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.num {
		font-size: 44rpx;
		font-weight: bold;
		color: #56a071;
	}

	.label {
		font-size: 28rpx;
		color: #607069;
	}

	/* 功能列表 */
	.func-list {
		margin: 0 30rpx;
		background: #fff;
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 0 6rpx 18rpx rgba(86, 160, 113, 0.12);
	}

	.func-item {
		height: 100rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.func-item:active {
		background: #f0f7f3;
	}

	.func-icon {
		font-size: 40rpx;
		margin-right: 25rpx;
		width: 50rpx;
		text-align: center;
	}

	.func-name {
		flex: 1;
		font-size: 32rpx;
		color: #333;
	}

	.count-tag {
		font-size: 28rpx;
		color: #56a071;
		margin-right: 20rpx;
	}

	.arrow {
		font-size: 30rpx;
		color: #ccc;
	}

	/* 底部 TabBar */
	.custom-tabbar {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 110rpx;
		background: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 -6rpx 20rpx rgba(86, 160, 113, 0.08);
		z-index: 999;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 22rpx;
	}

	.tab-icon {
		font-size: 44rpx;
	}

	.tab-item.active {
		color: #56a071;
	}
</style>