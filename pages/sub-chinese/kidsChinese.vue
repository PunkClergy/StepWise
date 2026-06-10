<template>
	<view class="char-page">
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
		</view>

		<view class="char-card">
			<view class="char-main">{{ currentChar }}</view>
			<view class="char-pinyin">{{ currentPinyin }}</view>
			<view class="char-info">
				<text class="info-item">笔画：{{ charStroke }}</text>
				<text class="info-item">部首：{{ charRadical }}</text>
			</view>
			<view class="char-desc">
				<text class="desc-title">字义解析</text>
				<text class="desc-content">{{ charExplain }}</text>
			</view>
		</view>

		<!-- 功能按钮组：重新朗读 3 : 下一字 7，增加禁用状态 -->
		<view class="btn-group">
			<button class="btn read-btn" @click="reRead" :disabled="isReading">🔊</button>
			<button class="btn next-btn" @click="nextChar" :disabled="charIndex >= charList.length - 1 || isReading">➡️
				下一字</button>
		</view>

		<!-- 底部固定 去测试按钮，增加禁用状态 -->
		<view class="error-book-bottom" @click="goTestPage" :class="{ 'btn-disabled': isReading }"
			:style="{pointerEvents: isReading ? 'none' : 'auto'}">
			<text>📝 去测试</text>
		</view>
	</view>
</template>

<script>
	import {
		charList
	} from "@/utils/CN.js";
	export default {
		data() {
			return {
				charList,
				charIndex: 0,
				currentChar: "",
				currentPinyin: "",
				charStroke: "",
				charRadical: "",
				charExplain: "",
				timer: null,
				audioCtx: null,
				isReading: false // 朗读状态标记：true=朗读中，禁止操作
			}
		},
		onShow() {
			this.renderChar()
		},
		onUnload() {
			this.clearAll()
		},
		methods: {
			// 清理定时器、音频 + 解除朗读锁定
			clearAll() {
				if (this.timer) {
					clearTimeout(this.timer)
					this.timer = null
				}
				if (this.audioCtx) {
					try {
						this.audioCtx.stop()
						this.audioCtx.destroy()
					} catch (e) {}
					this.audioCtx = null
				}
				this.isReading = false
			},

			// 播放语音
			playVoice(text) {
				if (!text) return
				const ttsUrl = `https://fanyi.baidu.com/gettts?text=${encodeURIComponent(text)}&lan=zh&spd=3`
				this.audioCtx = uni.createInnerAudioContext()
				this.audioCtx.src = ttsUrl
				this.audioCtx.play()
			},

			// 朗读当前字：拼音 → 间隔1秒 → 字义，读完结束
			readCurrentWord(item) {
				this.isReading = true // 开始朗读，加锁
				this.playVoice(`${item.char}，${item.pinyin}`)

				// 间隔1秒朗读字义
				this.timer = setTimeout(() => {
					this.playVoice(item.explain)
					// 监听字义音频播放结束，解锁
					this.audioCtx.onEnded = () => {
						this.isReading = false
					}
					// 异常兜底：超时强制解锁
					this.timer = setTimeout(() => {
						this.isReading = false
					}, 4000)
				}, 1000)
			},

			// 渲染文字并朗读
			renderChar() {
				const item = this.charList[this.charIndex]
				this.currentChar = item.char
				this.currentPinyin = item.pinyin
				this.charStroke = item.stroke
				this.charRadical = item.radical
				this.charExplain = item.explain

				this.clearAll()
				setTimeout(() => {
					this.readCurrentWord(item)
				}, 200)
			},

			// 重新朗读当前汉字
			reRead() {
				if (this.isReading) return
				this.clearAll()
				const item = this.charList[this.charIndex]
				this.readCurrentWord(item)
			},

			// 下一字
			nextChar() {
				if (this.isReading || this.charIndex >= this.charList.length - 1) return
				this.clearAll()
				this.charIndex++
				this.renderChar()
			},

			goHome() {
				this.clearAll()
				uni.reLaunch({
					url: "/pages/index/index"
				})
			},

			// 去测试页面
			goTestPage() {
				if (this.isReading) return
				this.clearAll()
				uni.navigateTo({
					url: "/pages/test/test"
				})
			}
		}
	}
</script>

<style scoped>
	view,
	text {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	.char-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
		padding-top: calc(var(--status-bar-height) + 20rpx);
		padding-bottom: 120rpx;
	}

	.top-icon-wrap {
		padding: 0 30rpx;
		margin-bottom: 30rpx;
	}

	.icon-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(86, 160, 113, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
	}

	.icon-btn:active {
		transform: scale(0.95);
	}

	.char-card {
		margin: 0 30rpx 50rpx;
		padding: 60rpx 40rpx;
		background: #fff;
		border-radius: 36rpx;
		box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.1);
		text-align: center;
	}

	.char-main {
		font-size: 180rpx;
		font-weight: bold;
		color: #2d3742;
		line-height: 1.2;
	}

	.char-pinyin {
		font-size: 44rpx;
		color: #56a071;
		margin: 20rpx 0 30rpx;
		letter-spacing: 6rpx;
	}

	.char-info {
		display: flex;
		justify-content: center;
		gap: 60rpx;
		margin-bottom: 40rpx;
	}

	.info-item {
		font-size: 32rpx;
		color: #798680;
	}

	.char-desc {
		text-align: left;
		padding-top: 30rpx;
		border-top: 1rpx dashed #e0e8e4;
	}

	.desc-title {
		display: block;
		font-size: 34rpx;
		font-weight: 500;
		color: #3a4742;
		margin-bottom: 16rpx;
	}

	.desc-content {
		font-size: 32rpx;
		color: #55635d;
		line-height: 1.8;
	}

	.btn-group {
		display: flex;
		padding: 0 30rpx;
		gap: 25rpx;
	}

	.btn {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 34rpx;
		border-radius: 50rpx;
		border: none;
		color: #fff;
		transition: all 0.2s;
		box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.1);
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn[disabled] {
		opacity: 0.5;
		transform: none !important;
	}

	/* 重新朗读 占比 3 */
	.read-btn {
		flex: 1;
		background: linear-gradient(135deg, #73b8e8, #59a6d8);
	}

	/* 下一字 占比 7 */
	.next-btn {
		flex: 9;
		background: linear-gradient(135deg, #ff9a9e, #fad0c4, #fecfef);
	}

	/* 底部固定 去测试按钮 原样式 */
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
		transition: opacity 0.2s;
	}

	/* 去测试按钮禁用样式 */
	.btn-disabled {
		opacity: 0.5;
	}
</style>