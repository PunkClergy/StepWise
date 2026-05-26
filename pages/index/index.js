/**
 * 儿童数学口算小游戏 - 业务逻辑层
 * 规则：
 * 1. 答错留在本题重答，答对才自动下一题
 * 2. 首次答错则试卷永久标记错题
 * 3. 结算页展示【第一次输入的错误答案】
 */
export default {
	// 页面数据定义：存储所有状态变量
	data() {
		return {
			level: 1, // 当前关卡等级，默认从第1关开始
			total: 0, // 已答题总数（单关最多10题）
			right: 0, // 答对题目数量统计
			wrong: 0, // 答错题目数量统计
			score: 0, // 本局得分，答对一题+10分
			answer: 0, // 当前题目正确答案
			qText: "", // 当前题目展示文本
			userAns: "", // 用户当前输入的答案
			msg: "", // 答题提示文案（正确/错误/请输入数字）
			msgType: "", // 提示样式类名：correct正确/error错误
			hasWrong: false, // 当前题是否首次答错（一旦true，试卷永久判错）
			hasCounted: false, // 当前题是否已统计题数（防止重复计数）
			firstWrongAns: "", // 本题第一次答错的答案（结算页展示用）

			showModal: false, // 结算弹窗显示控制变量
			modalTitle: "", // 结算弹窗标题
			rewardText: "", // 通关奖励图标路径
			pass: false, // 是否通关（分数≥80通关）

			// 奖励图标库：对象格式存储所有奖励图标
			rewards: [{
					id: 1, // 奖励唯一标识
					icon: 'static/images/Scoop.png' // 奖励图标路径
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

			isCountDown: false, // 是否处于答题倒计时状态
			countDownNum: 2, // 倒计时秒数，默认2秒
			timer: null, // 倒计时定时器对象

			answerPaper: [] // 整关题目答卷列表，存储每一题完整信息
		};
	},

	// 页面生命周期：页面加载时执行
	onLoad() {
		this.genQuestion(); // 加载完成立即生成第一道题目
	},

	// 页面生命周期：页面卸载时执行
	onUnload() {
		clearInterval(this.timer); // 清除定时器，防止内存泄漏
	},

	// 所有业务方法集合
	methods: {
		// 自动聚焦输入框方法：确保切换题目后可直接输入
		focusInput() {
			// 等待DOM更新完成后执行
			uni.nextTick(() => {
				// 判断输入框存在且不在倒计时中，执行聚焦
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
			let a, b, op; // 定义运算数a、b和运算符op
			const isAdd = Math.random() > 0.5; // 随机生成加减法，50%概率

			// 加法逻辑：两数之和不超过100
			if (isAdd) {
				a = Math.floor(Math.random() * 50) + 1; // 生成1-50随机数
				b = Math.floor(Math.random() * (100 - a)) + 1; // 保证a+b≤100
				op = "+"; // 赋值运算符为+
				this.answer = a + b; // 计算正确答案
			} else {
				// 减法逻辑：结果不为负数
				a = Math.floor(Math.random() * 100) + 1; // 生成1-100随机数
				b = Math.floor(Math.random() * a) + 1; // 保证b≤a，结果非负
				op = "-"; // 赋值运算符为-
				this.answer = a - b; // 计算正确答案
			}

			this.qText = `${a} ${op} ${b} = ?`; // 拼接题目展示文本
			this.userAns = ""; // 清空用户输入框
			this.msg = ""; // 清空提示文案
			this.msgType = ""; // 清空提示样式
			this.isCountDown = false; // 关闭倒计时状态
			this.countDownNum = 2; // 重置倒计时数字
			this.hasWrong = false; // 重置首次答错标记
			this.hasCounted = false; // 重置题数统计标记
			this.firstWrongAns = ""; // 重置首次错误答案
			clearInterval(this.timer); // 清除上一题定时器
			
			// 切换题目后自动聚焦输入框
			this.focusInput();
		},

		/**
		 * 校验答案、统计数据、记录答卷
		 * 核心规则：
		 * 1. 答错：留题重答；首次答错记录错误答案 + 标记错题
		 * 2. 答对：统计数据、存入答卷、开启倒计时跳题
		 */
		checkAnswer() {
			// 倒计时中禁止提交答案，防止重复操作
			if (this.isCountDown) return;

			const val = parseInt(this.userAns); // 将用户输入转为数字类型
			// 判断输入是否为有效数字
			if (isNaN(val)) {
				this.msg = "⚠️ 请输入数字"; // 提示输入数字
				this.msgType = "error"; // 设置错误样式
				return;
			}

			const isCorrect = val === this.answer; // 对比用户答案与正确答案

			// ========== 答案错误逻辑处理 ==========
			if (!isCorrect) {
				this.msg = `❌ 答案错误，请重新作答`; // 设置错误提示
				this.msgType = "error"; // 设置错误样式

				// 仅首次答错时执行：统计错题+标记+记录错误答案
				if (!this.hasWrong) {
					this.wrong++; // 答错数量+1
					this.hasWrong = true; // 标记本题已首次答错
					this.firstWrongAns = val; // 保存第一次错误答案
				}
				this.userAns = ""; // 清空用户输入框
				
				// 答错清空后自动聚焦输入框
				this.focusInput();
				return;
			}

			// ========== 答案正确逻辑处理 ==========
			this.msg = "✅ 回答正确！"; // 设置正确提示
			this.msgType = "correct"; // 设置正确样式

			// 首次提交答案才统计总题数，防止重复计数
			if (!this.hasCounted) {
				this.total++; // 总题数+1
				this.hasCounted = true; // 标记本题已统计
			}

			// 本题从未答错，才加分+统计答对题数
			if (!this.hasWrong) {
				this.right++; // 答对数量+1
				this.score += 10; // 得分+10
			}

			// 将本题信息存入答卷列表，用于结算页展示
			if (this.hasCounted) {
				this.answerPaper.push({
					question: this.qText, // 题目内容
					userFinalAnswer: val, // 用户最终答对的答案
					firstWrongAnswer: this.firstWrongAns, // 第一次错误答案
					realAnswer: this.answer, // 题目正确答案
					isRight: !this.hasWrong // 整题对错状态（首次错则判错）
				});
			}

			// 答满10题，关闭倒计时并展示结算页
			if (this.total >= 10) {
				clearInterval(this.timer); // 清除定时器
				this.showResult(); // 调用结算方法
				return;
			}

			// 答对且未答满10题，开启倒计时自动下一题
			this.startCountDown();
		},

		/**
		 * 2秒倒计时，倒计时结束自动切换下一题
		 */
		startCountDown() {
			this.isCountDown = true; // 开启倒计时状态
			this.countDownNum = 2; // 初始化倒计时秒数
			// 设置定时器，每秒执行一次
			this.timer = setInterval(() => {
				this.countDownNum--; // 倒计时数字-1
				// 倒计时结束
				if (this.countDownNum <= 0) {
					clearInterval(this.timer); // 清除定时器
					// 未答满10题则生成新题目
					if (this.total < 10) {
						this.genQuestion();
					}
				}
			}, 1000); // 间隔1000毫秒=1秒
		},

		/**
		 * 展示结算弹窗 & 完整试卷分析
		 */
		showResult() {
			this.showModal = true; // 打开结算弹窗
			this.pass = this.score >= 10; // 判断是否通关（80分改为10分测试用）
			this.modalTitle = this.pass ? "🎉 恭喜通关！" : "💪 继续加油！"; // 设置弹窗标题
			// 通关则随机获取一个奖励图标
			if (this.pass) {
				const idx = Math.floor(Math.random() * this.rewards.length); // 生成随机索引
				this.rewardText = this.rewards[idx].icon; // 赋值奖励图标路径
			}
		},

		/**
		 * 弹窗按钮事件：通关则下一关，未通关则重新挑战
		 * 重置所有数据 + 清空答卷列表
		 */
		action() {
			// 通关则关卡等级+1
			if (this.pass) {
				this.level++;
			}
			// 重置所有统计数据
			this.total = 0;
			this.right = 0;
			this.wrong = 0;
			this.score = 0;
			this.firstWrongAns = "";
			// 清空答卷列表
			this.answerPaper = [];
			this.showModal = false; // 关闭结算弹窗
			this.genQuestion(); // 重新生成第一题，开始新游戏
		}
	}
};