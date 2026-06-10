<template>
	<view class="parent-page">
		<!-- 星星总数展示 -->
		<view class="star-card">
			<text class="star-icon">⭐</text>
			<text class="star-txt">x {{ totalStar }}</text>
		</view>

		<!-- 扣减区域 -->
		<view class="operate-card">
			<view class="input-wrap">
				<input class="num-input" type="number" v-model="reduceNum" placeholder="请输入数字" />
			</view>
			<view class="btn-wrap">
				<button class="reduce-btn" @click="reduceStar">确认扣除</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				totalStar: 0, // 当前总星星
				reduceNum: '' // 要扣除的数量
			}
		},
		onShow() {
			// 页面显示时读取最新星星缓存
			this.getStarFromStorage()
		},
		methods: {
			// 读取本地星星缓存
			getStarFromStorage() {
				this.totalStar = Number(uni.getStorageSync('user_star_num')) || 0
			},
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			// 扣除星星核心逻辑
			reduceStar() {
				const num = Number(this.reduceNum)
				// 校验输入
				if (!num || num <= 0) {
					uni.showToast({
						title: '请输入有效数字',
						icon: 'none'
					})
					return
				}
				if (num > this.totalStar) {
					uni.showToast({
						title: '星星数量不足',
						icon: 'none'
					})
					return
				}
				// 扣减并更新缓存
				this.totalStar -= num
				uni.setStorageSync('user_star_num', this.totalStar)
				this.reduceNum = '' // 清空输入框
				uni.showToast({
					title: '扣除成功',
					icon: 'none'
				})
			}
		}
	}
</script>

<style scoped>
	.parent-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f9f4 0%, #edf4f2 100%);
		padding-top: var(--status-bar-height);
	}

	/* 顶部导航 */
	.nav-bar {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 30rpx;
		background: #fff;
		box-shadow: 0 2rpx 8rpx rgba(86, 160, 113, 0.1);
	}

	.back-btn {
		font-size: 36rpx;
		color: #56a071;
		width: 60rpx;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		color: #2d3742;
		font-weight: bold;
		margin-right: 60rpx;
	}

	/* 星星展示卡片 */
	.star-card {
		margin: 40rpx 30rpx;
		padding: 50rpx 30rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 6rpx 16rpx rgba(86, 160, 113, 0.12);
		display: flex;
		align-items: self-end;
		justify-content: center;
		gap: 20rpx;
	}

	.star-icon {
		font-size: 60rpx;
		color: #ffca3e;
	}

	.star-txt {
		font-size: 40rpx;
		color: #56a071;
		font-weight: bold;
	}

	/* 操作卡片 */
	.operate-card {
		margin: 0 30rpx;
		padding: 40rpx 30rpx;
		background: #fff;
		border-radius: 30rpx;
		box-shadow: 0 6rpx 16rpx rgba(86, 160, 113, 0.12);
	}

	.input-wrap {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.label {
		font-size: 32rpx;
		color: #2d3742;
		width: 180rpx;
	}

	.num-input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #e6edea;
		border-radius: 10rpx;
		font-size: 32rpx;
	}

	.btn-wrap {
		display: flex;
	}

	.reduce-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(90deg, #87b99c, #56a071);
		color: #fff;
		font-size: 34rpx;
		border-radius: 44rpx;
	}
</style>