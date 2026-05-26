<template>
	<view class="page">
		<view class="game-wrap" v-show="!showModal">
			<view class="header">
				<view class="info-bar">
					<view class="info-item">⭐{{ level }}</view>
					<view class="info-item">📝{{ total }}/10</view>
					<view class="info-item">🏆{{ score }}</view>
				</view>
			</view>

			<view class="question-box">
				<text class="question">{{ qText }}</text>
			</view>

			<view class="input-wrap">
				<input v-model="userAns" type="number" class="answer-input" placeholder="?" :disabled="isCountDown" />
			</view>

			<view class="btn-wrap">
				<view class="submit-btn" @click="checkAnswer" :disabled="isCountDown"></view>
			</view>

			<view class="tip" :class="msgType">
				{{ msg }}
				<text v-if="isCountDown && countDownNum > 0" style="margin-left:20rpx;color:#1677ff">
					⏳{{ countDownNum }}s
				</text>
			</view>
		</view>

		<!-- 结算弹窗 -->
		<view class="modal-mask" v-show="showModal">
			<view class="modal-content">
				<view class="modal-title">{{ modalTitle }}</view>

				<!-- 基础统计信息 -->
				<view class="result-info">
					<view>⭐ 当前关卡：{{ level }}</view>
					<view>✅ 答对题目：{{ right }}</view>
					<view>❌ 答错题目：{{ wrong }}</view>
					<view>🏆 本局得分：{{ score }}</view>
					<view>
						📈 正确率：{{ total > 0 ? (right / total * 100).toFixed(1) : 0 }}%
					</view>
				</view>

				<!-- 完整试卷清单 -->
				<view class="paper-box">
					<view class="paper-title">📄 本关试卷详情</view>
					<view class="paper-item" v-for="(item, index) in answerPaper" :key="index">
						<view class="q-index">第{{ index + 1 }}题</view>
						<view class="q-content">
							{{ item.question }}
							<!-- 有首次错误答案则展示 -->
							<text class="ans-wrong" v-if="item.firstWrongAnswer !== ''">
								首次错误答案：{{ item.firstWrongAnswer }}
							</text>
							<text class="ans-user">你的最终答案：{{ item.userFinalAnswer }}</text>
							<text class="ans-real">正确答案：{{ item.realAnswer }}</text>
						</view>
						<view class="q-tag" :class="item.isRight ? 'tag-right' : 'tag-wrong'">
							{{ item.isRight ? '答对' : '答错' }}
						</view>
					</view>
				</view>

				<view class="reward-box" v-if="pass">
					<image class="reward-img" :src="rewardText" mode="widthFix"></image>
				</view>
				<view class="no-pass" v-else>
					<image class="reward-img" src="/static/images/Frown.png" mode="widthFix"></image>
				</view>

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