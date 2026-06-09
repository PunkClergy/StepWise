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
				<view
					class="pop-item"
					:class="{ active: curStage === index }"
					v-for="(item, index) in stageList"
					:key="index"
					@click="changeStage(index)"
				>
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
			<!-- 原拼音错题 替换为 短句错题 -->
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
	sentence: 'sentence_error_questions' // 新增短句错题存储key
};

const ROUTE_STRATEGY = {
	en: '/pages/sub-english/errorBook',
	math: '/pages/sub-math/errorBook',
	char: '/pages/sub-chinese/errorBook',
	sentence: '/pages/sub-sentence/errorBook' // 新增短句错题路由
};

const STAGE_LIST = [
	{ id: 0, name: '幼儿园' },
	{ id: 1, name: '一年级' },
	{ id: 2, name: '二年级' }
];

const STAGE_STORAGE_KEY = 'user_current_stage';

export default {
	data() {
		return {
			safeTop: 0,
			tabIndex: 1,
			stageList: STAGE_LIST,
			curStage: 0,
			showStagePop: false,
			totalError: 0,
			enErrorCount: 0,
			mathErrorCount: 0,
			charErrorCount: 0,
			sentenceErrorCount: 0 // 新增短句错题数量
		};
	},
	onLoad() {
		this.calcSafeTop();
	},
	onShow() {
		const stage = uni.getStorageSync(STAGE_STORAGE_KEY);
		if (stage !== '' && stage != null) {
			this.curStage = Number(stage);
		}
		this.initUserData();
	},
	methods: {
		calcSafeTop() {
			const systemInfo = uni.getSystemInfoSync();

			// App 端（无胶囊）
			if (systemInfo.platform === 'android' || systemInfo.platform === 'ios') {
				this.safeTop = systemInfo.statusBarHeight + 44;
				return;
			}

			// 小程序端（有胶囊）
			const menuButton = uni.getMenuButtonBoundingClientRect();
			this.safeTop =
				systemInfo.statusBarHeight +
				menuButton.height +
				12;
		},

		initUserData() {
			this.enErrorCount = (uni.getStorageSync(STORAGE_KEYS.en) || []).length;
			this.mathErrorCount = (uni.getStorageSync(STORAGE_KEYS.math) || []).length;
			this.charErrorCount = (uni.getStorageSync(STORAGE_KEYS.char) || []).length;
			this.sentenceErrorCount = (uni.getStorageSync(STORAGE_KEYS.sentence) || []).length;

			// 重新计算总错题数
			this.totalError =
				this.enErrorCount +
				this.mathErrorCount +
				this.charErrorCount +
				this.sentenceErrorCount;
		},

		changeStage(index) {
			this.curStage = index;
			this.showStagePop = false;
			uni.setStorageSync(STAGE_STORAGE_KEY, index);
			this.initUserData();
		},

		goErrorBook(type) {
			const url = ROUTE_STRATEGY[type];
			uni.navigateTo({
				url: `${url}?type=${type}&stage=${this.curStage}`
			});
		},

		goSetting() {
			uni.showToast({ title: '功能开发中', icon: 'none' });
		},

		goAbout() {
			uni.showToast({ title: '功能开发中', icon: 'none' });
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
	/* 全局低饱和护眼绿渐变背景 */
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
	/* 护眼绿色柔和阴影 */
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

.stage-wrap {
	background: #f0f7f3;
	padding: 0rpx 50rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
}

.stage-text {
	font-size: 30rpx;
	color: #56a071;
}

.stage-arrow {
	font-size: 24rpx;
	color: #56a071;
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
	color: #56a071;
}

.label {
	font-size: 28rpx;
	color: #607069;
}

/* 阶段选择弹窗 */
.stage-pop {
	position: fixed;
	inset: 0;
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
	color: #333;
}

.pop-item.active {
	background: #f0f7f3;
	color: #56a071;
	font-weight: bold;
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