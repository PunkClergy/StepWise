<template>
	<view class="page" :class="{ global_disable: speaking }">
		<!-- 全局遮罩 -->
		<view v-if="speaking" class="global_mask"></view>

		<!-- 顶部 返回首页：单独恢复点击 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" :class="{ btn_enable: speaking }" @click="goHome">
				<text>🏠</text>
			</view>
		</view>

		<!-- 单词朗读区：高亮、层级置顶 -->
		<view class="word-card" :class="speaking ? 'speaking' : ''" @click="playAudio3Times">
			<text class="word">{{ currentWord }}</text>
		</view>

		<!-- 图片选项 -->
		<view class="image-grid">
			<view class="image-item" v-for="(item, idx) in options" :key="idx" @click="checkAnswer(item)" :class="[
					item.clickWrong && 'wrong',
					item.clickCorrect && 'correct',
					speaking && 'disabled-option'
				]">
				<image :src="item.img" class="image" mode="aspectFit"></image>
				<view v-if="speaking" class="disable-mask"></view>
			</view>
		</view>

		<!-- 灯泡释义 -->
		<view class="hint-bulb-wrap" :class="{ bulbActive: bulbActive }" v-if="currentWord" @click="showAndSpeakMean">
			<text class="bulb-icon">💡</text>
			<text v-show="showMeanText" class="meaning-desc">
				释义：{{ currentMeaning }}
			</text>
		</view>

		<!-- 撒花 -->
		<view class="full-celebrate" v-if="showSuccess">
			<text class="celebrate-text">🎉 太棒啦！</text>
		</view>

		<!-- 底部 -->
		<view class="error-book-bottom" @click="goTestPage">
			<text>📝 去测试</text>
		</view>

		<!-- 弹窗 -->
		<view class="cartoon-modal" v-if="showConfirmTest">
			<view class="modal-mask"></view>
			<view class="modal-box">
				<text class="modal-emoji">🤔</text>
				<text class="modal-title">要去挑战测试吗？</text>
				<text class="modal-desc">看看你是不是真的记住啦～</text>
				<view class="modal-btns">
					<view class="btn-cancel" @click="showConfirmTest = false">
						<text>😜 再玩会儿</text>
					</view>
					<view class="btn-confirm" @click="confirmGoTest">
						<text>🚀 去测试</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { wordList } from "@/utils/EN.js";
	export default {
		data() {
			return {
				wordList,
				filteredList: [],
				currentWord: "",
				currentMeaning: "",
				currentAudio: "",
				options: [],
				speaking: false,
				showSuccess: false,
				voiceAudio: null,
				meanAudio: null,
				showMeanText: false,
				hideTimer: null,
				bulbActive: false,
				showConfirmTest: false
			};
		},
		onLoad() {
			this.filteredList = [...this.wordList];
			this.nextWord();
		},
		onHide() {
			this.stopAllAudio();
		},
		onUnload() {
			this.stopAllAudio();
		},
		methods: {
			goHome() {
				uni.redirectTo({ url: "/pages/index/index" });
			},
			goTestPage() {
				this.showConfirmTest = true;
			},
			confirmGoTest() {
				this.showConfirmTest = false;
				uni.navigateTo({ url: "/pages/sub-english/kidsEnglishPaper" });
			},
			goErrorBook() {
				uni.navigateTo({ url: "/pages/sub-english/errorBook" });
			},
			stopAllAudio() {
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
				this.showMeanText = false;
				this.bulbActive = false;
			},
			playSound(src) {
				const audio = uni.createInnerAudioContext();
				audio.src = src;
				audio.play();
				audio.onEnded(() => audio.destroy());
				audio.onError(() => audio.destroy());
			},
			playAudio3Times() {
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
			showAndSpeakMean() {
				this.bulbActive = true;
				if (this.voiceAudio) {
					this.voiceAudio.stop();
					this.voiceAudio.destroy();
					this.voiceAudio = null;
				}
				this.speaking = false;
				if (this.hideTimer) clearTimeout(this.hideTimer);
				this.showMeanText = true;
				this.speakChineseMeaning();
			},
			speakChineseMeaning() {
				if (!this.currentMeaning) return;
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
				this.meanAudio.onEnded(() => {
					this.meanAudio.destroy();
					this.meanAudio = null;
					this.hideTimer = setTimeout(() => {
						this.showMeanText = false;
						this.bulbActive = false;
					}, 1500);
				});
			},
			nextWord() {
				this.stopAllAudio();
				this.showSuccess = false;
				if (this.filteredList.length === 0) {
					uni.showToast({ title: "暂无单词", icon: "none" });
					return;
				}
				const rand = Math.floor(Math.random() * this.filteredList.length);
				const curr = this.filteredList[rand];
				this.currentWord = curr.word;
				this.currentMeaning = curr.meaning;
				this.currentAudio = curr.audio;
				this.genOptions(curr);
				setTimeout(() => this.playAudio3Times(), 300);
			},
			genOptions(curr) {
				const wrong = this.filteredList
					.filter(i => i.word !== curr.word)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map(i => ({
						word: i.word,
						img: i.img,
						correct: false,
						clickWrong: false,
						clickCorrect: false
					}));
				this.options = [{
						word: curr.word,
						img: curr.img,
						correct: true,
						clickWrong: false,
						clickCorrect: false
					}, ...wrong]
					.sort(() => Math.random() - 0.5);
			},
			checkAnswer(item) {
				if (this.speaking) return;
				if (this.showSuccess) return;
				if (item.correct) {
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3");
					item.clickCorrect = true;
					this.showSuccess = true;
					setTimeout(() => this.nextWord(), 2000);
				} else {
					item.clickWrong = true;
					uni.vibrateShort();
					this.playSound("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3");
				}
			}
		}
	};
</script>

<style scoped>
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
		box-shadow: 0 3rpx 9rpx rgba(86, 160, 113, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}
	.icon-btn:active {
		transform: scale(0.95);
	}
	/* 朗读时首页按钮恢复点击 */
	.btn_enable {
		pointer-events: auto !important;
	}

	.page {
		position: relative;
		padding: 30rpx;
		padding-top: 120rpx;
		padding-bottom: 140rpx;
		background: linear-gradient(to bottom, #f5f9f4, #edf4f2);
		min-height: 100vh;
		box-sizing: border-box;
	}
	/* 全局禁用 */
	.global_disable {
		pointer-events: none;
	}
	/* 全局遮罩 */
	.global_mask {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(255,255,255,0.35);
		z-index: 998;
	}

	/* 单词卡片 置顶+可点击+高亮 */
	.word-card {
		background: #fff;
		border-radius: 40rpx;
		padding: 50rpx 30rpx;
		text-align: center;
		margin: 60rpx 30rpx;
		box-shadow: 0 10rpx 30rpx rgba(86, 160, 113, 0.12);
		transition: all 0.3s ease;
		position: relative;
		z-index: 999;
		pointer-events: auto;
	}
	.word {
		font-size: 72rpx;
		font-weight: bold;
		color: #3a6b54;
	}
	/* 朗读高亮样式 */
	.speaking {
		transform: scale(1.08);
		box-shadow: 0 12rpx 40rpx rgba(86, 160, 113, 0.35);
		background: #f0f9f5;
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 20rpx;
	}
	.image-item {
		position: relative;
		width: 48%;
		height: 340rpx;
		background: #fff;
		border-radius: 36rpx;
		padding: 20rpx;
		box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.08);
		box-sizing: border-box;
		transition: all 0.25s ease;
	}
	.image {
		width: 100%;
		height: 100%;
	}
	.disabled-option {
		opacity: 0.45;
		transform: scale(0.97);
	}
	.disable-mask {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 36rpx;
	}
	.wrong {
		border: 6rpx solid #e57373;
		background: #fef0f0;
	}
	.correct {
		border: 6rpx solid #66bb6a;
		background: #edf7ee;
	}

	.full-celebrate {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.7);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.celebrate-text {
		font-size: 80rpx;
		color: #56a071;
		font-weight: bold;
	}

	.hint-bulb-wrap {
		margin: 40rpx 30rpx 0;
		padding: 30rpx;
		background: #f8faf0;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
	}
	.bulbActive {
		transform: scale(1.06);
	}
	.bulb-icon {
		font-size: 64rpx;
		animation: bulbFlash 1s infinite alternate;
	}
	.meaning-desc {
		font-size: 34rpx;
		color: #798b4e;
	}

	.error-book-bottom {
		position: fixed;
		left: 30rpx;
		right: 30rpx;
		bottom: 30rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background: linear-gradient(135deg, #69b385, #4f9466);
		color: #fff;
		font-size: 32rpx;
		border-radius: 44rpx;
	}

	.cartoon-modal {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.modal-mask {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
	}
	.modal-box {
		position: relative;
		width: 600rpx;
		background: linear-gradient(#f5f9f4, #ffffff);
		border-radius: 48rpx;
		padding: 50rpx 40rpx;
		box-shadow: 0 20rpx 60rpx rgba(86, 160, 113, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: popIn 0.25s ease;
	}
	@keyframes popIn {
		from { transform: scale(0.85); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
	.modal-emoji {
		font-size: 80rpx;
		margin-bottom: 20rpx;
	}
	.modal-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #3a6b54;
		margin-bottom: 12rpx;
	}
	.modal-desc {
		font-size: 28rpx;
		color: #607069;
		margin-bottom: 40rpx;
	}
	.modal-btns {
		display: flex;
		gap: 30rpx;
	}
	.btn-cancel,
	.btn-confirm {
		padding: 22rpx 36rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
	}
	.btn-cancel {
		background: #edf4f2;
		color: #55635d;
	}
	.btn-confirm {
		background: linear-gradient(135deg, #87b99c, #56a071);
		color: #fff;
		box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.25);
	}
	@keyframes bulbFlash {
		from { opacity: 0.8; }
		to { opacity: 1; }
	}
</style>