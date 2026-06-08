<template>
  <view class="login-page">
    <!-- 登录主体区域（居中） -->
    <view class="login-wrap">
      <!-- 登录卡片 -->
      <view class="login-card">
        <view class="logo-box">
          <text class="logo-icon">📚</text>
          <text class="logo-title">趣味学习平台</text>
        </view>

        <!-- 登录方式选项卡 -->
        <view class="tab-wrap">
          <view 
            class="tab-item" 
            :class="{active: loginType === 'account'}"
            @click="loginType = 'account'"
          >
            账号登录
          </view>
          <view 
            class="tab-item" 
            :class="{active: loginType === 'wechat'}"
            @click="loginType = 'wechat'"
          >
            微信登录
          </view>
        </view>

        <!-- 账号登录表单 -->
        <view class="account-form" v-if="loginType === 'account'">
          <view class="input-item">
            <text class="input-icon">👤</text>
            <input class="input-box" v-model="username" placeholder="请输入账号" />
          </view>
          <view class="input-item">
            <text class="input-icon">🔒</text>
            <input class="input-box" v-model="password" placeholder="请输入密码" password />
          </view>
          <button class="login-btn" @click="handleAccountLogin">登 录</button>
        </view>

        <!-- 微信快捷登录 -->
        <view class="wechat-form" v-if="loginType === 'wechat'">
          <view class="wechat-icon">
            <text>💬</text>
          </view>
          <text class="wechat-desc">微信账号一键登录</text>
          <button class="login-btn wechat-btn" @click="handleWechatLogin">
            微信快捷登录
          </button>
        </view>

        <!-- 底部：用户协议 & 隐私协议 修复checkbox v-model -->
        <view class="agree-wrap">
          <checkbox 
            class="checkbox" 
            :checked="isAgree"
            @change="isAgree = $event.detail.value"
          ></checkbox>
          <text class="agree-text">
            我已阅读并同意
            <text class="link" @click="openProtocol('user')">《用户协议》</text>
            和
            <text class="link" @click="openProtocol('privacy')">《隐私政策》</text>
          </text>
        </view>
      </view>
    </view>

    <!-- 底部公司信息 -->
    <view class="company-info">
      <text>© 2026 教育科技有限公司 版权所有</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loginType: 'account',
      username: '',
      password: '',
      isAgree: true
    }
  },
  methods: {
    // 账号登录
    handleAccountLogin() {
      if (!this.isAgree) {
        uni.showToast({ title: '请先同意协议', icon: 'none' })
        return
      }
      if (!this.username) {
        uni.showToast({ title: '请输入账号', icon: 'none' })
        return
      }
      if (!this.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      uni.showToast({ title: '登录成功' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1200)
    },

    // 微信登录
    handleWechatLogin() {
      if (!this.isAgree) {
        uni.showToast({ title: '请先同意协议', icon: 'none' })
        return
      }
      uni.showLoading({ title: '授权中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '微信登录成功' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1200)
      }, 1500)
    },

    // 打开协议页面
    openProtocol(type) {
      let url = type === 'user' 
        ? '/pages/protocol/userProtocol' 
        : '/pages/protocol/privacyProtocol'
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(to right, #ffd6e0, #f8e8f0);
  display: flex;
  flex-direction: column;
  padding: 0 40rpx;
}

/* 登录区域整体居中 */
.login-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录主卡片 */
.login-card {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 6rpx 18rpx rgba(255, 140, 180, 0.12);
}

/* logo区域 */
.logo-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}
.logo-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}
.logo-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6a8e;
}

/* 选项卡切换 */
.tab-wrap {
  display: flex;
  background: #fef2f6;
  border-radius: 40rpx;
  padding: 6rpx;
  margin-bottom: 35rpx;
}
.tab-item {
  flex: 1;
  text-align: center;
  line-height: 70rpx;
  font-size: 30rpx;
  border-radius: 35rpx;
  color: #666;
}
.tab-item.active {
  background: #fff;
  color: #ff6a8e;
  font-weight: bold;
  box-shadow: 0 2rpx 6rpx rgba(255, 140, 180, 0.15);
}

/* 账号登录输入项 */
.input-item {
  display: flex;
  align-items: center;
  height: 90rpx;
  background: #fef2f6;
  border-radius: 40rpx;
  padding: 0 30rpx;
  margin-bottom: 25rpx;
}
.input-icon {
  font-size: 36rpx;
  color: #ff6a8e;
  margin-right: 20rpx;
}
.input-box {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

/* 通用登录按钮 */
.login-btn {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: #ff6a8e;
  color: #fff;
  font-size: 32rpx;
  border-radius: 40rpx;
  margin-top: 20rpx;
}
.login-btn::after {
  border: none;
}

/* 微信登录区域 */
.wechat-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}
.wechat-icon {
  width: 140rpx;
  height: 140rpx;
  background: #fef2f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25rpx;
}
.wechat-icon text {
  font-size: 70rpx;
  color: #ff6a8e;
}
.wechat-desc {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 30rpx;
}

/* 协议区域：卡片底部居中 */
.agree-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 45rpx;
}
.checkbox {
  transform: scale(0.8);
  margin-right: 10rpx;
}
.agree-text {
  font-size: 22rpx;
  color: #666;
}
.link {
  color: #ff6a8e;
  text-decoration: underline;
}

/* 底部公司版权信息 */
.company-info {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>