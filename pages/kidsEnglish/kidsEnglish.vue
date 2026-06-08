<template>
	<view class="page">
		<!-- 顶部：返回首页 + 错题本 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
			<!-- <view class="icon-btn right-icon" @click="toErrorPage">
				<text>📖</text>
			</view> -->
		</view>

		<!-- 单词展示区（朗读时高亮）+ 点击重读【点击这里会让灯泡卡片缩回】 -->
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

		<!-- 独立灯泡提示卡片：点击放大，播放结束/点上方单词才缩回 -->
		<view class="hint-bulb-wrap" :class="{bulbActive: bulbActive}" v-if="currentWord" @click="showAndSpeakMean">
			<text class="bulb-icon">💡</text>
			<text v-show="showMeanText" class="meaning-desc">释义：{{ currentMeaning }}</text>
		</view>

		<!-- ✅ 全屏撒花弹窗 答对全屏覆盖 -->
		<view class="full-celebrate" v-if="showSuccess">
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
				startDate: "",
				endDate: "",
				voiceAudio: null,
				meanAudio: null,
				showMeanText: false,
				hideTimer: null,
				bulbActive: false
			};
		},
		onLoad() {
			this.setDefaultDates();
			this.filteredList = [...this.wordList];
			this.nextWord();
		},
		onUnload() {
			if (this.hideTimer) clearTimeout(this.hideTimer);
			if (this.voiceAudio) {
				this.voiceAudio.stop();
				this.voiceAudio.destroy();
				this.voiceAudio = null;
			}
			if (this.meanAudio) {
				this.meanAudio.stop();
				this.meanAudio.destroy();
				this.meanAudio = null;
			}
		},
		methods: {
			// 返回首页
			goHome() {
				uni.redirectTo({
					url: "/pages/index/index"
				});
			},
			// 跳转到错题本
			toErrorPage() {
				uni.navigateTo({
					url: "/pages/history/history"
				});
			},

			formatDate(date) {
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			getMondayDate() {
				const now = new Date();
				const day = now.getDay();
				const diff = day === 0 ? -6 : 1 - day;
				const monday = new Date(now.getTime());
				monday.setDate(now.getDate() + diff);
				return this.formatDate(monday);
			},
			getTodayDate() {
				return this.formatDate(new Date());
			},
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
			filterByDate() {
				const start = new Date(this.startDate);
				const end = new Date(this.endDate);
				this.filteredList = this.wordList.filter(item => {
					const itemDay = new Date(item.date);
					return itemDay >= start && itemDay <= end;
				});
				uni.showToast({
					title: `找到 ${this.filteredList.length} 个单词`,
					icon: "none"
				});
				setTimeout(() => {
					this.nextWord();
				}, 500);
			},
			resetAll() {
				uni.showModal({
					title: "确认重置",
					content: "确定要显示所有单词吗？",
					success: (res) => {
						if (res.confirm) {
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
				audio.onEnded(() => {
					audio.destroy();
				});
				audio.onError(() => {
					audio.destroy();
				});
			},
			// 点击灯泡：卡片放大，不再自动收缩
			showAndSpeakMean() {
				this.bulbActive = true;
				if (this.hideTimer) clearTimeout(this.hideTimer);
				this.showMeanText = true;
				this.speakChineseMeaning();
			},
			// 中文释义朗读
			speakChineseMeaning() {
				if (!this.currentMeaning) return;
				if (this.voiceAudio) {
					this.voiceAudio.stop();
					this.voiceAudio.destroy();
					this.voiceAudio = null;
				}
				this.speaking = false;
				if (this.meanAudio) {
					this.meanAudio.stop();
					this.meanAudio.destroy();
					this.meanAudio = null;
				}
				const text = encodeURIComponent(this.currentMeaning);
				const ttsUrl = `https://fanyi.baidu.com/gettts?text=${text}&lan=zh&spd=4&source=web`;
				this.meanAudio = uni.createInnerAudioContext();
				this.meanAudio.src = ttsUrl;
				this.meanAudio.play();
				// 语音播放完毕1.5s隐藏文字 + 灯泡卡片缩小复位
				this.meanAudio.onEnded(() => {
					this.meanAudio.destroy();
					this.meanAudio = null;
					this.hideTimer = setTimeout(() => {
						this.showMeanText = false;
						this.bulbActive = false; // 朗读结束自动缩回卡片
					}, 1500);
				});
				this.meanAudio.onError(() => {
					this.meanAudio.destroy();
					this.meanAudio = null;
					this.hideTimer = setTimeout(() => {
						this.showMeanText = false;
						this.bulbActive = false;
					}, 1500);
				});
			},
			// 点击上方英文单词：停止中文、灯泡卡片立刻缩小
			playAudio3Times() {
				// 点击单词区域，灯泡卡片缩回
				this.bulbActive = false;
				if (this.hideTimer) clearTimeout(this.hideTimer);
				this.showMeanText = false;

				if (this.meanAudio) {
					this.meanAudio.stop();
					this.meanAudio.destroy();
					this.meanAudio = null;
				}
				if (this.speaking || !this.currentAudio) return;
				let count = 0;
				this.speaking = true;
				const play = () => {
					if (this.voiceAudio) this.voiceAudio.destroy();
					this.voiceAudio = uni.createInnerAudioContext();
					this.voiceAudio.src = this.currentAudio;
					this.voiceAudio.play();
					this.voiceAudio.onEnded(() => {
						count++;
						if (count >= 3) {
							this.speaking = false;
							this.voiceAudio.destroy();
							this.voiceAudio = null;
							return;
						}
						setTimeout(play, 400);
					});
					this.voiceAudio.onError(() => {
						this.speaking = false;
						this.voiceAudio.destroy();
						this.voiceAudio = null;
					});
				};
				play();
			},
			nextWord() {
				if (this.hideTimer) clearTimeout(this.hideTimer);
				if (this.voiceAudio) {
					this.voiceAudio.stop();
					this.voiceAudio.destroy();
					this.voiceAudio = null;
				}
				if (this.meanAudio) {
					this.meanAudio.stop();
					this.meanAudio.destroy();
					this.meanAudio = null;
				}
				this.speaking = false;
				this.showSuccess = false;
				this.showMeanText = false;
				this.bulbActive = false;
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
				let filterWrong = all.filter(item => item.word !== curr.word);
				let takeNum = Math.min(3, filterWrong.length);
				let wrongArr = filterWrong
					.sort(() => Math.random() - 0.5)
					.slice(0, takeNum)
					.map(item => ({
						word: item.word,
						img: item.img,
						correct: false
					}));
				this.options = [right, ...wrongArr].sort(() => Math.random() - 0.5);
			},
			checkAnswer(item) {
				if (this.showSuccess) return;
				if (item.correct) {
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3");
					item.clickCorrect = true;
					this.showSuccess = true;
					setTimeout(() => this.nextWord(), 2000);
				} else {
					item.clickWrong = true;
					uni.vibrateShort();
					if (this.voiceAudio) {
						this.voiceAudio.stop();
						this.voiceAudio.destroy();
						this.voiceAudio = null;
					}
					this.speaking = false;
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3");
				}
			},
		},
	};
</script>

<style scoped>
	/* 顶部图标栏（和数学页保持一致） */
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

	.page {
		padding: 30rpx;
		padding-bottom: 120rpx;
		padding-top: 120rpx;
		background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
		min-height: 100vh;
		box-sizing: border-box;
		position: relative;
	}

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
		box-shadow: 0 -3rpx 15rpx rgba(0, 0, 0, 0.08);
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

	.filter-btn {
		padding: 10rpx 15rpx;
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
		margin: 60rpx 30rpx 60rpx;
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

	.full-celebrate {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(255, 255, 255, 0.7);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fullZoom 0.6s ease-in-out;
	}

	.celebrate-text {
		font-size: 80rpx;
		color: #ff4499;
		font-weight: bold;
		text-shadow: 0 4rpx 10rpx rgba(255, 60, 120, 0.3);
	}

	/* 灯泡卡片 */
	.hint-bulb-wrap {
		margin: 40rpx 30rpx 0;
		padding: 30rpx;
		background: #fffbe6;
		border-radius: 32rpx;
		text-align: center;
		cursor: pointer;
		box-shadow: 0 6rpx 20rpx rgba(255, 200, 50, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		flex-wrap: wrap;
		transition: all 0.3s ease;
	}

	/* 点击放大，无自动回弹 */
	.bulbActive {
		transform: scale(1.06);
		box-shadow: 0 10rpx 30rpx rgba(255, 200, 50, 0.25);
	}

	.bulb-icon {
		font-size: 64rpx;
		animation: bulbFlash 1s infinite alternate;
	}

	.meaning-desc {
		font-size: 34rpx;
		color: #d48806;
		font-weight: 500;
	}

	@keyframes bulbFlash {
		0% {
			opacity: 0.55;
			transform: scale(0.95);
		}

		100% {
			opacity: 1;
			transform: scale(1.08);
		}
	}

	@keyframes fullZoom {
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