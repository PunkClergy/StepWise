# StepWise
# <template>
  <!-- 外层增加安全区，规避状态栏 -->
  <view class="safe-area">
    <view class="page-wrap">
      <!-- 顶部导航栏 -->
      <view class="nav-bar">
        <text class="nav-title">一元一次方程练习</text>
        <view class="progress-box">
          <text class="progress-text">{{ curIdx + 1 }} / {{ totalNum }}</text>
        </view>
      </view>

      <!-- 主卡片区域 -->
      <view class="card">
        <!-- 题目区域 -->
        <view class="question-area">
          <text class="question">{{ questionStr }}</text>
          <view class="input-row">
            <text class="equal-symbol">x =</text>
            <input 
              class="ans-input" 
              v-model="userAns" 
              type="digit" 
              placeholder="请输入答案"
              @confirm="checkAnswer"
            />
          </view>
        </view>

        <!-- 对错提示 -->
        <view class="tip-box" :class="{ 'tip-correct': isRight, 'tip-error': isWrong }" v-if="showTip">
          {{ tipText }}
        </view>

        <!-- 题目解析 -->
        <view class="parse-box" v-if="showParse">
          <view class="parse-title">
            <text class="icon">📖</text>
            <text>解题步骤解析</text>
          </view>
          <view class="parse-content">{{ parseText }}</view>
        </view>

        <!-- 按钮区域：分步显示 -->
        <view class="btn-row">
          <!-- 第一步：仅提交按钮 -->
          <button class="btn btn-check" v-if="!showNextBtn" @click="checkAnswer">提交答案</button>
          <!-- 第二步：解析出现后，显示下一题按钮 -->
          <button class="btn btn-next" v-if="showNextBtn" @click="nextQuestion">下一题</button>
        </view>
      </view>

      <!-- 数据统计卡片 -->
      <view class="stat-card">
        <view class="stat-item">
          <text class="stat-icon">✅</text>
          <text class="stat-num">{{ rightCount }}</text>
          <text class="stat-label">答对题目</text>
        </view>
        <view class="divider"></view>
        <view class="stat-item">
          <text class="stat-icon">❌</text>
          <text class="stat-num">{{ wrongCount }}</text>
          <text class="stat-label">答错题目</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      totalNum: 10,
      curIdx: 0,
      questionStr: '',
      realAnswer: 0,
      userAns: '',

      showTip: false,
      tipText: '',
      isRight: false,
      isWrong: false,
      showParse: false,
      parseText: '',
      // 控制下一题按钮显示
      showNextBtn: false,

      rightCount: 0,
      wrongCount: 0,
      a: 0,
      b: 0,
      c: 0
    }
  },
  onShow() {
    this.generateQuestion()
  },
  methods: {
    // 生成随机一元一次方程 ax ± b = c，保证解为整数
    generateQuestion() {
      let a, b, c;
      do {
        a = this.getRandom(2, 10)
        b = this.getRandom(-15, 15)
        c = this.getRandom(-15, 15)
      } while ((c - b) % a !== 0)

      this.a = a
      this.b = b
      this.c = c
      this.realAnswer = (c - b) / a

      const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`
      this.questionStr = `${a}x ${bStr} = ${c}`

      // 重置所有状态：回到初始状态，只显示提交按钮
      this.userAns = ''
      this.showTip = false
      this.showParse = false
      this.showNextBtn = false
      this.isRight = false
      this.isWrong = false
      this.tipText = ''
      this.parseText = ''
    },

    // 生成区间随机整数
    getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },

    // 拼接解题解析
    createParse() {
      const { a, b, c } = this
      let step1, step2, step3
      if (b >= 0) {
        step1 = `原式：${a}x + ${b} = ${c}`
        step2 = `移项：${a}x = ${c} - ${b}`
      } else {
        const absB = Math.abs(b)
        step1 = `原式：${a}x - ${absB} = ${c}`
        step2 = `移项：${a}x = ${c} + ${absB}`
      }
      const temp = c - b
      step3 = `计算：${a}x = ${temp}\n系数化为1：x = ${temp} ÷ ${a} = ${this.realAnswer}`
      this.parseText = `${step1}\n${step2}\n${step3}`
    },

    // 提交答案
    checkAnswer() {
      if (!this.userAns) {
        uni.showToast({ title: '请输入答案', icon: 'none' })
        return
      }
      this.showTip = true
      this.showParse = true
      this.createParse()

      const ans = Number(this.userAns)
      if (ans === this.realAnswer) {
        this.isRight = true
        this.isWrong = false
        this.tipText = '回答正确，太棒啦！'
        this.rightCount++
      } else {
        this.isWrong = true
        this.isRight = false
        this.tipText = `回答错误，正确答案：${this.realAnswer}`
        this.wrongCount++
      }
      // 解析显示后，切换为 下一题 按钮
      this.showNextBtn = true
    },

    // 切换下一题
    nextQuestion() {
      if (this.curIdx < this.totalNum - 1) {
        this.curIdx++
        this.generateQuestion()
      } else {
        uni.showModal({
          title: '练习完成',
          content: `共 ${this.totalNum} 道题\n答对：${this.rightCount} 道\n答错：${this.wrongCount} 道`,
          confirmText: '重新练习',
          success: res => {
            if (res.confirm) {
              this.curIdx = 0
              this.rightCount = 0
              this.wrongCount = 0
              this.generateQuestion()
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>
/* 全局页面背景 + 状态栏安全适配 */
page {
  background: linear-gradient(160deg, #eef4ff 0%, #f5f8ff 100%);
}
/* 顶部安全区，避开手机通知栏 */
.safe-area {
  padding-top: var(--status-bar-height);
  min-height: 100vh;
  box-sizing: border-box;
}
.page-wrap {
  padding: 30rpx;
  box-sizing: border-box;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}
.nav-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #16327c;
  letter-spacing: 2rpx;
}
.progress-box {
  background: linear-gradient(90deg, #d7e3fc, #e8edf8);
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(64, 98, 216, 0.15);
}
.progress-text {
  font-size: 30rpx;
  color: #3056cc;
  font-weight: 500;
}

/* 主内容卡片 */
.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(64, 98, 216, 0.18);
  margin-bottom: 40rpx;
}

/* 题目区域 */
.question-area {
  text-align: center;
  margin-bottom: 50rpx;
}
.question {
  font-size: 56rpx;
  color: #1f2937;
  letter-spacing: 6rpx;
  font-weight: 500;
}
.input-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 50rpx;
}
.equal-symbol {
  font-size: 52rpx;
  color: #4b5563;
  margin-right: 24rpx;
}
.ans-input {
  width: 200rpx;
  height: 110rpx;
  border: 4rpx solid #4062d8;
  border-radius: 16rpx;
  font-size: 50rpx;
  text-align: center;
  background-color: #f5f8ff;
  transition: all 0.2s ease;
}
/* 输入框聚焦效果 */
.ans-input:focus {
  box-shadow: 0 0 0 6rpx rgba(64, 98, 216, 0.2);
}

/* 对错提示 */
.tip-box {
  text-align: center;
  font-size: 34rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  font-weight: 500;
}
.tip-correct {
  background-color: #ecfdf5;
  color: #059669;
}
.tip-error {
  background-color: #fef2f2;
  color: #dc2626;
}

/* 解析模块 */
.parse-box {
  background: linear-gradient(120deg, #f0f4ff, #f7f9ff);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 50rpx;
  border-left: 8rpx solid #4062d8;
}
.parse-title {
  display: flex;
  align-items: center;
  font-size: 34rpx;
  color: #16327c;
  font-weight: 600;
  margin-bottom: 20rpx;
}
.parse-title .icon {
  margin-right: 12rpx;
  font-size: 36rpx;
}
.parse-content {
  font-size: 32rpx;
  color: #374151;
  line-height: 2;
  white-space: pre-line;
}

/* 按钮组 */
.btn-row {
  display: flex;
  justify-content: center;
}
.btn {
  width: 280rpx;
  height: 100rpx;
  line-height: 100rpx;
  font-size: 34rpx;
  border-radius: 20rpx;
  border: none;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.12);
  transition: transform 0.15s;
}
/* 按钮点击缩放效果 */
.btn:active {
  transform: scale(0.97);
}
.btn-check {
  background: linear-gradient(135deg, #3b5bdb, #4062d8);
}
.btn-next {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

/* 统计卡片 */
.stat-card {
  display: flex;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 35rpx 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(64, 98, 216, 0.18);
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-icon {
  display: block;
  font-size: 38rpx;
  margin-bottom: 10rpx;
}
.stat-num {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #16327c;
  line-height: 1.2;
}
.stat-label {
  font-size: 28rpx;
  color: #6b7280;
  margin-top: 8rpx;
}
.divider {
  width: 2rpx;
  background-color: #e5e7eb;
  margin: 0 10rpx;
}
</style>