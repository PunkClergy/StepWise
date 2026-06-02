<template>
	<view class="math-page">
		<view class="question-box">
			<text class="question-text">{{ question }}</text>
			<!-- 放大我的答案 -->
			<view class="user-answer">
				📝️：<text class="ans-num">{{ selectNumVal || "--" }}</text>
			</view>
		</view>

		<!-- 键盘使用 v-for 循环渲染，减少大量重复DOM，提升渲染性能 -->
		<view class="num-keyboard">
			<view class="key-row" v-for="(row, idx) in keyboardRows" :key="idx">
				<view class="key" :class="item.class" @click="item.click(item.val)" v-for="item in row" :key="item.val">
					<text>{{ item.icon }}</text>
				</view>
			</view>
		</view>

		<view class="submit-wrap">
			<!-- 提交按钮增加跳动动画 -->
			<view class="submit-btn pulse-btn" @click="checkAnswer"><text class="icon-hand">👆</text></view>
			<view class="next-btn" @click="createNewQuestion"><text class="next-text">➡️</text></view>
		</view>

		<view class="stat-box" @click="toHistory">
			<text>📝：{{ totalCount }} | ✨ 答对：{{ rightCount }} | 🎯 正确率：{{ rateText }}</text>
		</view>

		<!-- 弹窗使用懒指令，不展示时不渲染DOM，减少内存占用 -->
		<view class="modal-mask" v-if="showModal" @click.self="closeModal">
			<view class="modal-box" :class="modalType">
				<view class="modal-icon">{{ modalIcon }}</view>
				<view class="modal-title">{{ modalTitle }}</view>
				<view class="modal-content">{{ modalContent }}</view>
				<view class="modal-btns">
					<view class="modal-btn modal-cancel" v-if="modalShowCancel" @click="modalCancel">
						{{ modalCancelText }}
					</view>
					<view class="modal-btn modal-confirm" @click="modalConfirm">{{ modalConfirmText }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				maxNum: 10,
				question: "",
				rightAnswer: 0,
				selectNumVal: "",
				totalCount: 0,
				rightCount: 0,
				isClickLock: false,
				rateText: "0%",
				// 错题列表（新增）
				errorQuestions: [],

				// 配置项使用只读常量，避免被意外修改，提升安全性
				config: Object.freeze({
					STAGE_1_MIN: 10,
					STAGE_1_MAX: 30,
					STAGE_1_RATE: 90,
					STAGE_2_MIN: 31,
					STAGE_2_MAX: 50,
					STAGE_2_RATE: 60,
					OVER_COUNT: 50,
					TIP_INTERVAL: 10,
				}),

				lastTipCount: 0,
				last500TipCount: 0,
				needShowTip: false,

				// 键盘数据化配置，DOM只做渲染，解耦视图与数据
				keyboardRows: [
					[{
							val: '1',
							icon: '1️',
							class: 'pink-key',
							click: this.selectNum
						},
						{
							val: '2',
							icon: '2️',
							class: 'pink-key',
							click: this.selectNum
						},
						{
							val: '3',
							icon: '3️',
							class: 'pink-key',
							click: this.selectNum
						},
					],
					[{
							val: '4',
							icon: '4️',
							class: 'pink-key',
							click: this.selectNum
						},
						{
							val: '5',
							icon: '5️',
							class: 'pink-key',
							click: this.selectNum
						},
						{
							val: '6',
							icon: '6️',
							class: 'pink-key',
							click: this.selectNum
						},
					],
					[{
							val: '7',
							icon: '7️',
							class: 'blue-key',
							click: this.selectNum
						},
						{
							val: '8',
							icon: '8️',
							class: 'blue-key',
							click: this.selectNum
						},
						{
							val: '9',
							icon: '9️',
							class: 'blue-key',
							click: this.selectNum
						},
					],
					[{
							val: '0',
							icon: '0️',
							class: 'blue-key zero-key',
							click: this.selectNum
						},
						{
							val: 'clear',
							icon: '🧽',
							class: 'clear-key',
							click: this.clearSelect
						},
					]
				],

				// 弹窗相关变量统一管理，减少零散响应式数据
				showModal: false,
				modalType: '',
				modalIcon: '',
				modalTitle: '',
				modalContent: '',
				modalConfirmText: '',
				modalCancelText: '',
				modalShowCancel: false,
				modalConfirmCallback: null,
				modalCancelCallback: null
			};
		},
		onLoad(options) {
			this.loadStatsFromStorage();
			// 加载错题缓存（新增）
			this.loadErrorQuestionsFromStorage();

			if (options.maxNum) {
				this.maxNum = ~~options.maxNum || 10; // 双按位取整，比parseInt性能更高
			}
			uni.setNavigationBarTitle({
				title: `${this.maxNum}以内加减法`
			});
			this.createNewQuestion();
		},
		methods: {
			toHistory() {
				uni.navigateTo({
					url: '/pages/history/history'
				})
			},
			// 存储读取增加空值保护，减少异常判断开销
			loadStatsFromStorage() {
				try {
					const stats = uni.getStorageSync('math_stats') || {};
					this.totalCount = stats.totalCount || 0;
					this.rightCount = stats.rightCount || 0;
					this.lastTipCount = stats.lastTipCount || 0;
					this.last500TipCount = stats.last500TipCount || 0;
					this.calcRate();
				} catch (e) {}
			},
			// 存储写入使用对象简写，减少语法开销
			saveStatsToStorage() {
				try {
					uni.setStorageSync('math_stats', {
						totalCount: this.totalCount,
						rightCount: this.rightCount,
						lastTipCount: this.lastTipCount,
						last500TipCount: this.last500TipCount
					});
				} catch (e) {}
			},

			// ========== 错题缓存核心方法（新增）==========
			// 从本地缓存加载错题
			loadErrorQuestionsFromStorage() {
				try {
					const list = uni.getStorageSync('math_error_questions') || [];
					this.errorQuestions = list;
				} catch (e) {}
			},
			// 保存错题到本地缓存
			saveErrorQuestionsToStorage() {
				try {
					uni.setStorageSync('math_error_questions', this.errorQuestions);
				} catch (e) {}
			},
			// 记录答错的题目
			saveErrorQuestion() {
				// 获取当前时间 年月日时分秒
				const date = new Date();
				const timeStr =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

				// 构造错题对象
				const errorItem = {
					time: timeStr, // 答题时间
					question: this.question, // 题目详情
					userAnswer: this.selectNumVal, // 错误答案
					rightAnswer: this.rightAnswer // 正确答案
				};

				// 加入错题列表
				this.errorQuestions.unshift(errorItem); // 最新的错题放前面
				// 保存到缓存
				this.saveErrorQuestionsToStorage();
			},

			// 合并重复逻辑，减少重复计算，提升执行效率
			checkLevelTip() {
				const {
					totalCount,
					rightCount,
					config
				} = this;
				if (totalCount < config.STAGE_1_MIN) {
					this.needShowTip = false;
					return;
				}

				const rate = (rightCount / totalCount) * 100;
				let canShow = false;

				// 条件合并，减少判断层级
				if ((totalCount >= config.STAGE_1_MIN && totalCount <= config.STAGE_1_MAX && rate >= config
						.STAGE_1_RATE) ||
					(totalCount >= config.STAGE_2_MIN && totalCount <= config.STAGE_2_MAX && rate >= config.STAGE_2_RATE)
				) {
					canShow = true;
				}

				// 满足条件才判断提示间隔
				this.needShowTip = canShow && (this.lastTipCount === 0 || totalCount - this.lastTipCount >= config
					.TIP_INTERVAL);
			},

			// 简化调用，移除重复判断
			showLevelTipModal() {
				this.showTipModal();
			},

			showTipModal() {
				this.openModal({
					type: "success",
					icon: "🌟",
					title: "恭喜你！",
					content: "您已经很厉害了，要不要提升难度啊？",
					confirmText: "去提升",
					cancelText: "再练练",
					showCancel: true,
					confirm: () => {
						// ---------------- 核心逻辑 ----------------
						// 1. 清空本页面所有缓存
						try {
							uni.removeStorageSync('math_stats'); // 清空答题统计
							uni.removeStorageSync('math_error_questions'); // 清空错题记录
						} catch (e) {}

						// 2. 设置当前科目为 math
						uni.setStorageSync('currentSubject', 'math');

						// 3. 返回上一页（你原来的逻辑）+ 跳转到配置页
						uni.redirectTo({
							url: '/pages/mathConfig/mathConfig' // 请确认你的页面路径是否正确
						});
					},
					cancel: () => {
						this.lastTipCount = this.totalCount;
						this.saveStatsToStorage();
					}
				});
			},

			// 弹窗赋值简化，减少冗余代码
			openModal(options) {
				Object.assign(this, {
					modalType: options.type || '',
					modalIcon: options.icon || '',
					modalTitle: options.title || '',
					modalContent: options.content || '',
					modalConfirmText: options.confirmText || '',
					modalCancelText: options.cancelText || '',
					modalShowCancel: options.showCancel || false,
					modalConfirmCallback: options.confirm || null,
					modalCancelCallback: options.cancel || null,
					showModal: true
				});
			},
			closeModal() {
				this.showModal = false;
				this.isClickLock = false;
			},
			modalConfirm() {
				// 答错点击重新答题 → 清空答案
				if (this.modalConfirmText === '重新答题') {
					this.selectNumVal = ''
				}
				this.modalConfirmCallback?.();
				this.closeModal();
				// 可选链操作符，减少判断开销
				this.needShowTip && setTimeout(() => {
					this.showLevelTipModal();
					this.needShowTip = false;
				}, 300);
			},
			modalCancel() {
				this.modalCancelCallback?.();
				this.closeModal();
			},

			// 计算正确率简化，减少临时变量
			calcRate() {
				this.rateText = this.totalCount === 0 ?
					"0%" :
					`${Math.round(this.rightCount / this.totalCount * 100)}%`;
			},

			// 出题逻辑优化：移除无限循环，减少性能损耗
			createNewQuestion() {
				const limit = this.maxNum;
				let a, b, type;

				type = Math.random() > 0.5 ? 0 : 1;
				if (type === 0) {
					// 加法：直接生成不超限的数字
					a = Math.floor(Math.random() * (limit + 1));
					b = Math.floor(Math.random() * (limit - a + 1));
				} else {
					// 减法：保证a >= b
					a = Math.floor(Math.random() * (limit + 1));
					b = Math.floor(Math.random() * (a + 1));
				}

				this.rightAnswer = type ? a - b : a + b;
				this.question = `${a} ${type ? '-' : '+'} ${b} = ?`;
				this.selectNumVal = "";
			},

			// 输入限制简化
			selectNum(numStr) {
				if (this.isClickLock || this.selectNumVal.length >= 4) return;
				this.selectNumVal += numStr;
			},
			clearSelect() {
				this.selectNumVal = "";
			},

			// 校验答案简化：减少重复类型转换
			checkAnswer() {
				if (this.isClickLock || !this.selectNumVal) {
					!this.selectNumVal && uni.showToast({
						title: "请输入答案",
						icon: "none"
					});
					return;
				}

				this.isClickLock = true;
				const userAns = Number(this.selectNumVal);

				// 统计数据统一更新
				this.totalCount++;
				userAns === this.rightAnswer && this.rightCount++;

				this.calcRate();
				this.saveStatsToStorage();
				this.checkLevelTip();

				// 弹窗逻辑简化
				if (userAns === this.rightAnswer) {
					this.openModal({
						type: "success",
						icon: "🎉",
						title: "太棒啦！",
						content: `你真厉害！\n当前正确率：${this.rateText}`,
						confirmText: "下一题",
						cancelText: "再看一遍",
						showCancel: true,
						confirm: this.createNewQuestion
					});
				} else {
					// ========== 答错时保存错题（新增）==========
					this.saveErrorQuestion();

					uni.vibrateShort();
					this.openModal({
						type: "error",
						icon: "💡",
						title: "没关系～",
						content: `正确答案是 ${this.rightAnswer}`,
						confirmText: "重新答题",
						showCancel: false
					});
				}
			}
		}
	};
</script>

<style scoped>
	.math-page {
		background: linear-gradient(180deg, #fff9e6 0%, #fffdf5 100%);
		min-height: 100vh;
		padding: 50rpx 30rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.question-box {
		background: #fff;
		border-radius: 40rpx;
		padding: 80rpx 30rpx;
		margin: 50rpx 0;
		box-shadow: 0 8rpx 20rpx rgba(255, 200, 200, 0.15);
	}

	.question-text {
		font-size: 100rpx;
		text-align: center;
		color: #5c3a21;
		font-weight: bold;
	}

	/* 答案文字放大加粗 */
	.user-answer {
		margin-top: 60rpx;
		text-align: center;
		font-size: 45rpx;
		font-weight: bold;
		color: #5c3a21;
	}

	.ans-num {
		font-size: inherit;
		font-weight: bold;
	}

	.stat-box {
		text-align: center;
		margin: 20rpx 0;
		font-size: 34rpx;
		color: #8a6a3d;
	}

	.num-keyboard {
		flex: 1;
	}

	.key-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.key {
		width: 220rpx;
		height: 140rpx;
		border-radius: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		font-size: 40rpx;
	}

	.pink-key {
		background: #ffebf0;
	}

	.blue-key {
		background: #e6f7ff;
	}

	/* 橡皮擦按钮：去掉白色底色 */
	.clear-key {
		background: #f0f8f0 !important;
	}

	.zero-key {}

	.submit-wrap {
		display: flex;
		gap: 25rpx;
	}

	.submit-btn,
	.next-btn {
		border-radius: 50rpx;
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 40rpx;
	}

	/* 提交按钮护眼绿色 */
	.submit-btn {
		flex: 2;
		background: linear-gradient(90deg, #8bd68f, #66bb6a);
	}

	/* 提交按钮持续跳动动画 */
	.pulse-btn {
		animation: pulse 1.2s infinite ease-in-out;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.08);
		}

		100% {
			transform: scale(1);
		}
	}

	.next-btn {
		flex: 1;
		background: linear-gradient(90deg, #b3d8f7, #8cc8f7);
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.modal-box {
		width: 420rpx;
		background: #fff;
		border-radius: 40rpx;
		padding: 60rpx 40rpx;
		text-align: center;
	}

	.modal-icon {
		font-size: 120rpx;
	}

	.modal-btns {
		display: flex;
		gap: 30rpx;
		margin-top: 40rpx;
	}

	.modal-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 34rpx;
	}

	.modal-confirm {
		background: #ffb742;
		color: #fff;
	}

	.modal-cancel {
		background: #f5f5f5;
		color: #666;
	}
</style>