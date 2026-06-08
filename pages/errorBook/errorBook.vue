<template>
  <view class="page">
    <!-- 顶部导航 - 永久固定头部 -->
    <view class="top-wrap">
      <view class="back-btn" @click="goBack">← 返回</view>
      <text class="title">错题本</text>
      <view class="clear-btn" @click="clearErrorList">清空</view>
    </view>

    <!-- 可滚动区域：仅列表部分滚动 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 空状态 -->
      <view class="empty-box" v-if="errorList.length === 0">
        <text class="empty-text">暂无错题，继续加油💪</text>
      </view>

      <!-- 错题列表 -->
      <view class="list-wrap" v-else>
        <view 
          class="item" 
          :class="{active: activeIndex === idx}"
          v-for="(item, idx) in errorList" 
          :key="idx" 
          @click="playAudioSeq(item, idx)"
        >
          <view class="word-info">
            <text class="word">{{ item.word }}</text>
            <text class="mean">释义：{{ item.meaning }}</text>
          </view>
          <image class="img" :src="item.img" mode="aspectFit"></image>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
// 和测试页统一缓存 key
const ERROR_WORD_KEY = 'en_test_error_word';
export default {
  data() {
    return {
      errorList: [],
      audioCtx: null,
      chineseAudio: null,
      activeIndex: -1, // 当前正在朗读的条目下标，-1=无锁定
      isPlaying: false // 全局朗读锁
    };
  },
  onLoad() {
    this.getErrorList();
  },
  onUnload() {
    this.destroyAllAudio();
    this.activeIndex = -1;
    this.isPlaying = false;
  },
  methods: {
    // 获取错题列表
    getErrorList() {
      this.errorList = uni.getStorageSync(ERROR_WORD_KEY) || [];
    },

    // 销毁全部音频 + 解除锁定
    destroyAllAudio() {
      if (this.audioCtx) {
        this.audioCtx.stop();
        this.audioCtx.destroy();
        this.audioCtx = null;
      }
      if (this.chineseAudio) {
        this.chineseAudio.stop();
        this.chineseAudio.destroy();
        this.chineseAudio = null;
      }
      // 朗读结束，释放交互
      this.activeIndex = -1;
      this.isPlaying = false;
    },

    // 顺序播放：先英文，再中文释义
    playAudioSeq(item, idx) {
      // 朗读中直接拦截，防止重复点击
      if (this.isPlaying) return;

      // 锁定当前条目，开启交互样式
      this.isPlaying = true;
      this.activeIndex = idx;
      this.destroyAllAudio();

      // 无英文音频直接读中文
      if (!item.audio) {
        this.playChinese(item.meaning);
        return;
      }

      // 播放英文单词
      this.audioCtx = uni.createInnerAudioContext();
      this.audioCtx.src = item.audio;
      this.audioCtx.play();

      // 英文播放完毕 → 间隔后播放中文
      this.audioCtx.onEnded(() => {
        this.audioCtx.destroy();
        this.audioCtx = null;
        setTimeout(() => {
          this.playChinese(item.meaning);
        }, 300);
      });

      // 英文播放异常，直接走中文并解锁
      this.audioCtx.onError(() => {
        this.audioCtx.destroy();
        this.audioCtx = null;
        this.playChinese(item.meaning);
      });
    },

    // 播放中文释义
    playChinese(text) {
      if (!text) {
        this.destroyAllAudio();
        return;
      }
      const encodeText = encodeURIComponent(text);
      const ttsUrl = `https://fanyi.baidu.com/gettts?text=${encodeText}&lan=zh&spd=4&source=web`;
      this.chineseAudio = uni.createInnerAudioContext();
      this.chineseAudio.src = ttsUrl;
      this.chineseAudio.play();

      // 中文播放完毕，彻底解锁交互
      this.chineseAudio.onEnded(() => {
        this.destroyAllAudio();
      });

      this.chineseAudio.onError(() => {
        this.destroyAllAudio();
      });
    },

    // 清空所有错题
    clearErrorList() {
      uni.showModal({
        title: '提示',
        content: '确定要清空所有错题吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync(ERROR_WORD_KEY);
            this.errorList = [];
            uni.showToast({ title: '清空成功', icon: 'none' });
          }
        }
      });
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
page {
  background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
  height: 100vh;
  overflow: hidden;
}
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

/* 顶部导航 —— 完全固定，不会跟随滚动 */
.top-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--status-bar-height) + 20rpx) 30rpx 20rpx;
  background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
}
.back-btn, .clear-btn {
  font-size: 30rpx;
  color: #ff6a8e;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 滚动容器：顶部留出导航高度，仅列表滚动 */
.scroll-content {
  flex: 1;
  margin-top: calc(var(--status-bar-height) + 100rpx);
  padding: 0 10rpx;
}

/* 空状态 */
.empty-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.empty-text {
  font-size: 32rpx;
  color: #999;
}

/* 列表外层 */
.list-wrap {
  padding: 20rpx 30rpx;
}

/* 列表条目 + 点击交互样式 */
.item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  /* 常规按压效果 */
}
.item:active {
  transform: scale(0.98);
  box-shadow: 0 3rpx 9rpx rgba(0, 0, 0, 0.04);
}

/* 正在朗读的条目：高亮锁定样式 */
.item.active {
  background: #ffeef3;
  border: 2rpx solid #ff6a8e;
  transform: scale(0.98);
  pointer-events: none; /* 朗读期间禁止重复点击 */
}

.word-info {
  flex: 1;
}
.word {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6a8e;
  display: block;
  margin-bottom: 10rpx;
}
.mean {
  font-size: 28rpx;
  color: #666;
}
.img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
}
</style>