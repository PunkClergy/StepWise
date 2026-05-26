/**
 * 儿童数学口算小游戏 - 业务逻辑层
 * 规则：
 * 1. 答错留在本题重答，答对才自动下一题
 * 2. 首次答错则试卷永久标记错题
 * 3. 结算页展示【第一次输入的错误答案】
 */
export default {
	// 页面数据定义
	data() {
		return {
			level: 1, // 当前关卡等级
			total: 0, // 已答题总数（单关最多10题）
			right: 0, // 答对题目数
			wrong: 0, // 答错题目数
			score: 0, // 本局得分，答对一题+10分
			answer: 0, // 当前题正确答案
			qText: "", // 当前题题目文本
			userAns: "", // 用户当前输入答案
			msg: "", // 答题提示文案
			msgType: "", // 提示样式类名：correct/error
			hasWrong: false, // 当前题是否首次答错（一旦为true，试卷永久判错）
			hasCounted: false, // 当前题是否已统计题数（防止重复计数）
			firstWrongAns: "", // 【新增】本题第一次答错的答案

			showModal: false, // 结算弹窗显示控制
			modalTitle: "", // 弹窗标题
			rewardText: "", // 通关奖励图标
			pass: false, // 是否通关（分数≥80通关）

			// 已修改为对象格式奖励库
			rewards: [{
					id: 1,
					icon: 'static/images/Scoop.png'
				},
				{
					id: 2,
					icon: 'static/images/Tablet.png'
				},
				{
					id: 3,
					icon: 'static/images/Phone.png'
				},
				{
					id: 4,
					icon: 'static/images/Candy.png'
				},
				{
					id: 5,
					icon: 'static/images/Quest.png'
				},
				{
					id: 6,
					icon: 'static/images/Toy.png'
				},
				{
					id: 7,
					icon: 'static/images/Fruit.png'
				}
			],

			isCountDown: false, // 是否处于答题倒计时
			countDownNum: 2, // 倒计时秒数
			timer: null, // 倒计时定时器

			answerPaper: [] // 整关题目答卷列表，存储每一题完整信息
		};
	},

	// 页面加载
	onLoad() {
		this.genQuestion();
	},

	// 页面卸载，清除定时器防内存泄漏
	onUnload() {
		clearInterval(this.timer);
	},

	methods: {
		// 自动聚焦输入框（核心新增）
		focusInput() {
			uni.nextTick(() => {
				if (this.$refs.inputBox && !this.isCountDown) {
					this.$refs.inputBox.focus();
				}
			});
		},
		
		/**
		 * 生成随机加减法题目
		 * 规则：加法和不超100，减法结果不为负数
		 */
		genQuestion() {
			let a, b, op;
			const isAdd = Math.random() > 0.5;

			if (isAdd) {
				a = Math.floor(Math.random() * 50) + 1;
				b = Math.floor(Math.random() * (100 - a)) + 1;
				op = "+";
				this.answer = a + b;
			} else {
				a = Math.floor(Math.random() * 100) + 1;
				b = Math.floor(Math.random() * a) + 1;
				op = "-";
				this.answer = a - b;
			}

			this.qText = `${a} ${op} ${b} = ?`;
			this.userAns = "";
			this.msg = "";
			this.msgType = "";
			this.isCountDown = false;
			this.countDownNum = 2;
			this.hasWrong = false;
			this.hasCounted = false;
			this.firstWrongAns = ""; // 重置首次错误答案
			clearInterval(this.timer);
			
			// 切换题目后自动聚焦
			this.focusInput();
		},

		/**
		 * 校验答案、统计数据、记录答卷
		 * 核心规则：
		 * 1. 答错：留题重答；首次答错记录错误答案 + 标记错题
		 * 2. 答对：统计数据、存入答卷、开启倒计时跳题
		 */
		checkAnswer() {
			// 倒计时中禁止提交
			if (this.isCountDown) return;

			const val = parseInt(this.userAns);
			// 非数字输入提示
			if (isNaN(val)) {
				this.msg = "⚠️ 请输入数字";
				this.msgType = "error";
				return;
			}

			const isCorrect = val === this.answer;

			// ========== 答案错误逻辑 ==========
			if (!isCorrect) {
				this.msg = `❌ 答案错误，请重新作答`;
				this.msgType = "error";

				// 仅首次答错时：统计错题 + 标记状态 + 记录第一次错误答案
				if (!this.hasWrong) {
					this.wrong++;
					this.hasWrong = true;
					this.firstWrongAns = val;
				}
				this.userAns = "";
				
				// 答错清空后自动聚焦
				this.focusInput();
				return;
			}

			// ========== 答案正确逻辑 ==========
			this.msg = "✅ 回答正确！";
			this.msgType = "correct";

			// 首次提交才统计总题数
			if (!this.hasCounted) {
				this.total++;
				this.hasCounted = true;
			}

			// 本题从未答错，才加分、统计对题
			if (!this.hasWrong) {
				this.right++;
				this.score += 10;
			}

			// 存入答卷：携带首次错误答案、最终对错状态
			if (this.hasCounted) {
				this.answerPaper.push({
					question: this.qText,
					userFinalAnswer: val, // 最终答对的答案
					firstWrongAnswer: this.firstWrongAns, // 第一次错误答案
					realAnswer: this.answer,
					isRight: !this.hasWrong // 首次答错则整题判错
				});
			}

			// 答满10题，弹出结算页
			if (this.total >= 10) {
				clearInterval(this.timer);
				this.showResult();
				return;
			}

			// 答对才开启倒计时，自动切换下一题
			this.startCountDown();
		},

		/**
		 * 3秒倒计时，自动切换下一题
		 */
		startCountDown() {
			this.isCountDown = true;
			this.countDownNum = 2;
			this.timer = setInterval(() => {
				this.countDownNum--;
				if (this.countDownNum <= 0) {
					clearInterval(this.timer);
					if (this.total < 10) {
						this.genQuestion();
					}
				}
			}, 1000);
		},

		/**
		 * 展示结算弹窗 & 完整试卷分析
		 */
		showResult() {
			this.showModal = true;
			this.pass = this.score >= 10;
			this.modalTitle = this.pass ? "🎉 恭喜通关！" : "💪 继续加油！";
			if (this.pass) {
				const idx = Math.floor(Math.random() * this.rewards.length);
				// 随机获取奖励图片路径
				this.rewardText = this.rewards[idx].icon;
			}
		},

		/**
		 * 弹窗按钮事件：下一关 / 重新挑战
		 * 重置所有数据 + 清空答卷列表
		 */
		action() {
			if (this.pass) {
				this.level++;
			}
			// 重置全局统计
			this.total = 0;
			this.right = 0;
			this.wrong = 0;
			this.score = 0;
			this.firstWrongAns = "";
			// 清空答卷
			this.answerPaper = [];
			this.showModal = false;
			this.genQuestion();
		}
	}
};