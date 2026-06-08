<template>
	<view class="math-page">
		<!-- 顶部左右图标：左首页🏠｜右错题📖，无文字、下移避开通知栏 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
			<view class="icon-btn right-icon" @click="toHistory">
				<text>📖</text>
			</view>
		</view>

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
			<!-- <view class="next-btn" @click="createNewQuestion"><text class="next-text">➡️</text></view> -->
		</view>

		<view class="stat-box" @click="toHistory">
			<text>📝：{{ totalCount }} | ✨ 答对：{{ rightCount }} | 🎯 正确率：{{ rateText }}</text>
		</view>

		<!-- 答对：全屏半透明遮罩+居中文字提示 -->
		<view v-if="showRightTip" class="right-tip-mask">
			<view class="right-tip-content">🎉太棒啦！正确率：{{ rateText }}</view>
		</view>

		<!-- 弹窗：仅错误弹窗 + 达标升级弹窗使用 -->
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
				maxNum: 10, // 当前答题范围：max以内加减法
				question: "", // 当前题目字符串
				rightAnswer: 0, // 题目的标准答案
				selectNumVal: "", // 用户输入的答案字符串
				totalCount: 0, // 累计总答题数量
				rightCount: 0, // 累计答对题目数量
				isClickLock: false, // 答题按钮锁：true=锁定禁止重复提交
				rateText: "0%", // 正确率展示文本
				errorQuestions: [], // 错题数组，存储答错题目信息用于错题本

				// 阶段配置常量：配置触发升级弹窗的答题数量与正确率阈值，Object.freeze冻结不可修改
				config: Object.freeze({
					STAGE_1_MIN: 100, // 第一阶段最低答题数
					STAGE_1_MAX: 300, // 第一阶段上限答题数
					STAGE_1_RATE: 90, // 第一阶段达标正确率%
					STAGE_2_MIN: 301, // 第二阶段起始答题数
					STAGE_2_MAX: 500, // 第二阶段上限答题数
					STAGE_2_RATE: 60, // 第二阶段达标正确率%
					TIP_INTERVAL: 10, // 达标提示弹窗冷却间隔题数
				}),

				lastTipCount: 0, // 上次弹出升级弹窗时的总题数，用于冷却判断
				last500TipCount: 0,
				needShowTip: false, // 是否满足弹出难度升级弹窗条件

				// 数字键盘配置：四行按键，包含数字与清除键，绑定对应点击事件
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
							icon: '⬅️',
							class: 'clear-key',
							click: this.clearSelect
						},
					]
				],

				// 弹窗全局字段：统一管理弹窗内容，答错弹窗/升级弹窗共用
				showModal: false, // 弹窗显示开关
				modalType: '',
				modalIcon: '', // 弹窗图标
				modalTitle: '', // 弹窗标题
				modalContent: '', // 弹窗正文内容
				modalConfirmText: '', // 确认按钮文字
				modalCancelText: '', // 取消按钮文字
				modalShowCancel: false, // 是否展示取消按钮
				modalConfirmCallback: null, // 确认按钮回调函数
				modalCancelCallback: null, // 取消按钮回调函数

				showRightTip: false, // 答对全屏提示弹窗开关
				rightTimer: null // 答对自动下一题定时器对象，用于清除延时
			};
		},
		/**
		 * 页面生命周期：页面加载时执行
		 * @param {Object} options 页面跳转携带参数，可接收maxNum难度参数
		 */
		onLoad(options) {
			this.loadStatsFromStorage(); // 读取本地缓存统计数据（总题、答对题、弹窗记录）
			this.loadErrorQuestionsFromStorage(); // 读取本地缓存错题列表

			// 如果跳转携带难度参数，赋值覆盖默认max
			if (options.maxNum) {
				this.maxNum = ~~options.maxNum || 10;
			}
			// 修改导航栏标题
			uni.setNavigationBarTitle({
				title: `${this.maxNum}以内加减法`
			});
			// 初始化生成第一道题目
			this.createNewQuestion();
		},
		/**
		 * 页面卸载生命周期：销毁定时器，防止内存泄漏
		 */
		onUnload() {
			if (this.rightTimer) clearTimeout(this.rightTimer);
		},
		methods: {
			/**
			 * 跳转错题历史页面
			 */
			toHistory() {
				uni.navigateTo({
					url: '/pages/history/history'
				})
			},
			/**
			 * 返回首页，清除难度缓存，页面重定向
			 */
			goHome() {
				try {
					uni.removeStorageSync('mathMaxNum');
				} catch (e) {}
				uni.redirectTo({
					url: '/pages/index/index'
				})
			},
			/**
			 * 从本地缓存读取答题统计数据：总题数、答对数量、上次弹窗题数
			 */
			loadStatsFromStorage() {
				try {
					const stats = uni.getStorageSync('math_stats') || {};
					this.totalCount = stats.totalCount || 0;
					this.rightCount = stats.rightCount || 0;
					this.lastTipCount = stats.lastTipCount || 0;
					this.last500TipCount = stats.last500TipCount || 0;
					this.calcRate(); // 读取数据后重新计算正确率
				} catch (e) {}
			},
			/**
			 * 把当前统计数据存入本地缓存持久化
			 */
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

			/**
			 * 读取本地缓存错题列表
			 */
			loadErrorQuestionsFromStorage() {
				try {
					const list = uni.getStorageSync('math_error_questions') || [];
					this.errorQuestions = list;
				} catch (e) {}
			},
			/**
			 * 保存错题数组到本地缓存
			 */
			saveErrorQuestionsToStorage() {
				try {
					uni.setStorageSync('math_error_questions', this.errorQuestions);
				} catch (e) {}
			},
			/**
			 * 保存单条错题信息，存入数组并缓存
			 */
			saveErrorQuestion() {
				const date = new Date();
				// 格式化当前时间字符串
				const timeStr =
					`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
				// 组装错题对象
				const errorItem = {
					time: timeStr,
					question: this.question,
					userAnswer: this.selectNumVal,
					rightAnswer: this.rightAnswer
				};
				this.errorQuestions.unshift(errorItem); // 最新错题插入数组头部
				this.saveErrorQuestionsToStorage(); // 同步缓存
			},

			/**
			 * 校验是否满足弹出难度升级弹窗条件，赋值needShowTip
			 */
			checkLevelTip() {
				const {
					totalCount,
					rightCount,
					config
				} = this;
				// 答题不足最低门槛，不开启弹窗标识
				if (totalCount < config.STAGE_1_MIN) {
					this.needShowTip = false;
					return;
				}
				// 实时计算正确率
				const rate = (rightCount / totalCount) * 100;
				let canShow = false;
				// 判断两个阶段达标规则
				if ((totalCount >= config.STAGE_1_MIN && totalCount <= config.STAGE_1_MAX && rate >= config
						.STAGE_1_RATE) ||
					(totalCount >= config.STAGE_2_MIN && totalCount <= config.STAGE_2_MAX && rate >= config.STAGE_2_RATE)
				) {
					canShow = true;
				}
				// 达标且距离上次弹窗间隔足够题数，允许弹窗
				this.needShowTip = canShow && (this.lastTipCount === 0 || totalCount - this.lastTipCount >= config
					.TIP_INTERVAL);
			},

			/**
			 * 统一调用升级弹窗
			 */
			showLevelTipModal() {
				this.showTipModal();
			},
			/**
			 * 组装并打开难度提升确认弹窗
			 */
			showTipModal() {
				this.openModal({
					type: "success",
					icon: "🌟",
					title: "恭喜你！",
					content: "您已经很厉害了，要不要提升难度啊？",
					confirmText: "去提升",
					cancelText: "再练练",
					showCancel: true,
					// 确认：清空统计缓存，跳转难度配置页
					confirm: () => {
						try {
							uni.removeStorageSync('math_stats');
							uni.removeStorageSync('math_error_questions');
						} catch (e) {}
						uni.setStorageSync('currentSubject', 'math');
						uni.redirectTo({
							url: '/pages/mathConfig/mathConfig'
						});
					},
					// 取消：记录当前总题数作为下次弹窗冷却起点
					cancel: () => {
						this.lastTipCount = this.totalCount;
						this.saveStatsToStorage();
					}
				});
			},

			/**
			 * 统一弹窗赋值函数：接收弹窗配置，赋值data并打开弹窗
			 * @param {Object} options 弹窗配置项
			 */
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
			/**
			 * 关闭弹窗，解锁答题按钮
			 */
			closeModal() {
				this.showModal = false;
				this.isClickLock = false;
			},
			/**
			 * 弹窗确认按钮点击事件
			 */
			modalConfirm() {
				// 如果是答错弹窗的重新答题，清空已输入答案
				if (this.modalConfirmText === '重新答题') {
					this.selectNumVal = ''
				}
				// 执行绑定的回调
				this.modalConfirmCallback?.();
				this.closeModal();
				// 关闭弹窗后延时判断是否弹出升级提示
				this.needShowTip && setTimeout(() => {
					this.showLevelTipModal();
					this.needShowTip = false;
				}, 300);
			},
			/**
			 * 弹窗取消按钮点击事件
			 */
			modalCancel() {
				this.modalCancelCallback?.();
				this.closeModal();
			},

			/**
			 * 实时计算正确率字符串
			 */
			calcRate() {
				this.rateText = this.totalCount === 0 ?
					"0%" :
					`${Math.round(this.rightCount / this.totalCount * 100)}%`;
			},

			/**
			 * 生成一道新的加减法题目，重置用户答案
			 */
			createNewQuestion() {
				const limit = this.maxNum;
				let a, b, type;
				// 随机0加法/1减法
				type = Math.random() > 0.5 ? 0 : 1;
				if (type === 0) {
					// 加法：保证相加不超过上限
					a = Math.floor(Math.random() * (limit + 1));
					b = Math.floor(Math.random() * (limit - a + 1));
				} else {
					// 减法：被减数>=减数，结果非负
					a = Math.floor(Math.random() * (limit + 1));
					b = Math.floor(Math.random() * (a + 1));
				}
				// 计算标准答案
				this.rightAnswer = type ? a - b : a + b;
				// 拼接题目文本
				this.question = `${a} ${type ? '-' : '+'} ${b} = ?`;
				// 清空上次用户填写答案
				this.selectNumVal = "";
			},

			/**
			 * 数字按键输入，拼接答案字符串
			 * @param {String} numStr 点击的数字字符
			 */
			selectNum(numStr) {
				// 按钮锁定 或 答案超过4位不再输入
				if (this.isClickLock || this.selectNumVal.length >= 4) return;
				this.selectNumVal += numStr;
			},
			/**
			 * 清除输入，重置答案为空
			 */
			clearSelect() {
				this.selectNumVal = "";
			},

			/**
			 * 提交答案校验逻辑（核心提交函数）
			 */
			checkAnswer() {
				// 锁定状态或未填写答案直接拦截
				if (this.isClickLock || !this.selectNumVal) {
					!this.selectNumVal && uni.showToast({
						title: "请输入答案",
						icon: "none"
					});
					return;
				}
				this.isClickLock = true; // 锁定按钮防止重复提交
				const userAns = Number(this.selectNumVal); // 用户答案转数字

				// 统计数据自增
				this.totalCount++;
				userAns === this.rightAnswer && this.rightCount++;

				this.calcRate(); // 刷新正确率
				this.saveStatsToStorage(); // 保存统计到本地
				this.checkLevelTip(); // 校验升级弹窗条件

				if (userAns === this.rightAnswer) {
					// ========== 答对分支：全屏遮罩提示，2s自动下一题 ==========
					this.showRightTip = true;
					// 清除之前遗留定时器，避免多个定时器冲突
					if (this.rightTimer) clearTimeout(this.rightTimer);
					// 开启2秒延时
					this.rightTimer = setTimeout(() => {
						this.showRightTip = false; // 关闭提示
						this.createNewQuestion(); // 生成新题目
						this.isClickLock = false; // 解锁提交按钮
						// 延时弹出升级提示弹窗
						this.needShowTip && setTimeout(() => {
							this.showLevelTipModal();
							this.needShowTip = false;
						}, 300);
					}, 2000);
				} else {
					// ========== 答错分支：保存错题 + 弹窗提示正确答案 ==========
					this.saveErrorQuestion();
					uni.vibrateShort(); // 手机短促震动
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

	.top-icon-wrap {
		position: fixed;
		top: calc(var(--status-bar-height) + 15rpx);
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
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

	.question-box {
		background: #fff;
		border-radius: 40rpx;
		padding: 40rpx 30rpx;
		margin: 120rpx 0;
		box-shadow: 0 8rpx 20rpx rgba(255, 200, 200, 0.15);
	}

	.question-text {
		font-size: 100rpx;
		text-align: center;
		color: #5c3a21;
		font-weight: bold;
	}

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

	.clear-key {
		background: #f0f8f0 !important;
	}

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

	.submit-btn {
		flex: 2;
		background: linear-gradient(90deg, #8bd68f, #66bb6a);
	}

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

	/* 答对全屏遮罩 */
	.right-tip-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 998;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right-tip-content {
		padding: 30rpx 60rpx;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		font-size: 36rpx;
		border-radius: 20rpx;
	}
</style>