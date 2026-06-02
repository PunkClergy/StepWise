<template>
	<view class="error-book-page">
		<!-- 顶部：标题 + 日期 左右布局 -->
		<view class="header">
			<text class="title">📕 错题本</text>
			
			<!-- 单个醒目日期选择框 选完自动搜索 -->
			<picker mode="date" :value="selectDate" @change="onDateChange">
				<view class="strong-picker">
					{{ selectDate || '选择日期' }}
				</view>
			</picker>
		</view>

		<!-- 空状态 -->
		<view class="empty-box" v-if="filteredList.length === 0">
			<text class="empty-text">暂无错题 🎉</text>
			<text class="empty-desc">继续加油哦！</text>
		</view>

		<!-- 错题列表（滚动加载） -->
		<scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore" v-else>
			<view class="item" v-for="(item, index) in showList" :key="index">
				<view class="time">{{ item.time }}</view>
				<view class="question">{{ item.question }}</view>
				<view class="answer-row wrong">
					<text>❌ 你的答案：{{ item.userAnswer }}</text>
				</view>
				<view class="answer-row right">
					<text>✅ 正确答案：{{ item.rightAnswer }}</text>
				</view>
			</view>

			<!-- 加载提示 -->
			<view class="load-tip" v-if="hasMore">
				<text>加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [],
				uniqueList: [],
				filteredList: [],
				showList: [],
				pageSize: 5,
				currentPage: 1,
				hasMore: false,
				selectDate: ''
			};
		},
		onShow() {
			this.loadErrorList();
		},
		methods: {
			loadErrorList() {
				try {
					const data = uni.getStorageSync("math_error_questions") || [];
					this.list = data;

					const map = {};
					const uniqueArr = [];
					for (let i = this.list.length - 1; i >= 0; i--) {
						const item = this.list[i];
						if (!map[item.question]) {
							map[item.question] = true;
							uniqueArr.push(item);
						}
					}
					this.uniqueList = uniqueArr.reverse();
					this.filteredList = [...this.uniqueList];
					this.resetScroll();
				} catch (e) {
					this.uniqueList = [];
					this.filteredList = [];
					this.resetScroll();
				}
			},

			onDateChange(e) {
				this.selectDate = e.detail.value;
				this.searchByDate();
			},

			searchByDate() {
				if (!this.selectDate) {
					this.filteredList = [...this.uniqueList];
					this.resetScroll();
					return;
				}

				const targetDate = this.selectDate;
				this.filteredList = this.uniqueList.filter(item => {
					return item.time.startsWith(targetDate);
				});

				this.resetScroll();
			},

			resetScroll() {
				this.currentPage = 1;
				this.showList = [];
				this.loadData();
			},

			loadData() {
				const start = 0;
				const end = this.currentPage * this.pageSize;
				const tempList = this.filteredList.slice(start, end);
				this.showList = tempList;
				this.hasMore = this.showList.length < this.filteredList.length;
			},

			loadMore() {
				if (!this.hasMore) return;
				this.currentPage++;
				this.loadData();
			},

			clearAllError() {
				uni.showModal({
					title: "确认清空",
					content: "确定要清空所有错题吗？清空后无法恢复！",
					success: (res) => {
						if (res.confirm) {
							try {
								uni.removeStorageSync("math_error_questions");
								this.list = [];
								this.uniqueList = [];
								this.filteredList = [];
								this.showList = [];
								uni.showToast({ title: "清空成功" });
							} catch (e) {}
						}
					}
				});
			}
		}
	};
</script>

<style scoped>
	.error-book-page {
		background: linear-gradient(180deg, #fff9e6 0%, #fffdf5 100%);
		min-height: 100vh;
		padding: 20rpx;
		box-sizing: border-box;
	}

	/* 左右布局核心 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 50rpx 10rpx;
		margin-bottom: 10rpx;
	}

	.title {
		font-size: 46rpx;
		font-weight: bold;
		color: #5c3a21;
	}

	/* 日期样式醒目 */
	.strong-picker {
		padding: 12rpx 20rpx;
		background: linear-gradient(90deg, #ffebf0, #ffe0e0);
		border: 3rpx solid #ff6b6b;
		border-radius: 20rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #ff4444;
		text-align: center;
		white-space: nowrap;
	}

	/* 空状态 */
	.empty-box {
		text-align: center;
		padding-top: 150rpx;
	}

	.empty-text {
		display: block;
		font-size: 36rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.empty-desc {
		font-size: 28rpx;
		color: #ccc;
	}

	/* 去掉底部多余间距 */
	.list-scroll {
		height: calc(100vh - 200rpx);
	}

	.item {
		background: #fff;
		border-radius: 30rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 6rpx 15rpx rgba(255, 200, 200, 0.1);
	}

	.time {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 15rpx;
	}

	.question {
		font-size: 44rpx;
		font-weight: bold;
		color: #5c3a21;
		margin-bottom: 25rpx;
	}

	.answer-row {
		font-size: 30rpx;
		margin-bottom: 15rpx;
	}

	.wrong {
		color: #ff6b6b;
	}

	.right {
		color: #4cd964;
	}

	.load-tip {
		text-align: center;
		padding: 15rpx;
		color: #999;
	}
</style>