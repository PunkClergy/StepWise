<template>
  <view class="page">
    <!-- 顶部栏：返回 + 倒计时 -->
    <view class="top-wrap">
      <view class="icon-btn" @click="goBack">🏠</view>
      <view class="countdown" :class="{ timeWarning: remainTime <= 60 }">
        {{ formatTime(remainTime) }}
      </view>
    </view>

    <!-- 当前题号 / 总题数 -->
    <view class="title-tip">
      第 {{ currentIndex + 1 }} / 10 题
    </view>

    <!-- 单词展示：绑定点击事件，支持重复朗读 -->
    <view 
      class="word-card" 
      :class="{ scaleActive: isWordPlaying }"
      @click="playWordAudio(currentWordInfo.audio)"
    >
      <text class="word">{{ currentWord }}</text>
    </view>

    <!-- 图片选项 2列布局 -->
    <view class="image-grid">
      <view
        class="image-item"
        v-for="(item, idx) in options"
        :key="idx"
        @click="selectAnswer(item)"
        :class="{
          correctBorder: item.isSelected && item.correct,
          wrongBorder: item.isSelected && !item.correct
        }"
      >
        <image :src="item.img" class="image" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 成绩弹窗 -->
    <view class="score-mask" v-if="showScoreModal">
      <view class="score-box">
        <view class="score-title">测试结束</view>
        <view class="score-info">
          <text>得分：{{ score }} 分</text>
          <text>答对：{{ rightNum }} / 10</text>
          <text>用时：{{ useTime }} 秒</text>
          <text>正确率：{{ accuracy }}%</text>
        </view>
        <view class="btn-group">
          <button class="btn back-btn" @click="goBack">返回</button>
          <button class="btn reset-btn" @click="restartTest">重新测试</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { wordList } from "@/utils/EN.js";
// 缓存key，统一管理
const ERROR_WORD_KEY = 'en_test_error_word';

export default {
  data() {
    return {
      wordList: wordList,
      testList: [],
      currentIndex: 0,
      currentWord: "",
      currentWordInfo: null, // 当前题目完整信息，用于存错题
      options: [],
      totalTime: 600, // 10分钟 = 600秒
      remainTime: 600,
      timer: null,
      rightNum: 0,
      score: 0,
      startTime: 0,
      showScoreModal: false,
      useTime: 0,
      accuracy: 0,
      // 单词朗读状态 & 音频实例
      isWordPlaying: false,
      wordAudio: null
    };
  },
  onLoad() {
    this.initTest();
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 页面销毁，停止并释放音频
    this.destroyWordAudio();
  },
  methods: {
    // 秒数格式化 分:秒
    formatTime(sec) {
      let m = Math.floor(sec / 60);
      let s = sec % 60;
      m = m.toString().padStart(2, '0');
      s = s.toString().padStart(2, '0');
      return `${m}:${s}`;
    },

    // 初始化测试
    initTest() {
      this.currentIndex = 0;
      this.rightNum = 0;
      this.score = 0;
      this.showScoreModal = false;
      this.remainTime = this.totalTime;
      this.startTime = Math.floor(Date.now() / 1000);
      this.isWordPlaying = false;
      this.destroyWordAudio();

      const tempList = [...this.wordList];
      this.testList = [];
      for (let i = 0; i < 10 && tempList.length > 0; i++) {
        const rnd = Math.floor(Math.random() * tempList.length);
        this.testList.push(tempList.splice(rnd, 1)[0]);
      }

      this.loadQuestion();
      this.startCountDown();
    },

    // 开启倒计时
    startCountDown() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.remainTime--;
        if (this.remainTime <= 0) {
          clearInterval(this.timer);
          this.timer = null;
          uni.showToast({ title: "时间到，自动交卷", icon: "none" });
          this.calcScore();
        }
      }, 1000);
    },

    // 加载题目
    loadQuestion() {
      const curr = this.testList[this.currentIndex];
      this.currentWordInfo = curr;
      this.currentWord = curr.word;
      this.genOptions(curr);

      // 加载题目后自动朗读单词
      this.playWordAudio(curr.audio);
    },

    // 销毁单词音频
    destroyWordAudio() {
      if (this.wordAudio) {
        this.wordAudio.stop();
        this.wordAudio.destroy();
        this.wordAudio = null;
      }
      this.isWordPlaying = false;
    },

    // 播放单词音频 + 控制卡片放大状态
    playWordAudio(audioSrc) {
      if (!audioSrc) return;
      // 重复点击会终止当前播放，重新朗读
      this.destroyWordAudio();
      // 开启放大样式
      this.isWordPlaying = true;

      this.wordAudio = uni.createInnerAudioContext();
      this.wordAudio.src = audioSrc;
      this.wordAudio.play();

      // 朗读结束，恢复原大小
      this.wordAudio.onEnded(() => {
        this.destroyWordAudio();
      });
      // 播放异常，也恢复样式
      this.wordAudio.onError(() => {
        this.destroyWordAudio();
      });
    },

    // 生成选项
    genOptions(curr) {
      const all = [...this.wordList];
      const rightOpt = {
        img: curr.img,
        correct: true,
        isSelected: false
      };
      const wrongPool = all.filter(item => item.word !== curr.word);
      const takeNum = Math.min(3, wrongPool.length);
      const wrongOpts = wrongPool
        .sort(() => Math.random() - 0.5)
        .slice(0, takeNum)
        .map(item => ({
          img: item.img,
          correct: false,
          isSelected: false
        }));

      this.options = [rightOpt, ...wrongOpts].sort(() => Math.random() - 0.5);
    },

    // 选择答案
    selectAnswer(item) {
      // 防止重复点击
      if (this.options.some(opt => opt.isSelected)) return;

      // 标记选中
      this.options.forEach(opt => opt.isSelected = false);
      item.isSelected = true;

      // 答错 → 存入本地缓存（去重）
      if (!item.correct) {
        this.saveErrorWord(this.currentWordInfo);
      } else {
        this.rightNum++;
      }

      // 延迟切换下一题
      setTimeout(() => {
        if (this.currentIndex >= 9) {
          this.calcScore();
        } else {
          this.currentIndex++;
          this.loadQuestion();
        }
      }, 400);
    },

    // 保存错题到本地缓存（去重）
    saveErrorWord(wordItem) {
      // 读取已有错题
      let errorList = uni.getStorageSync(ERROR_WORD_KEY) || [];
      // 根据单词唯一标识去重
      const hasExist = errorList.some(item => item.word === wordItem.word);
      if (!hasExist) {
        errorList.push(wordItem);
        uni.setStorageSync(ERROR_WORD_KEY, errorList);
      }
    },

    // 计算成绩
    calcScore() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      const now = Math.floor(Date.now() / 1000);
      this.useTime = now - this.startTime;
      if (this.useTime > this.totalTime) this.useTime = this.totalTime;

      this.score = this.rightNum * 10;
      this.accuracy = Math.round((this.rightNum / 10) * 100);
      this.showScoreModal = true;
    },

    // 重新测试
    restartTest() {
      this.initTest();
    },

    // 返回首页（适配分包路由）
    goBack() {
      uni.redirectTo({
        url: "/pages/sub-english/kidsEnglish"
      });
    }
  }
};
</script>

<style scoped>
page {
  background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
}
.page {
  padding: 30rpx;
  padding-top: 120rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部栏 */
.top-wrap {
  position: fixed;
  top: calc(var(--status-bar-height) + 15rpx);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  z-index: 10;
}
.icon-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 3rpx 9rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}
.countdown {
  font-size: 32rpx;
  color: #333;
  background: #fff;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 3rpx 9rpx rgba(0, 0, 0, 0.1);
}
/* 剩余1分钟倒计时变红警告 */
.timeWarning {
  color: #ff4d6d;
}

/* 题号提示 */
.title-tip {
  text-align: center;
  font-size: 30rpx;
  color: #666;
  margin: 20rpx 0;
}

/* 单词卡片 */
.word-card {
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 30rpx;
  text-align: center;
  margin: 30rpx 30rpx 60rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 140, 180, 0.15);
  /* 过渡动画 */
  transition: all 0.3s ease;
  transform: scale(1);
  /* 增加点击光标样式，提示可点击 */
  cursor: pointer;
}
/* 朗读中放大样式 */
.word-card.scaleActive {
  transform: scale(1.08);
  box-shadow: 0 12rpx 36rpx rgba(255, 110, 150, 0.25);
}
.word {
  font-size: 72rpx;
  font-weight: bold;
  color: #ff6a8e;
}

/* 图片选项 */
.image-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20rpx;
}
.image-item {
  width: 48%;
  height: 340rpx;
  background: #ffffff;
  border-radius: 36rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  transition: all 0.25s ease;
  border: 6rpx solid transparent;
}
.image {
  width: 100%;
  height: 100%;
}
.image-item:active {
  transform: scale(0.92);
}

/* 答对绿色边框 */
.correctBorder {
  border-color: #24d386;
  background: #e1ffeb;
}
/* 答错红色边框 */
.wrongBorder {
  border-color: #ff4d6d;
  background: #ffe1e1;
}

/* 成绩弹窗遮罩 */
.score-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.score-box {
  width: 80%;
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
}
.score-title {
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6a8e;
  margin-bottom: 30rpx;
}
.score-info {
  font-size: 32rpx;
  color: #333;
  line-height: 60rpx;
  margin-bottom: 40rpx;
}
.btn-group {
  display: flex;
  gap: 20rpx;
}
.btn {
  flex: 1;
  font-size: 30rpx;
  border-radius: 20rpx;
}
.back-btn {
  background: #eee;
  color: #333;
}
.reset-btn {
  background: #ff6a8e;
  color: #fff;
}
</style>