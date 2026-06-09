<template>
  <view class="page">
    <!-- 顶部栏：只保留返回按钮 -->
    <view class="top-wrap">
      <view class="icon-btn" @click="goBack">🏠</view>
    </view>

    <!-- 当前题号 / 总题数 -->
    <view class="title-tip">
      第 {{ currentIndex + 1 }} / 10 题
    </view>

    <!-- 单词展示：绑定点击事件，支持重复朗读 -->
    <view 
      class="word-card" 
      :class="{ scaleActive: isWordPlaying }"
      @click="handlePlayWord"
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

    <!-- 底部醒目倒计时 -->
    <view class="bottom-countdown">
      <view class="countdown-wrapper">
        <text class="countdown-label">剩余时间</text>
        <view 
          class="countdown" 
          :class="{ 
            timeWarning: remainTime <= 60,
            urgentWarning: remainTime <= 30 
          }"
        >
          {{ formattedTime }}
        </view>
      </view>
    </view>

    <!-- 成绩弹窗 - 卡通版 -->
    <view class="score-mask" v-if="showScoreModal">
      <view class="score-box cartoon-score-box">
        <!-- 装饰星星 -->
        <view class="stars-decoration">
          <text class="star star1">⭐</text>
          <text class="star star2">🌟</text>
          <text class="star star3">⭐</text>
          <text class="star star4">🌟</text>
        </view>
        
        <!-- 奖杯图标 -->
        <view class="trophy-container">
          <text class="trophy-icon">{{ getTrophyIcon }}</text>
          <view class="trophy-glow"></view>
        </view>
        
        <!-- 标题 -->
        <view class="score-title cartoon-title">
          {{ getScoreTitle }}
        </view>
        
        <!-- 分数显示 -->
        <view class="score-display">
          <text class="score-number">{{ score }}</text>
          <text class="score-unit">分</text>
        </view>
        
        <!-- 成绩详情 -->
        <view class="score-info cartoon-info">
          <view class="info-row">
            <text class="info-icon">✅</text>
            <text class="info-text">答对 {{ rightNum }} / 10 题</text>
          </view>
          <view class="info-row">
            <text class="info-icon">⏱️</text>
            <text class="info-text">用时 {{ useTime }} 秒</text>
          </view>
          <view class="info-row">
            <text class="info-icon">📊</text>
            <text class="info-text">正确率 {{ accuracy }}%</text>
          </view>
        </view>
        
        <!-- 鼓励语 -->
        <view class="encouragement">
          <text class="encourage-text">{{ getEncouragement }}</text>
        </view>
        
        <!-- 按钮组 -->
        <view class="btn-group cartoon-btns">
          <button class="btn back-btn cartoon-btn" @click="goBack">
            <text class="btn-text">去学习</text>
          </button>
          <button class="btn reset-btn cartoon-btn" @click="restartTest">
            <text class="btn-text">再来一次</text>
          </button>
        </view>
        
        <!-- 底部装饰 -->
        <view class="bottom-decoration">
          <text class="deco-text">🎉 继续加油哦！ 🎉</text>
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
      currentWordInfo: null,
      options: [],
      totalTime: 600,
      remainTime: 600,
      timer: null,
      rightNum: 0,
      score: 0,
      startTime: 0,
      showScoreModal: false,
      useTime: 0,
      accuracy: 0,
      isWordPlaying: false,
      wordAudio: null
    };
  },
  computed: {
    // 格式化时间
    formattedTime() {
      const sec = this.remainTime;
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    },
    
    // 根据分数返回不同的奖杯图标
    getTrophyIcon() {
      if (this.score >= 90) return '🏆';
      if (this.score >= 70) return '🥇';
      if (this.score >= 60) return '🥈';
      return '🥉';
    },
    
    // 根据分数返回不同的标题
    getScoreTitle() {
      if (this.score === 100) return '完美满分！太棒啦！';
      if (this.score >= 90) return '超级厉害！';
      if (this.score >= 80) return '表现很棒！';
      if (this.score >= 60) return '不错哦！';
      return '继续加油！';
    },
    
    // 根据分数返回鼓励语
    getEncouragement() {
      const encouragements = [
        "你是最棒的！继续发光吧！✨",
        "每天进步一点点，你会更出色！💪",
        "学习就像搭积木，越搭越高哦！🧩",
        "你的努力，时间都看得见！⏰",
        "保持这份热情，未来可期！🌈",
        "小小学霸就是你！🤓",
        "英语小达人正在养成中！🚀"
      ];
      
      if (this.score >= 90) {
        return encouragements[Math.floor(Math.random() * 3)];
      } else if (this.score >= 60) {
        return encouragements[Math.floor(Math.random() * 3) + 2];
      } else {
        return "别灰心，下次一定会更好！💖";
      }
    }
  },
  onLoad() {
    this.initTest();
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.destroyWordAudio();
  },
  methods: {
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
      this.handlePlayWord();
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

    // 播放单词音频
    handlePlayWord() {
      if (!this.currentWordInfo?.audio) return;
      this.destroyWordAudio();
      this.isWordPlaying = true;

      this.wordAudio = uni.createInnerAudioContext();
      this.wordAudio.src = this.currentWordInfo.audio;
      this.wordAudio.play();

      this.wordAudio.onEnded(() => {
        this.destroyWordAudio();
      });
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
      if (this.options.some(opt => opt.isSelected)) return;

      this.options.forEach(opt => opt.isSelected = false);
      item.isSelected = true;

      if (!item.correct) {
        this.saveErrorWord(this.currentWordInfo);
      } else {
        this.rightNum++;
      }

      setTimeout(() => {
        if (this.currentIndex >= 9) {
          this.calcScore();
        } else {
          this.currentIndex++;
          this.loadQuestion();
        }
      }, 400);
    },

    // 保存错题
    saveErrorWord(wordItem) {
      let errorList = uni.getStorageSync(ERROR_WORD_KEY) || [];
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

    // 返回首页
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
  padding-bottom: 200rpx;
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
  justify-content: flex-start;
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

/* 底部醒目倒计时 */
.bottom-countdown {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.8));
  backdrop-filter: blur(10px);
  padding: 30rpx 0;
  z-index: 100;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.countdown-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.countdown-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.countdown {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 50rpx;
  border-radius: 60rpx;
  box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.3);
  color: white;
  letter-spacing: 4rpx;
  transition: all 0.3s ease;
}

.timeWarning {
  background: linear-gradient(135deg, #ff6a8e 0%, #ff4d6d 100%);
  box-shadow: 0 8rpx 25rpx rgba(255, 77, 109, 0.4);
  animation: pulse 1s infinite;
}

.urgentWarning {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  box-shadow: 0 8rpx 25rpx rgba(255, 71, 87, 0.5);
  animation: blink 0.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
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
  transition: all 0.3s ease;
  transform: scale(1);
  cursor: pointer;
}
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

/* ==================== 卡通弹窗样式 ==================== */
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

/* 卡通弹窗容器 */
.cartoon-score-box {
  width: 85%;
  background: linear-gradient(145deg, #fff9e6, #fff0f5);
  border-radius: 50rpx;
  padding: 50rpx 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 20rpx 60rpx rgba(255, 182, 193, 0.4),
    inset 0 -10rpx 30rpx rgba(255, 255, 255, 0.5);
  border: 8rpx solid #ffb6c1;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 弹窗动画 */
@keyframes popIn {
  0% {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  70% {
    transform: scale(1.05) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 星星装饰 */
.stars-decoration {
  position: absolute;
  top: 20rpx;
  left: 0;
  right: 0;
  height: 80rpx;
}

.star {
  position: absolute;
  font-size: 40rpx;
  animation: twinkle 1.5s infinite alternate;
}

.star1 { left: 40rpx; top: 10rpx; animation-delay: 0s; }
.star2 { right: 60rpx; top: 0; animation-delay: 0.3s; }
.star3 { left: 120rpx; top: 40rpx; animation-delay: 0.6s; }
.star4 { right: 100rpx; top: 30rpx; animation-delay: 0.9s; }

@keyframes twinkle {
  0% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  100% { transform: scale(1.3) rotate(20deg); opacity: 1; }
}

/* 奖杯容器 */
.trophy-container {
  position: relative;
  margin: 20rpx auto 30rpx;
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trophy-icon {
  font-size: 120rpx;
  z-index: 2;
  position: relative;
  filter: drop-shadow(0 10rpx 20rpx rgba(255, 215, 0, 0.4));
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-10rpx) scale(1.05); }
}

.trophy-glow {
  position: absolute;
  width: 180rpx;
  height: 180rpx;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 0.8; }
}

/* 标题 */
.cartoon-title {
  text-align: center;
  font-size: 44rpx;
  font-weight: bold;
  color: #ff6b8a;
  margin-bottom: 20rpx;
  text-shadow: 2rpx 2rpx 0 #fff;
  letter-spacing: 4rpx;
}

/* 分数显示 */
.score-display {
  text-align: center;
  margin: 20rpx 0 40rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 30rpx;
  border: 6rpx dashed #ff9a9e;
}

.score-number {
  font-size: 96rpx;
  font-weight: bold;
  color: #ff6b6b;
  text-shadow: 3rpx 3rpx 0 #fff;
  font-family: 'Comic Sans MS', cursive;
}

.score-unit {
  font-size: 36rpx;
  color: #ff8e8e;
  margin-left: 10rpx;
}

/* 成绩详情 */
.cartoon-info {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 25rpx;
  padding: 25rpx;
  margin-bottom: 30rpx;
  border: 4rpx solid #ffccd5;
}

.info-row {
  display: flex;
  align-items: center;
  margin: 15rpx 0;
  padding: 10rpx 0;
}

.info-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 50rpx;
  text-align: center;
}

.info-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

/* 鼓励语 */
.encouragement {
  text-align: center;
  margin: 20rpx 0 30rpx;
  padding: 15rpx;
  background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 20rpx;
}

.encourage-text {
  font-size: 34rpx;
  color: #ff6b8a;
  font-weight: bold;
  font-style: italic;
}

/* 卡通按钮 */
.cartoon-btns {
  display: flex;
  gap: 30rpx;
  margin-top: 20rpx;
}

.cartoon-btn {
  flex: 1;
  height: 90rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cartoon-btn:active {
  transform: scale(0.95);
}

.back-btn.cartoon-btn {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #666;
}

.reset-btn.cartoon-btn {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
}

.btn-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.btn-text {
  font-size: 30rpx;
}

/* 底部装饰 */
.bottom-decoration {
  text-align: center;
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 4rpx dotted #ffccd5;
}

.deco-text {
  font-size: 28rpx;
  color: #ff8e8e;
  font-weight: bold;
}
</style>