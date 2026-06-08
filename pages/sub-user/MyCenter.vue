<template>
	<view class="page">
		<!-- 自定义顶部导航（兼容状态栏） -->
		<view class="custom-header">
			<view class="header-content">
				<view class="icon-btn" @click="goBack">🔙</view>
				<text class="header-title">个人中心</text>
			</view>
		</view>

		<!-- 头部占位，防止内容被导航遮挡 -->
		<view class="header-placeholder"></view>

		<!-- 头像+昵称区域 -->
		<view class="user-card">
			<view class="avatar">👧</view>
			<view class="user-info">
				<text class="username">小学学习者</text>
				<text class="desc">快乐学习，每天进步一点点✨</text>
			</view>
		</view>

		<!-- 数据统计卡片：阶段 + 总错题 横向排列 -->
		<view class="stat-card">
			<view class="stage-wrap" @click="showStagePop = true">
				<text class="stage-text">{{ stageList[curStage].name }}</text>
				<text class="stage-arrow">▼</text>
			</view>
			<view class="stat-item">
				<text class="num">{{ totalError }}</text>
				<text class="label">总错题</text>
			</view>
		</view>

		<!-- 阶段选择弹窗 -->
		<view class="stage-pop" v-if="showStagePop" @click="showStagePop = false">
			<view class="pop-content" @click.stop>
				<view class="pop-item" :class="{active: curStage === index}" v-for="(item, index) in stageList"
					:key="index" @click="changeStage(index)">
					{{ item.name }}
				</view>
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
			<view class="func-item" @click="goErrorBook('pinyin')">
				<view class="func-icon">📙</view>
				<text class="func-name">拼音错题</text>
				<text class="count-tag">{{ pinyinErrorCount }} 道</text>
				<view class="arrow">➡️</view>
			</view>
		</view>

		<!-- 其他功能列表 -->
		<view class="func-list" style="margin-top:20rpx;">
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

		<!-- 底部标语 -->
		<view class="footer">
			<text class="footer-text">趣味学习 · 快乐成长</text>
		</view>
	</view>
</template>

<script>
	// 各科目错题存储 key（按阶段区分）
	const STORAGE_KEYS = {
		en: 'en_test_error_word',
		math: 'math_error_questions',
		char: 'char_error_questions',
		pinyin: 'pinyin_error_questions'
	}

	// 策略模式：科目 -> 对应错题本路由
	const ROUTE_STRATEGY = {
		en: '/pages/sub-english/errorBook',
		math: '/pages/sub-math/errorBook',
		char: '/pages/sub-chinese/errorBook',
		pinyin: '/pages/sub-pinyin/errorBook'
	}

	// 阶段列表
	const STAGE_LIST = [{
			id: 0,
			name: '幼儿园'
		},
		{
			id: 1,
			name: '一年级'
		},
		{
			id: 2,
			name: '二年级'
		}
	]
	// 阶段本地存储key
	const STAGE_STORAGE_KEY = 'user_current_stage'

	export default {
		data() {
			return {
				// 阶段相关
				stageList: STAGE_LIST,
				curStage: 0,
				showStagePop: false,

				totalError: 0,
				// 各科错题数量
				enErrorCount: 0,
				mathErrorCount: 0,
				charErrorCount: 0,
				pinyinErrorCount: 0
			}
		},
		onShow() {
			// 读取当前阶段
			const stage = uni.getStorageSync(STAGE_STORAGE_KEY)
			if (stage !== '' && stage != null) {
				this.curStage = Number(stage)
			}
			this.initUserData();
		},
		methods: {
			// 按阶段拼接真实缓存key（隔离不同阶段数据）
			getRealKey(originKey) {
				return `${originKey}_stage_${this.curStage}`
			},

			initUserData() {
				const enKey = this.getRealKey(STORAGE_KEYS.en)
				const mathKey = this.getRealKey(STORAGE_KEYS.math)
				const charKey = this.getRealKey(STORAGE_KEYS.char)
				const pinyinKey = this.getRealKey(STORAGE_KEYS.pinyin)

				let enList = uni.getStorageSync(enKey) || [];
				let mathList = uni.getStorageSync(mathKey) || [];
				let charList = uni.getStorageSync(charKey) || [];
				let pinyinList = uni.getStorageSync(pinyinKey) || [];

				this.enErrorCount = enList.length;
				this.mathErrorCount = mathList.length;
				this.charErrorCount = charList.length;
				this.pinyinErrorCount = pinyinList.length;

				// 计算当前阶段总错题数
				this.totalError = this.enErrorCount + this.mathErrorCount + this.charErrorCount + this.pinyinErrorCount;
			},

			// 切换阶段
			changeStage(index) {
				this.curStage = index
				this.showStagePop = false
				// 持久化阶段
				uni.setStorageSync(STAGE_STORAGE_KEY, index)
				// 重新加载当前阶段错题数据
				this.initUserData()
			},

			goBack() {
				uni.navigateBack();
			},
			// 策略模式分发路由跳转，携带阶段参数
			goErrorBook(type) {
				const targetUrl = ROUTE_STRATEGY[type] || '/pages/sub-english/errorBook';
				uni.navigateTo({
					url: `${targetUrl}?type=${type}&stage=${this.curStage}`
				})
			},
			goSetting() {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				})
			},
			goAbout() {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style scoped>
	page {
		navigation-bar-hidden: true;
	}

	.page {
		min-height: 100vh;
		box-sizing: border-box;
		background: linear-gradient(to right, #ffd6e0, #f8e8f0);
	}

	/* 自定义头部 */
	.custom-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		padding-top: var(--status-bar-height);
		z-index: 999;
	}

	.header-content {
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
	}

	.header-placeholder {
		height: calc(var(--status-bar-height) + 96rpx);
	}

	.icon-btn {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 3rpx 9rpx rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 38rpx;
	}

	.icon-btn:active {
		transform: scale(0.95);
	}

	.header-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #ff6a8e;
	}

	/* 用户卡片 */
	.user-card {
		margin: 20rpx 30rpx;
		background: #ffffff;
		border-radius: 30rpx;
		padding: 35rpx;
		box-shadow: 0 6rpx 18rpx rgba(255, 140, 180, 0.12);
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: #ffeef3;
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
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #999;
	}

	/* 统计卡片：横向布局 */
	.stat-card {
		margin: 0 30rpx 20rpx;
		background: #fff;
		border-radius: 30rpx;
		padding: 30rpx 20rpx;
		box-shadow: 0 6rpx 18rpx rgba(255, 140, 180, 0.12);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
	}

	/* 阶段选择 */
	.stage-wrap {
		display: flex;
		align-items: center;
		padding: 8rpx 20rpx;
		background: #fef2f6;
		border-radius: 40rpx;
	}

	.stage-text {
		font-size: 30rpx;
		color: #ff6a8e;
	}

	.stage-arrow {
		font-size: 24rpx;
		color: #ff6a8e;
		margin-left: 8rpx;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.num {
		font-size: 44rpx;
		font-weight: bold;
		color: #ff6a8e;
		margin-bottom: 8rpx;
	}

	.label {
		font-size: 28rpx;
		color: #666;
	}

	/* 阶段弹窗 */
	.stage-pop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pop-content {
		width: 500rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.pop-item {
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		font-size: 32rpx;
		border-bottom: 1rpx solid #eee;
	}

	.pop-item:last-child {
		border-bottom: none;
	}

	.pop-item.active {
		background: #fef2f6;
		color: #ff6a8e;
		font-weight: bold;
	}

	/* 功能列表 */
	.func-list {
		margin: 0 30rpx;
		background: #fff;
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 0 6rpx 18rpx rgba(255, 140, 180, 0.12);
	}

	.func-item {
		height: 100rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.func-item:last-child {
		border-bottom: none;
	}

	.func-item:active {
		background: #fef2f6;
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
		color: #ff6a8e;
		margin-right: 20rpx;
	}

	.arrow {
		font-size: 30rpx;
		color: #ccc;
	}

	/* 底部标语 */
	.footer {
		margin-top: 80rpx;
		text-align: center;
	}

	.footer-text {
		font-size: 28rpx;
		color: #bbb;
	}
</style>