<template>
	<view class="index-page">
		<!-- 顶部自定义头部（已移除个人中心） -->
		<view class="custom-header">
			<view class="header-left">
				<text class="header-title">幼儿快乐学堂</text>
				<text class="header-sub">小朋友，快来开始快乐学习吧～</text>
			</view>
		</view>

		<!-- 科目卡片区域 -->
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

		<!-- 底部 TabBar -->
		<view class="bottom-tabbar">
			<view
				class="tab-item"
				:class="{ active: tabIndex === 0 }"
				@click="switchTab(0)"
			>
				<text class="tab-icon">🏠</text>
				<text class="tab-text">首页</text>
			</view>
			<view
				class="tab-item"
				:class="{ active: tabIndex === 1 }"
				@click="switchTab(1)"
			>
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
		goPinyin() {
			uni.setStorageSync('currentSubject', 'pinyin');
			uni.showToast({
				title: '拼音功能开发中',
				icon: 'none'
			});
		},
		goChinese() {
			uni.setStorageSync('currentSubject', 'chinese');
			uni.showToast({
				title: '汉字功能开发中',
				icon: 'none'
			});
		},
		goEnglish() {
			uni.setStorageSync('currentSubject', 'english');
			uni.navigateTo({
				url: '/pages/sub-english/kidsEnglish'
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
	background: linear-gradient(180deg, #fef2f6 0%, #e8f8ff 100%);
	padding: 70rpx 30rpx 140rpx; /* 给 TabBar 留空间 */
	display: flex;
	flex-direction: column;
}

/* 顶部头部 */
.custom-header {
	margin-bottom: 60rpx;
}

.header-title {
	font-size: 48rpx;
	font-weight: bold;
	color: #ff6a8e;
}

.header-sub {
	font-size: 28rpx;
	color: #999;
	margin-top: 12rpx;
	display: block;
}

/* 科目卡片 */
.subject-wrap {
	display: flex;
	flex-wrap: wrap;
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
}

.subject-item:active {
	transform: scale(0.96);
}

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

.item-icon.math { background: #fff3cd; }
.item-icon.pinyin { background: #e1f5fe; }
.item-icon.chinese { background: #fce4ec; }
.item-icon.english { background: #e8f5e9; }

.item-name {
	font-size: 34rpx;
	font-weight: 500;
	color: #333;
}

/* 底部 TabBar */
.bottom-tabbar {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 110rpx;
	background: #fff;
	display: flex;
	justify-content: space-around;
	align-items: center;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
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
	color: #ff6a8e;
}
</style>