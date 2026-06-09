<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">

		<view class="header">
			<text class="title">📙 拼音学习</text>
			<text class="subtitle">点击拼音听普通话发音（联网/系统发音）</text>
		</view>

		<!-- Tabs -->
		<scroll-view class="tabs" scroll-x>
			<view
				class="tab"
				v-for="(cat, idx) in categories"
				:key="idx"
				:class="{ active: curIndex === idx }"
				@click="curIndex = idx"
			>
				{{ cat.name }}
			</view>
		</scroll-view>

		<!-- 拼音卡片 -->
		<view class="grid">
			<view
				class="card"
				v-for="(item, idx) in categories[curIndex].list"
				:key="idx"
				@click="speak(item.py)"
			>
				<text class="pinyin">{{ item.py }}</text>
				<text class="example">{{ item.word }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			safeTop: 0,
			curIndex: 0,
			ttsMode: 'auto', // auto | system | network
			categories: [
				{
					name: '声母',
					list: [
						{ py: 'b', word: '爸' }, { py: 'p', word: '跑' }, { py: 'm', word: '妈' },
						{ py: 'f', word: '风' }, { py: 'd', word: '大' }, { py: 't', word: '天' },
						{ py: 'n', word: '鸟' }, { py: 'l', word: '来' }, { py: 'g', word: '狗' },
						{ py: 'k', word: '口' }, { py: 'h', word: '花' }, { py: 'j', word: '鸡' },
						{ py: 'q', word: '七' }, { py: 'x', word: '西' }, { py: 'zh', word: '知' },
						{ py: 'ch', word: '车' }, { py: 'sh', word: '山' }, { py: 'r', word: '日' },
						{ py: 'z', word: '子' }, { py: 'c', word: '草' }, { py: 's', word: '伞' }
					]
				},
				{
					name: '单韵母',
					list: [
						{ py: 'a', word: '啊' }, { py: 'o', word: '喔' }, { py: 'e', word: '鹅' },
						{ py: 'i', word: '衣' }, { py: 'u', word: '乌' }, { py: 'ü', word: '鱼' }
					]
				},
				{
					name: '复韵母',
					list: [
						{ py: 'ai', word: '爱' }, { py: 'ei', word: '妹' }, { py: 'ui', word: '水' },
						{ py: 'ao', word: '猫' }, { py: 'ou', word: '藕' }, { py: 'iu', word: '牛' },
						{ py: 'ie', word: '叶' }, { py: 'üe', word: '月' }, { py: 'er', word: '耳' }
					]
				},
				{
					name: '鼻韵母',
					list: [
						{ py: 'an', word: '安' }, { py: 'en', word: '恩' }, { py: 'in', word: '音' },
						{ py: 'un', word: '温' }, { py: 'ün', word: '云' }, { py: 'ang', word: '羊' },
						{ py: 'eng', word: '灯' }, { py: 'ing', word: '星' }, { py: 'ong', word: '虫' }
					]
				},
				{
					name: '整体认读',
					list: [
						{ py: 'zhi', word: '织' }, { py: 'chi', word: '吃' }, { py: 'shi', word: '狮' },
						{ py: 'ri', word: '日' }, { py: 'zi', word: '字' }, { py: 'ci', word: '刺' },
						{ py: 'si', word: '丝' }, { py: 'yi', word: '一' }, { py: 'wu', word: '五' },
						{ py: 'yu', word: '雨' }, { py: 'ye', word: '夜' }, { py: 'yue', word: '月' },
						{ py: 'yuan', word: '圆' }, { py: 'yin', word: '音' }, { py: 'yun', word: '云' },
						{ py: 'ying', word: '鹰' }
					]
				},
				{
					name: '声调示例',
					list: [
						{ py: 'mā', word: '妈' }, { py: 'má', word: '麻' },
						{ py: 'mǎ', word: '马' }, { py: 'mà', word: '骂' }
					]
				}
			]
		};
	},
	onLoad() {
		this.calcSafeTop();
	},
	methods: {
		calcSafeTop() {
			try {
				const info = uni.getSystemInfoSync();
				const menu = uni.getMenuButtonBoundingClientRect?.();
				this.safeTop = menu
					? info.statusBarHeight + menu.height + 12
					: info.statusBarHeight + 44;
			} catch (e) {
				this.safeTop = 80;
			}
		},

		/**
		 * 🔊 主入口：发音
		 * 优先用系统 TTS（中文普通话，不需要网络）
		 * 如果你想强制走"网络API"，把 ttsMode 改成 'network'
		 */
		speak(text) {
			uni.showToast({ title: text, icon: 'none', duration: 600 });

			if (this.ttsMode === 'network') {
				this.speakByNetworkTTS(text);
			} else {
				this.speakBySystemTTS(text);
			}
		},

		/**
		 * ✅ 方案A：系统 TTS（App/H5 均支持，发音是标准中文）
		 * 不需要本地文件、不需要网络
		 */
		speakBySystemTTS(text) {
			// ---- App 端（plus.tts） ----
			if (typeof plus !== 'undefined' && plus.tts) {
				try {
					plus.tts.stop?.();
				} catch (e) {}
				plus.tts.speak(text, () => {}, (e) => {
					console.warn('plus.tts 失败，降级到网络TTS', e);
					this.speakByNetworkTTS(text);
				});
				return;
			}

			// ---- H5 端（Web Speech API） ----
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.cancel();
				const u = new SpeechSynthesisUtterance(text);
				u.lang = 'zh-CN';
				u.rate = 0.85;   // 拼音放慢一点更适合儿童
				u.pitch = 1;
				// 优先选中文语音
				const voices = window.speechSynthesis.getVoices?.() || [];
				const zhVoice = voices.find(v => v.lang.startsWith('zh'));
				if (zhVoice) u.voice = zhVoice;
				window.speechSynthesis.speak(u);
				return;
			}

			// ---- 兜底：走网络 ----
			this.speakByNetworkTTS(text);
		},

		/**
		 * 🌐 方案B：网络 TTS（你需要填自己的 API）
		 *
		 * 这里以「百度语音合成」为例（免费额度够用）
		 * 文档：https://ai.baidu.com/tech/speech/tts
		 *
		 * 步骤：
		 * 1. 去 https://ai.baidu.com 创建应用 → 拿到 API_KEY / SECRET_KEY
		 * 2. 后端把 token 换出来（或直接前端换一次也行，但别暴露 secret 在生产）
		 * 3. 拼装音频 URL
		 *
		 * 下方给你一个「可直接改」的模板
		 */
		speakByNetworkTTS(text) {
			// ⚠️ 替换成你自己的接口
			// 推荐做法：你自己写一个云函数 / serverless，接收 text → 返回音频URL
			// 这里给一个示意：
			const audioUrl = this.buildBaiduTTSUrl(text);

			if (!audioUrl) {
				uni.showModal({
					title: '提示',
					content: '当前环境不支持系统发音，请配置网络 TTS（见代码注释）',
					showCancel: false
				});
				return;
			}

			const audio = uni.createInnerAudioContext();
			audio.src = audioUrl;
			audio.play();
			audio.onError((e) => {
				console.error('网络TTS播放失败', e);
			});
		},

		/**
		 * 百度 TTS 音频直链构建
		 *
		 * 百度 TTS 有两种用法：
		 * - 服务端：获取 access_token，再请求
		 *   https://tsn.baidu.com/text2audio?tex=XXX&tok=ACCESS_TOKEN&cuid=APP&ctp=1&lan=zh&spd=5&pit=5&vol=5&per=0
		 *
		 * 最简单落地方式 👉 你搭一个轻量云函数：
		 *   GET /api/tts?text=xxx  →  302 到百度音频地址
		 *
		 * 下方是占位，你换成真实接口即可
		 */
		buildBaiduTTSUrl(text) {
			// TODO: 把你云函数地址填进来
			// 例如：return `https://your-cloud-function.domain/api/tts?text=${encodeURIComponent(text)}`;

			// ❌ 不能直接在前端裸调百度（会暴露 Secret）
			return null;
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff4f7, #f6f8ff);
	padding-bottom: 60rpx;
}

.header {
	padding: 30rpx 30rpx 10rpx;
}
.title {
	font-size: 38rpx;
	font-weight: bold;
	color: #ff6a8e;
	display: block;
}
.subtitle {
	font-size: 24rpx;
	color: #bbb;
}

.tabs {
	white-space: nowrap;
	padding: 10rpx 20rpx;
}
.tab {
	display: inline-block;
	padding: 12rpx 30rpx;
	margin-right: 14rpx;
	border-radius: 40rpx;
	background: #fff;
	color: #999;
	font-size: 28rpx;
}
.tab.active {
	background: #ff6a8e;
	color: #fff;
	font-weight: bold;
}

.grid {
	display: flex;
	flex-wrap: wrap;
	padding: 0 24rpx;
}
.card {
	width: 30%;
	margin: 1.66%;
	height: 160rpx;
	background: #fff;
	border-radius: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 6rpx 16rpx rgba(255,120,160,0.15);
}
.card:active {
	background: #fff0f4;
}
.pinyin {
	font-size: 42rpx;
	font-weight: bold;
	color: #ff6a8e;
}
.example {
	font-size: 26rpx;
	color: #aaa;
	margin-top: 6rpx;
}
</style>