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
        <text class="username">小学英语学习者</text>
        <text class="desc">快乐学单词，每天进步一点点✨</text>
      </view>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stat-card">
      <view class="stat-item">
        <text class="num">{{ totalTest }}</text>
        <text class="label">累计答题</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ rightCount }}</text>
        <text class="label">答对题目</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ errorCount }}</text>
        <text class="label">错题数量</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="func-list">
      <view class="func-item" @click="goErrorBook">
        <view class="func-icon">📖</view>
        <text class="func-name">我的错题本</text>
        <view class="arrow">➡️</view>
      </view>
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
      <text class="footer-text">趣味英语 · 快乐学习</text>
    </view>
  </view>
</template>

<script>
const ERROR_WORD_KEY = 'en_test_error_word';
export default {
  data() {
    return {
      totalTest: 0,
      rightCount: 0,
      errorCount: 0
    }
  },
  onShow() {
    this.initUserData();
  },
  methods: {
    initUserData() {
      const errorList = uni.getStorageSync(ERROR_WORD_KEY) || [];
      this.errorCount = errorList.length;
      this.totalTest = 68;
      this.rightCount = 52;
    },
    goBack() {
      uni.navigateBack();
    },
    goErrorBook() {
      uni.navigateTo({
        url: '/pages/errorBook/errorBook'
      })
    },
    goSetting() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    goAbout() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    }
  }
}
</script>

<style scoped>
page {
  /* 关闭原生导航栏，使用自定义头部 */
  navigation-bar-hidden: true;
}
.page {
  min-height: 100vh;
  box-sizing: border-box;
   background: linear-gradient(to right, #ffd6e0, #f8e8f0);
}

/* ========== 自定义头部 核心适配状态栏 ========== */
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* 高度 = 状态栏高度 + 导航栏主体高度 */
  padding-top: var(--status-bar-height);
 
  z-index: 999;
}
/* 导航栏内容区：统一高度、居中排版 */
.header-content {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}
/* 占位块：高度和头部一致，避免页面内容被固定导航遮挡 */
.header-placeholder {
  height: calc(var(--status-bar-height) + 96rpx);
}

/* 图标按钮 卡通样式，和答题页统一 */
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

/* 头部标题 */
.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6a8e;
}

/* ========== 用户信息卡片 ========== */
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

/* ========== 数据统计卡片 ========== */
.stat-card {
  margin: 0 30rpx 20rpx;
  background: #fff;
  border-radius: 30rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 6rpx 18rpx rgba(255, 140, 180, 0.12);
  display: flex;
  justify-content: space-around;
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

/* ========== 功能列表 ========== */
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
.arrow {
  font-size: 30rpx;
  color: #ccc;
}

/* ========== 底部标语 ========== */
.footer {
  margin-top: 80rpx;
  text-align: center;
}
.footer-text {
  font-size: 28rpx;
  color: #bbb;
}
</style>