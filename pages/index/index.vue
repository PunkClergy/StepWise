<template>
	<view class="index-page">
		<!-- 顶部自定义头部 -->
		<view class="custom-header">
			<text class="header-title">幼儿快乐学堂</text>
			<text class="header-sub">选一个科目开始学习吧</text>
		</view>

		<!-- 单独居中的学科容器 -->
		<view class="center-box">
			<view class="subject-wrap">
				<!-- 口算 -->
				<view class="subject-btn yellow" @click="goMath">
					<view class="btn-icon">
						<text class="icon-emoji">🐰</text>
					</view>
					<text class="btn-name">口算</text>
				</view>

				<!-- 拼音 -->
				<view class="subject-btn blue" @click="goPinyin">
					<view class="btn-icon">
						<text class="icon-emoji">🐣</text>
					</view>
					<text class="btn-name">拼音</text>
				</view>

				<!-- 汉字 -->
				<view class="subject-btn pink" @click="goChinese">
					<view class="btn-icon">
						<text class="icon-emoji">🐇</text>
					</view>
					<text class="btn-name">汉字</text>
				</view>

				<!-- 英语 -->
				<view class="subject-btn green" @click="goEnglish">
					<view class="btn-icon">
						<text class="icon-emoji">🔤</text>
					</view>
					<text class="btn-name">英语</text>
				</view>
			</view>
		</view>

		<!-- 底部装饰文案 固定页面底部 -->
		<view class="footer-tips">
			<text class="tips-text">每天十分钟 · 轻松涨知识 ✨</text>
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
					title: "拼音功能开发中"
				});
			},
			// 汉字
			goChinese() {
				uni.setStorageSync('currentSubject', 'chinese');
				uni.showToast({
					title: "汉字功能开发中"
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
	}

	/* 页面全局背景 */
	.index-page {
		min-height: 100vh;
		width: 100%;
		background: linear-gradient(180deg, #91d4ff 0%, #c7f0ff 45%, #b8f0a8 100%);
		padding: 60rpx 30rpx 40rpx;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 自定义头部 */
	.custom-header {
		text-align: center;
		margin-bottom: 40rpx;
		width: 100%;
	}

	.header-title {
		font-size: 52rpx;
		font-weight: bold;
		color: #fff;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
		display: block;
	}

	.header-sub {
		font-size: 30rpx;
		color: #ffffff;
		margin-top: 10rpx;
		display: block;
		opacity: 0.9;
	}

	/* 核心：学科区域容器，垂直空间占满，内容靠上偏移实现居中偏上 */
	.center-box {
		flex: 1;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		/* 向下内边距 = 向上偏移距离，数值越大整体越靠上 */
		padding-top: 120rpx;
	}

	/* 科目按钮容器 */
	.subject-wrap {
		width: 100%;
		max-width: 640rpx;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 52rpx;
		padding: 0 10rpx;
	}

	/* 通用按钮样式 */
	.subject-btn {
		width: 100%;
		height: 140rpx;
		border-radius: 70rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.12);
		transition: all 0.18s ease;
	}

	.subject-btn:active {
		transform: scale(0.96);
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	/* 四种科目配色 */
	.subject-btn.yellow {
		background: linear-gradient(90deg, #ffdd60, #ffc845);
	}

	.subject-btn.blue {
		background: linear-gradient(90deg, #74ccff, #59bfff);
	}

	.subject-btn.pink {
		background: linear-gradient(90deg, #ffabb8, #ff8e9e);
	}

	.subject-btn.green {
		background: linear-gradient(90deg, #9be87a, #7ed957);
	}

	/* 按钮左侧卡通图标 */
	.btn-icon {
		width: 90rpx;
		height: 90rpx;
		background: rgba(255, 255, 255, 0.35);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 28rpx;
	}

	.icon-emoji {
		font-size: 48rpx;
	}

	/* 按钮文字 */
	.btn-name {
		font-size: 56rpx;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.1);
	}

	/* 底部装饰文字 */
	.footer-tips {
		margin-top: 60rpx;
	}

	.tips-text {
		font-size: 32rpx;
		color: #fff;
		letter-spacing: 2rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}
</style>