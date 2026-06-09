<template>
	<view class="page">
		<!-- 顶部 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
		</view>

		<!-- 单词朗读区 -->
		<view
			class="word-card"
			:class="speaking ? 'speaking' : ''"
			@click="playAudio3Times"
		>
			<text class="word">{{ currentWord }}</text>
		</view>

		<!-- 图片选项（一行 2 张） -->
		<view class="image-grid">
			<view
				class="image-item"
				v-for="(item, idx) in options"
				:key="idx"
				@click="checkAnswer(item)"
				:class="[
					item.clickWrong && 'wrong',
					item.clickCorrect && 'correct',
					speaking && 'disabled-option'
				]"
			>
				<image :src="item.img" class="image" mode="aspectFit"></image>
				<view v-if="speaking" class="disable-mask"></view>
			</view>
		</view>

		<!-- 灯泡释义 -->
		<view
			class="hint-bulb-wrap"
			:class="{ bulbActive: bulbActive }"
			v-if="currentWord"
			@click="showAndSpeakMean"
		>
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

		<!-- ✅ 卡通二次确认框 -->
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
			showConfirmTest: false // ✅ 控制确认框
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
		/* ===== 页面跳转 ===== */
		goHome() {
			uni.redirectTo({ url: "/pages/index/index" });
		},

		// ✅ 不直接跳，先弹确认框
		goTestPage() {
			this.showConfirmTest = true;
		},

		// ✅ 真正跳转
		confirmGoTest() {
			this.showConfirmTest = false;
			uni.navigateTo({
				url: "/pages/sub-english/kidsEnglishPaper"
			});
		},

		goErrorBook() {
			uni.navigateTo({ url: "/pages/sub-english/errorBook" });
		},

		/* ===== 停止所有音频 ===== */
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

		/* ===== 音效 ===== */
		playSound(src) {
			const audio = uni.createInnerAudioContext();
			audio.src = src;
			audio.play();
			audio.onEnded(() => audio.destroy());
			audio.onError(() => audio.destroy());
		},

		/* ===== 单词朗读 ===== */
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

		/* ===== 点击释义 ===== */
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
			const ttsUrl =
				`https://fanyi.baidu.com/gettts?text=${text}&lan=zh&spd=4&source=web`;

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

		/* ===== 单词切换 ===== */
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

			this.options = [
				{
					word: curr.word,
					img: curr.img,
					correct: true,
					clickWrong: false,
					clickCorrect: false
				},
				...wrong
			].sort(() => Math.random() - 0.5);
		},

		/* ===== 答题 ===== */
		checkAnswer(item) {
			if (this.speaking) return;
			if (this.showSuccess) return;

			if (item.correct) {
				this.playSound(
					"https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
				);
				item.clickCorrect = true;
				this.showSuccess = true;
				setTimeout(() => this.nextWord(), 2000);
			} else {
				item.clickWrong = true;
				uni.vibrateShort();
				this.playSound(
					"https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3"
				);
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
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
}

.page {
	padding: 30rpx;
	padding-top: 120rpx;
	padding-bottom: 140rpx;
	background: linear-gradient(to bottom, #fff5f7, #f0f9ff);
	min-height: 100vh;
	box-sizing: border-box;
}

.word-card {
	background: #fff;
	border-radius: 40rpx;
	padding: 50rpx 30rpx;
	text-align: center;
	margin: 60rpx 30rpx;
	box-shadow: 0 10rpx 30rpx rgba(255, 140, 180, 0.15);
	transition: all 0.3s ease;
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
	position: relative;
	width: 48%;
	height: 340rpx;
	background: #fff;
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

.disabled-option {
	opacity: 0.45;
	transform: scale(0.97);
	pointer-events: none;
}

.disable-mask {
	position: absolute;
	inset: 0;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 36rpx;
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
	inset: 0;
	background: rgba(255, 255, 255, 0.7);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.celebrate-text {
	font-size: 80rpx;
	color: #ff4499;
	font-weight: bold;
}

.hint-bulb-wrap {
	margin: 40rpx 30rpx 0;
	padding: 30rpx;
	background: #fffbe6;
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
	color: #d48806;
}

.error-book-bottom {
	position: fixed;
	left: 30rpx;
	right: 30rpx;
	bottom: 30rpx;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	background: #ff6a8e;
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
}

/* ✅ 卡通确认框 */
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
	background: linear-gradient(#fff7f9, #fff);
	border-radius: 48rpx;
	padding: 50rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(255, 120, 160, 0.25);
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
	color: #ff6a8e;
	margin-bottom: 12rpx;
}

.modal-desc {
	font-size: 28rpx;
	color: #888;
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
	background: #f2f2f2;
	color: #666;
}

.btn-confirm {
	background: linear-gradient(135deg, #ff6a8e, #ff8fb3);
	color: #fff;
	box-shadow: 0 8rpx 20rpx rgba(255, 110, 150, 0.3);
}
</style>