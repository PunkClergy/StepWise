<template>
	<view class="index-page">
		<!-- 顶部自定义头部 -->
		<view class="custom-header">
			<view class="header-left">
				<text class="header-title">🌟幼儿快乐学堂🌟</text>
				<text class="header-sub">小朋友，快来开始快乐学习吧～</text>
			</view>
			<view class="header-right" @click="goMy">
				<text class="my-icon">👤</text>
			</view>
		</view>

		<view class="center-box">
			<view class="subject-wrap">
				<view class="subject-btn yellow" @click="goMath">
					<view class="btn-icon">
						<text class="icon-emoji">🐰</text>
					</view>
					<text class="btn-name">趣味口算</text>
				</view>
				<view class="subject-btn blue" @click="goPinyin">
					<view class="btn-icon">
						<text class="icon-emoji">🐣</text>
					</view>
					<text class="btn-name">欢乐拼音</text>
				</view>
				<view class="subject-btn pink" @click="goChinese">
					<view class="btn-icon">
						<text class="icon-emoji">🐇</text>
					</view>
					<text class="btn-name">识字乐园</text>
				</view>
				<view class="subject-btn green" @click="goEnglish">
					<view class="btn-icon">
						<text class="icon-emoji">🔤</text>
					</view>
					<text class="btn-name">英语启蒙</text>
				</view>
			</view>
		</view>

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
			// 修正：数学练习页完整路径
			uni.redirectTo({
				url: `/pages/sub-math/kidsMath?maxNum=${mathMaxNum}`
			})
		}
	},
	methods: {
		goMy() {
			// 个人中心路径
			uni.navigateTo({
				url: "/pages/sub-user/login"
			})
		},
		goMath() {
			uni.setStorageSync('currentSubject', 'math');
			// 口算设置页路径
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
			// 英语启蒙路径
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
	background: linear-gradient(180deg, #a1e0ff 0%, #d4f5ff 50%, #c5f7bb 100%);
	padding: 70rpx 30rpx 50rpx;
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.custom-header {
	width: 100%;
	margin-bottom: 50rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
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
.header-right {
	width: 80rpx;
	height: 80rpx;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid rgba(255, 255, 255, 0.5);
}
.my-icon {
	font-size: 40rpx;
}
.center-box {
	flex: 1;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 100rpx;
}
.subject-wrap {
	width: 100%;
	max-width: 680rpx;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 48rpx;
	padding: 0 20rpx;
}
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
.btn-icon {
	width: 100rpx;
	height: 100rpx;
	background: rgba(255, 255, 255, 0.4);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 32rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.5);
}
.icon-emoji {
	font-size: 52rpx;
}
.btn-name {
	font-size: 58rpx;
	font-weight: bold;
	color: #ffffff;
	text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
	letter-spacing: 3rpx;
}
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