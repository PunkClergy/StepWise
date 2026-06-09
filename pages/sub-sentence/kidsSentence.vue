<template>
  <view class="sentence-page">
    <!-- 顶部按钮栏 -->
    <view class="top-icon-wrap">
      <view class="icon-btn left-icon" @click="goHome">
        <text>🏠</text>
      </view>
    </view>

    <!-- 短句卡片 -->
    <view class="sentence-card">
      <!-- 英文短句 -->
      <view class="en-sentence">{{ currentEn }}</view>
      <!-- 音标 -->
      <view class="phonetic">/{{ currentPhonetic }}/</view>
      <!-- 中文翻译 -->
      <view class="cn-translate">
        <text class="trans-title">中文释义</text>
        <text class="trans-content">{{ currentCn }}</text>
      </view>
    </view>

    <!-- 切换按钮组 -->
    <view class="btn-group">
      <button class="btn prev-btn" @click="prevSentence" :disabled="curIndex <= 0">上一句</button>
      <button class="btn next-btn" @click="nextSentence" :disabled="curIndex >= sentenceList.length - 1">下一句</button>
    </view>

    <!-- 底部固定 去测试 按钮 -->
	<view class="error-book-bottom" @click="goTest">
		<text>📝 去测试</text>
	</view>
  </view>
</template>

<script>
// 英语日常短句库，可自行扩充
const sentenceList = [
  {
    en: "Good morning.",
    phonetic: "ɡʊd ˈmɔːnɪŋ",
    cn: "早上好。"
  },
  {
    en: "Good afternoon.",
    phonetic: "ɡʊd ˌɑːftərˈnuːn",
    cn: "下午好。"
  },
  {
    en: "Good evening.",
    phonetic: "ɡʊd ˈiːvnɪŋ",
    cn: "晚上好。"
  },
  {
    en: "How are you?",
    phonetic: "haʊ ɑːr juː",
    cn: "你好吗？"
  },
  {
    en: "I'm fine, thank you.",
    phonetic: "aɪm faɪn θæŋk juː",
    cn: "我很好，谢谢你。"
  },
  {
    en: "Nice to meet you.",
    phonetic: "naɪs tu miːt juː",
    cn: "很高兴见到你。"
  },
  {
    en: "See you tomorrow.",
    phonetic: "siː juː təˈmɑːroʊ",
    cn: "明天见。"
  },
  {
    en: "Thank you very much.",
    phonetic: "θæŋk juː ˈveri mʌtʃ",
    cn: "非常感谢你。"
  }
]

export default {
  data() {
    return {
      sentenceList,
      curIndex: 0,
      currentEn: "",
      currentPhonetic: "",
      currentCn: ""
    }
  },
  onShow() {
    this.renderSentence()
  },
  methods: {
    // 渲染当前短句
    renderSentence() {
      const item = this.sentenceList[this.curIndex]
      this.currentEn = item.en
      this.currentPhonetic = item.phonetic
      this.currentCn = item.cn
    },
    // 上一句
    prevSentence() {
      if (this.curIndex > 0) {
        this.curIndex--
        this.renderSentence()
      }
    },
    // 下一句
    nextSentence() {
      if (this.curIndex < this.sentenceList.length - 1) {
        this.curIndex++
        this.renderSentence()
      }
    },
    // 返回首页
    goHome() {
      uni.reLaunch({
        url: "/pages/index/index"
      })
    },
    // 跳转测试页，修改为你的实际页面路径
    goTest() {
      uni.navigateTo({
        url: "/pages/sub-english/test"
      })
    }
  }
}
</script>

<style scoped>
view, text {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* 页面整体 护眼渐变背景 + 状态栏适配 */
.sentence-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
  padding-top: calc(var(--status-bar-height) + 20rpx);
  /* 底部留白，防止内容被固定按钮遮挡 */
  padding-bottom: 140rpx;
}

/* 顶部按钮容器 */
.top-icon-wrap {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}
.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(86, 160, 113, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}
.icon-btn:active {
  transform: scale(0.95);
}

/* 短句主卡片 */
.sentence-card {
  margin: 0 30rpx 50rpx;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 36rpx;
  box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.1);
  text-align: center;
}

/* 英文短句 */
.en-sentence {
  font-size: 72rpx;
  font-weight: 600;
  color: #2d3742;
  line-height: 1.4;
}

/* 音标 */
.phonetic {
  font-size: 38rpx;
  color: #56a071;
  margin: 25rpx 0 40rpx;
  letter-spacing: 2rpx;
}

/* 中文翻译区域 */
.cn-translate {
  text-align: left;
  padding-top: 30rpx;
  border-top: 1rpx dashed #e0e8e4;
}
.trans-title {
  display: block;
  font-size: 34rpx;
  font-weight: 500;
  color: #3a4742;
  margin-bottom: 16rpx;
}
.trans-content {
  font-size: 32rpx;
  color: #55635d;
  line-height: 1.8;
}

/* 上下句切换按钮组 */
.btn-group {
  display: flex;
  padding: 0 30rpx;
  gap: 25rpx;
  margin-bottom: 30rpx;
}
.btn {
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  font-size: 34rpx;
  border-radius: 24rpx;
  border: none;
  color: #fff;
  transition: all 0.2s;
}
.btn:active {
  transform: scale(0.97);
}
.btn[disabled] {
  opacity: 0.5;
  transform: none !important;
}
.prev-btn {
  background: linear-gradient(135deg, #87b99c, #56a071);
}
.next-btn {
  background: linear-gradient(135deg, #56a071, #488c60);
}

/* 底部固定按钮容器 */
.error-book-bottom {
	position: fixed;
	left: 30rpx;
	right: 30rpx;
	bottom: 30rpx;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	/* 主题护眼绿按钮 */
background: linear-gradient(135deg, #69b385, #4f9466);
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
}

</style>