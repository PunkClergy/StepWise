<template>
	<!-- 页面根容器：整个口算游戏页面的最外层 -->
	<view class="page">
		<!-- 极端隐蔽的历史记录入口 -->
		<view class="hidden-history" @click="goHistory"></view>
		<!-- 游戏主内容区：弹窗关闭时才显示 -->
		<view class="game-wrap" v-show="!showModal">
			<!-- 顶部标题栏：包含关卡、题数、分数信息 -->
			<view class="header">
				<!-- 信息条容器：存放三个状态信息 -->
				<view class="header">
				    <!-- 信息条容器：存放三个状态信息 -->
				    <view class="info-bar">
				        <!-- 关卡信息：显示当前等级 -->
				        <view class="info-item">⭐{{ level }}</view>
				        <!-- 答题进度：已答/总题数10题 -->
				        <view class="info-item">📝{{ total }}/10</view>
				        <!-- 得分信息：显示当前总分 -->
				        <view class="info-item">🏆{{ score }}</view>
				    </view>
				
				    <!-- 新增：底部进度条 -->
				    <view class="progress-bar">
				        <view class="progress-inner" :style="{ width: (total / 10) * 100 + '%' }"></view>
				    </view>
				</view>
				
			</view>

			<!-- 题目展示盒子：显示数学算式 -->
			<view class="question-box">
				<!-- 题目文本：渲染当前生成的口算题 -->
				<text class="question">{{ qText }}</text>
			</view>

			<!-- 输入框容器：包裹答案输入区域 -->
			<view class="input-wrap">
				<!-- 答案输入框：数字类型，双向绑定用户答案，倒计时期间禁用 -->
				<input ref="inputBox" v-model="userAns" type="number" class="answer-input" placeholder="?"
					:disabled="isCountDown" />
			</view>

			<!-- 按钮容器：提交答案按钮 -->
			<view class="btn-wrap">
				<!-- 提交按钮：点击校验答案，倒计时期间禁用点击 -->
				<view class="submit-btn" @click="checkAnswer" :disabled="isCountDown"></view>
			</view>

			<!-- 提示信息区：显示正确/错误/请输入数字，动态绑定样式 -->
			<view class="tip" :class="msgType">
				<!-- 提示文字内容 -->
				{{ msg }}
				<!-- 倒计时显示：倒计时中且数字>0时显示 -->
				<text v-if="isCountDown && countDownNum > 0" style="margin-left:20rpx;color:#1677ff">
					⏳{{ countDownNum }}s
				</text>
			</view>
		</view>

		<!-- 结算弹窗遮罩层：弹窗开启时显示 -->
		<view class="modal-mask" v-show="showModal">
			<!-- 弹窗内容盒子：弹窗主体区域 -->
			<view class="modal-content">
				<!-- 弹窗标题：通关/未通关提示 -->
				<view class="modal-title">{{ modalTitle }}</view>

				<!-- 结果统计信息：展示本局答题数据 -->
				<view class="result-info">
					<!-- 显示当前关卡等级 -->
					<view>⭐ 当前关卡：{{ level }}</view>
					<!-- 显示答对题目数量 -->
					<view>✅ 答对题目：{{ right }}</view>
					<!-- 显示答错题目数量 -->
					<view>❌ 答错题目：{{ wrong }}</view>
					<!-- 显示本局最终得分 -->
					<view>🏆 本局得分：{{ score }}</view>
					<!-- 显示正确率：保留1位小数，无答题时显示0 -->
					<view>
						📈 正确率：{{ total > 0 ? (right / total * 100).toFixed(1) : 0 }}%
					</view>
				</view>

				<!-- 试卷详情盒子：展示每一题的答题记录 -->
				<view class="paper-box">
					<!-- 试卷标题 -->
					<view class="paper-title">📄 本关试卷详情</view>
					<!-- 单题记录项：循环渲染答卷列表 -->
					<view class="paper-item" v-for="(item, index) in answerPaper" :key="index">
						<!-- 题号：第1题~第10题 -->
						<view class="q-index">第{{ index + 1 }}题</view>
						<!-- 题目内容区：展示题目+答案信息 -->
						<view class="q-content">
							<!-- 题目原文 -->
							{{ item.question }}
							<!-- 首次错误答案：有值时才显示 -->
							<text class="ans-wrong" v-if="item.firstWrongAnswer !== ''">
								首次错误答案：{{ item.firstWrongAnswer }}
							</text>
							<!-- 用户最终答对的答案 -->
							<text class="ans-user">你的最终答案：{{ item.userFinalAnswer }}</text>
							<!-- 题目正确答案 -->
							<text class="ans-real">正确答案：{{ item.realAnswer }}</text>
						</view>
						<!-- 对错标签：根据答题结果动态显示样式 -->
						<view class="q-tag" :class="item.isRight ? 'tag-right' : 'tag-wrong'">
							{{ item.isRight ? '答对' : '答错' }}
						</view>
					</view>
				</view>

				<!-- 通关奖励盒子：通关时显示奖励图标 -->
				<view class="reward-box" v-if="pass">
					<image class="reward-img" :src="rewardText" mode="widthFix" @click="previewRewardImage"></image>
				</view>
				<!-- 未通关提示：未通关时显示沮丧表情 -->
				<view class="no-pass" v-else>
					<image class="reward-img" src="/static/images/Frown.png" mode="widthFix"></image>
				</view>

				<!-- 操作按钮：下一关/重新挑战，动态样式+文字 -->
				<button class="action-btn" :class="pass ? 'next' : 'again'" @click="action">
					{{ pass ? '➡️ 下一关' : '🔁 重新挑战' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import script from './index.js'
	export default script
</script>

<style src="./index.css"></style>