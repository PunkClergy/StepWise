<template>
	<view class="page">
		<!-- 单词展示区（朗读时高亮）+ 点击重读 -->
		<view class="word-card" :class="speaking ? 'speaking' : ''" @click="playAudio3Times">
			<text class="word">{{ currentWord }}</text>
		</view>

		<!-- 图片选项区 —— 一行 2 张 -->
		<view class="image-grid">
			<view class="image-item" v-for="(item, idx) in options" :key="idx" @click="checkAnswer(item)" :class="{
          wrong: item.clickWrong,
          correct: item.clickCorrect
        }">
				<image :src="item.img" class="image" mode="aspectFit"></image>
			</view>
		</view>

		<!-- 单词释义 -->
		<view class="word-meaning" v-if="currentWord">
			<text class="meaning-text">单词释义：{{ currentMeaning }}</text>
		</view>

		<!-- 答对庆祝动画 -->
		<view class="celebrate" v-if="showSuccess">
			<text class="celebrate-text">🎉 太棒啦！</text>
		</view>

		<!-- 👇 固定底部日期筛选 -->
		<view class="date-select-bottom">
			<view class="date-item">
				<picker mode="date" :value="startDate" @change="onStartDateChange">
					<view class="picker-text">{{ startDate }}</view>
				</picker>
			</view>
			-
			<view class="date-item">
				<picker mode="date" :value="endDate" @change="onEndDateChange">
					<view class="picker-text">{{ endDate }}</view>
				</picker>
			</view>
			<view @click="filterByDate" class="filter-btn">筛选</view>
			<view @click="resetAll" class="reset-btn">重置</view>
		</view>
	</view>
</template>

<script>
	import {
		wordList
	} from "@/utils/EN.js";
	export default {
		data() {
			return {
				wordList: wordList,
				filteredList: [],
				currentWord: "",
				currentMeaning: "",
				currentAudio: "",
				options: [],
				speaking: false,
				showSuccess: false,
				startDate: "", // 本周一（自动计算）
				endDate: "", // 今天（自动计算）
			};
		},
		onLoad() {
			// 初始化默认日期
			this.setDefaultDates();
			
			this.filteredList = [...this.wordList];
			this.nextWord();
		},
		methods: {
			// 格式化日期为 YYYY-MM-DD
			formatDate(date) {
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},

			// 获取本周一日期
			getMondayDate() {
				const now = new Date();
				const day = now.getDay(); // 0=周日，1=周一，2=周二...
				const diff = day === 0 ? -6 : 1 - day;
				const monday = new Date(now.setDate(now.getDate() + diff));
				return this.formatDate(monday);
			},

			// 获取今天日期
			getTodayDate() {
				return this.formatDate(new Date());
			},

			// 设置默认日期：开始=本周一，结束=今天
			setDefaultDates() {
				this.startDate = this.getMondayDate();
				this.endDate = this.getTodayDate();
			},

			onStartDateChange(e) {
				this.startDate = e.detail.value;
			},
			onEndDateChange(e) {
				this.endDate = e.detail.value;
			},
			// 筛选日期单词
			filterByDate() {
				this.filteredList = this.wordList.filter(item => {
					return item.date >= this.startDate && item.date <= this.endDate;
				});
				uni.showToast({
					title: `找到 ${this.filteredList.length} 个单词`,
					icon: "none"
				});
				setTimeout(() => {
					this.nextWord();
				}, 500);
			},
			// 重置 + 确认框
			resetAll() {
				uni.showModal({
					title: "确认重置",
					content: "确定要显示所有单词吗？",
					success: (res) => {
						if (res.confirm) {
							// 重置恢复默认日期：本周一 — 今天
							this.setDefaultDates();
							
							this.filteredList = [...this.wordList];
							setTimeout(() => {
								this.nextWord();
							}, 500);
						}
					}
				});
			},

			playSound(src) {
				const audio = uni.createInnerAudioContext();
				audio.src = src;
				audio.play();
				setTimeout(() => {
					audio.destroy();
				}, 2000);
			},

			nextWord() {
				this.showSuccess = false;
				if (this.options.length) {
					this.options.forEach(it => {
						it.clickWrong = false;
						it.clickCorrect = false;
					});
				}

				if (this.filteredList.length === 0) {
					uni.showToast({
						title: "该日期无单词",
						icon: "none"
					});
					return;
				}

				let rand = Math.floor(Math.random() * this.filteredList.length);
				let curr = this.filteredList[rand];
				this.currentWord = curr.word;
				this.currentMeaning = curr.meaning;
				this.currentAudio = curr.audio;

				this.genOptions(curr);
				setTimeout(() => this.playAudio3Times(), 300);
			},

			genOptions(curr) {
				let all = [...this.filteredList];
				let right = {
					word: curr.word,
					img: curr.img,
					correct: true
				};
				let wrongArr = all
					.filter(item => item.word !== curr.word)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map(item => ({
						word: item.word,
						img: item.img,
						correct: false
					}));
				this.options = [right, ...wrongArr].sort(() => Math.random() - 0.5);
			},

			playAudio3Times() {
				if (this.speaking) return;
				let count = 0;
				const play = () => {
					this.speaking = true;
					const audio = uni.createInnerAudioContext();
					audio.src = this.currentAudio;
					audio.play();
					audio.onEnded(() => {
						count++;
						this.speaking = false;
						if (count < 3) {
							setTimeout(play, 700);
						}
					});
				};
				play();
			},

			checkAnswer(item) {
				if (this.showSuccess) return;
				if (item.correct) {
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3");
					item.clickCorrect = true;
					this.showSuccess = true;
					setTimeout(() => this.nextWord(), 1500);
				} else {
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3");
					item.clickWrong = true;
					uni.vibrateShort();
				}
			},
		},
	};
</script>

<style scoped>
	.page {
		padding: 30rpx;
		padding-bottom: 120rpx;
		background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
		min-height: 100vh;
		box-sizing: border-box;
		position: relative;
	}

	/* 固定底部 */
	.date-select-bottom {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #ffffff;
		padding: 24rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		box-shadow: 0 -3rpx 15rpx rgba(0,0,0,0.08);
		z-index: 10;
	}
	.date-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 28rpx;
		color: #555;
	}
	.picker-text {
		padding: 12rpx 18rpx;
		background: #f7f7f7;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		border: 1rpx solid #eee;
	}
	
	/* 按钮大幅放大 */
	.filter-btn {
		padding:10rpx 15rpx;
		font-size: 28rpx;
		background: #ff6a8e;
		border-radius: 12rpx;
		color: #fff;
		border: none;
	}
	.reset-btn {
		padding: 10rpx 15rpx;
		font-size: 28rpx;
		background: #888;
		border-radius: 12rpx;
		color: #fff;
		border: none;
	}

	.word-card {
		background: #fff;
		border-radius: 40rpx;
		padding: 50rpx 30rpx;
		text-align: center;
		margin: 40rpx 30rpx 60rpx;
		box-shadow: 0 10rpx 30rpx rgba(255, 140, 180, 0.15);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.word {
		font-size: 72rpx;
		font-weight: bold;
		color: #ff6a8e;
	}

	.speaking {
		transform: scale(1.08);
		box-shadow: 0 12rpx 36rpx rgba(255, 110, 150, 0.25);
		background: #fff9fc;
	}

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
	}

	.image {
		width: 100%;
		height: 100%;
	}

	.image-item:active {
		transform: scale(0.92);
	}

	.wrong {
		border: 6rpx solid #ff4d6d;
		background: #ffe1e1;
	}

	.correct {
		border: 6rpx solid #24d386;
		background: #e1ffeb;
	}

	.celebrate {
		position: fixed;
		top: 42vh;
		left: 0;
		right: 0;
		text-align: center;
		z-index: 99;
		animation: zoom 0.6s ease-in-out;
	}

	.celebrate-text {
		font-size: 66rpx;
		color: #ff4499;
		font-weight: bold;
		text-shadow: 0 4rpx 10rpx rgba(255, 60, 120, 0.3);
	}

	.word-meaning {
		margin-top: 40rpx;
		text-align: center;
	}

	.meaning-text {
		font-size: 34rpx;
		color: #555;
		font-weight: 500;
	}

	@keyframes zoom {
		0% {
			transform: scale(0.4);
			opacity: 0;
		}
		60% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>