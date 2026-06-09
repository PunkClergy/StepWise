<template>
	<view class="char-page">
		<!-- 顶部 -->
		<view class="top-icon-wrap">
			<view class="icon-btn left-icon" @click="goHome">
				<text>🏠</text>
			</view>
		</view>

		<!-- 汉字卡片主体 -->
		<view class="char-card">
			<!-- 汉字 -->
			<view class="char-main">{{ currentChar }}</view>
			<!-- 拼音 -->
			<view class="char-pinyin">{{ currentPinyin }}</view>
			<!-- 笔画 & 部首 -->
			<view class="char-info">
				<text class="info-item">笔画：{{ charStroke }}</text>
				<text class="info-item">部首：{{ charRadical }}</text>
			</view>
			<!-- 释义 -->
			<view class="char-desc">
				<text class="desc-title">字义解析</text>
				<text class="desc-content">{{ charExplain }}</text>
			</view>
		</view>

		<!-- 切换按钮组 -->
		<view class="btn-group">
			<button class="btn prev-btn" @click="prevChar" :disabled="charIndex <= 0">上一字</button>
			<button class="btn next-btn" @click="nextChar" :disabled="charIndex >= charList.length - 1">下一字</button>
		</view>
	</view>
</template>

<script>
	// 识字字库，可自行扩展汉字
	const charList = [{
			char: "山",
			pinyin: "shān",
			stroke: "3画",
			radical: "山",
			explain: "地面上由土石构成的高耸部分。组词：大山、山水"
		},
		{
			char: "水",
			pinyin: "shuǐ",
			stroke: "4画",
			radical: "水",
			explain: "无色无味的透明液体，生命之源。组词：河水、水果"
		},
		{
			char: "日",
			pinyin: "rì",
			stroke: "4画",
			radical: "日",
			explain: "指太阳，也表示白天、一天。组词：日月、日光"
		},
		{
			char: "月",
			pinyin: "yuè",
			stroke: "4画",
			radical: "月",
			explain: "天上的月亮，也指月份。组词：月亮、月光"
		},
		{
			char: "人",
			pinyin: "rén",
			stroke: "2画",
			radical: "人",
			explain: "能制造并使用工具的高等动物。组词：人们、人类"
		},
		{
			char: "天",
			pinyin: "tiān",
			stroke: "4画",
			radical: "大",
			explain: "天空，也指一天、天气。组词：蓝天、白天"
		},
		{
			char: "田",
			pinyin: "tián",
			stroke: "5画",
			radical: "田",
			explain: "用来种植农作物的土地。组词：田地、农田"
		},
		{
			char: "火",
			pinyin: "huǒ",
			stroke: "4画",
			radical: "火",
			explain: "物体燃烧产生的光和焰。组词：火苗、火焰"
		}
	]

	export default {
		data() {
			return {
				charList,
				charIndex: 0, // 当前汉字索引
				currentChar: "",
				currentPinyin: "",
				charStroke: "",
				charRadical: "",
				charExplain: ""
			}
		},
		onShow() {
			this.renderChar()
		},
		methods: {
			// 渲染当前汉字信息
			renderChar() {
				const item = this.charList[this.charIndex]
				this.currentChar = item.char
				this.currentPinyin = item.pinyin
				this.charStroke = item.stroke
				this.charRadical = item.radical
				this.charExplain = item.explain
			},
			// 上一个字
			prevChar() {
				if (this.charIndex > 0) {
					this.charIndex--
					this.renderChar()
				}
			},
			// 下一个字
			nextChar() {
				if (this.charIndex < this.charList.length - 1) {
					this.charIndex++
					this.renderChar()
				}
			},
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			// 直接返回首页
			goHome() {
				uni.reLaunch({
					url: "/pages/index/index"
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

	/* 页面整体 + 状态栏适配 延续护眼配色 */
	.char-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
		/* 顶部状态栏 + 图标区域预留高度 */
		padding-top: calc(var(--status-bar-height) + 20rpx);
	}

	/* 顶部首页图标区域 */
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

	/* 汉字主卡片 */
	.char-card {
		margin: 0 30rpx 50rpx;
		padding: 60rpx 40rpx;
		background: #fff;
		border-radius: 36rpx;
		box-shadow: 0 8rpx 20rpx rgba(86, 160, 113, 0.1);
		text-align: center;
	}

	/* 大字汉字 */
	.char-main {
		font-size: 180rpx;
		font-weight: bold;
		color: #2d3742;
		line-height: 1.2;
	}

	/* 拼音 */
	.char-pinyin {
		font-size: 44rpx;
		color: #56a071;
		margin: 20rpx 0 30rpx;
		letter-spacing: 6rpx;
	}

	/* 笔画、部首行 */
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

	/* 释义区域 */
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

	/* 底部切换按钮 */
	.btn-group {
		display: flex;
		padding: 0 30rpx;
		gap: 25rpx;
	}

	.btn {
		flex: 1;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 34rpx;
		border-radius: 24rpx;
		border: none;
		color: #fff;
		transition: all 0.2s;
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn[disabled] {
		opacity: 0.5;
		transform: none !important;
	}

	.prev-btn {
		background: linear-gradient(135deg, #87b99c, #56a071);
	}

	.next-btn {
		background: linear-gradient(135deg, #56a071, #488c60);
	}
</style>