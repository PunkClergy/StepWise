<template>
	<!-- 历史答题记录页面 -->
	<view class="history-page">

		<!-- 直接使用 Picker 日期选择（纯净版，无报错） -->
		<view class="search-box">
			<picker mode="date" @change="dateChange">
				<view class="picker-text">
					{{ searchDate || "选择日期搜索" }}
				</view>
			</picker>
		</view>

		<!-- 工具栏 -->
		<view class="tool-bar">
			<text>共 {{ totalCount }} 条记录</text>
			<text class="clear-all-btn" @click="clearAll">清空</text>
		</view>

		<!-- 空数据提示 -->
		<view class="empty" v-if="showList.length === 0">
			暂无答题记录
		</view>

		<!-- 考试记录列表 长按删除 单击查看试卷 -->
		<view class="item" v-for="(item, index) in showList" :key="index" @click="openPaper(item)"
			@longpress="longPressDel(item)">
			<view class="title">{{ item.createTime }}</view>
			<view class="info">
				<text>总分：{{ item.score }} 分</text>
				<text>正确：{{ item.rightCount }} 题</text>
				<text>错误：{{ item.wrongCount }} 题</text>
			</view>
			<view class="status" :class="item.isPass ? 'pass' : 'fail'">
				{{ item.isPass ? '通关' : '未通关' }}
			</view>
		</view>

		<!-- 分页加载更多 -->
		<view class="load-more" v-if="hasMore" @click="loadMore">
			加载更多
		</view>

		<!-- 试卷详情弹窗 -->
		<view class="modal" v-if="showPaper" @click="showPaper = false">
			<view class="modal-content" @click.stop>
				<view class="modal-title">试卷详情</view>

				<scroll-view scroll-y class="paper-list">
					<view class="q-item" v-for="(q, i) in currentPaper" :key="i">
						<view class="q-text">{{ q.question }}</view>
						<view class="q-ans">正确答案：{{ q.realAnswer }}</view>
						<view class="q-wrong" v-if="q.firstWrongAnswer">
							第一次答错：{{ q.firstWrongAnswer }}
						</view>
						<view class="q-state" :class="q.isRight ? 'right' : 'wrong'">
							{{ q.isRight ? '回答正确' : '回答错误' }}
						</view>
					</view>
				</scroll-view>

				<view class="close" @click="showPaper = false">关闭</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [],
				filterList: [],
				showList: [],
				showPaper: false,
				currentPaper: [],
				searchDate: "",
				pageSize: 20,
				currentPage: 1,
				totalCount: 0,
				hasMore: false
			};
		},
		onShow() {
			this.loadHistory();
		},
		methods: {
			// 日期选择改变
			dateChange(e) {
				this.searchDate = e.detail.value;
				this.doSearch();
			},

			// 加载所有缓存
			loadHistory() {
				uni.getStorageInfo({
					success: (res) => {
						let arr = [];
						res.keys.forEach(key => {
							if (key.startsWith('Exam')) {
								let data = uni.getStorageSync(key);
								let timeStr = key.replace('Exam', '');
								let timeText = this.formatTimeStr(timeStr);
								arr.unshift({
									...data,
									key,
									createTime: timeText
								});
							}
						});
						this.list = arr;
						this.filterList = arr;
						this.totalCount = arr.length;
						this.doPage();
					}
				});
			},

			// 日期搜索
			doSearch() {
				if (!this.searchDate) {
					this.filterList = [...this.list];
				} else {
					this.filterList = this.list.filter(item =>
						item.createTime.startsWith(this.searchDate)
					);
				}
				this.currentPage = 1;
				this.doPage();
			},

			// 分页处理
			doPage() {
				this.totalCount = this.filterList.length;
				let start = 0;
				let end = this.pageSize;
				this.showList = this.filterList.slice(start, end);
				this.hasMore = this.filterList.length > this.pageSize;
			},

			// 加载更多
			loadMore() {
				this.currentPage++;
				let start = (this.currentPage - 1) * this.pageSize;
				let end = this.currentPage * this.pageSize;
				let addList = this.filterList.slice(start, end);
				this.showList = [...this.showList, ...addList];
				this.hasMore = this.filterList.length > end;
			},

			// 长按删除
			longPressDel(item) {
				uni.vibrateShort();
				uni.showModal({
					title: "删除确认",
					content: "确定删除这条记录？",
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync(item.key);
							this.loadHistory();
						}
					}
				});
			},

			// 清空全部
			clearAll() {
				uni.showModal({
					title: "警告",
					content: "确定清空所有答题记录？不可恢复！",
					success: (res) => {
						if (res.confirm) {
							uni.getStorageInfo({
								success: (info) => {
									info.keys.forEach(k => {
										if (k.startsWith("Exam")) {
											uni.removeStorageSync(k);
										}
									});
									this.list = [];
									this.filterList = [];
									this.showList = [];
									this.totalCount = 0;
									uni.showToast({
										title: "清空成功"
									});
								}
							});
						}
					}
				});
			},

			// 时间格式化
			formatTimeStr(str) {
				return str.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6');
			},

			// 打开试卷
			openPaper(item) {
				this.currentPaper = item.paper;
				this.showPaper = true;
			}
		}
	};
</script>

<style scoped>
	.history-page {
		padding: 20rpx;
		background: #f5f5f5;
		min-height: 100vh;
	}

	/* Picker 日期搜索样式 */
	.search-box {
		background: #fff;
		border-radius: 12rpx;
		padding: 0 20rpx;
		margin-bottom: 20rpx;
		height: 70rpx;
		display: flex;
		align-items: center;
	}

	.search-box picker {
		width: 100%;
	}

	.picker-text {
		font-size: 26rpx;
		color: #333;
	}

	/* 工具栏 */
	.tool-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		font-size: 26rpx;
		color: #666;
	}

	.clear-all-btn {
		font-size: 24rpx;
		color: #fff;
		background: #ff3b30;
		border: none;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
	}

	.empty {
		text-align: center;
		padding: 200rpx 0;
		color: #999;
		font-size: 30rpx;
	}

	.item {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		position: relative;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.info {
		font-size: 26rpx;
		color: #666;
		display: flex;
		gap: 20rpx;
	}

	.status {
		position: absolute;
		right: 0rpx;
		top: 30rpx;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	.pass {
		color: #4cd964;
	}

	.fail {
		color: #ff3b30;
	}

	/* 加载更多 */
	.load-more {
		text-align: center;
		padding: 20rpx;
		color: #007aff;
		font-size: 26rpx;
	}

	/* 弹窗 */
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.modal-content {
		width: 90%;
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		max-height: 80vh;
	}

	.modal-title {
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.paper-list {
		max-height: 60vh;
	}

	.q-item {
		padding: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.q-text {
		font-size: 30rpx;
		font-weight: bold;
	}

	.q-ans {
		color: #007aff;
		font-size: 26rpx;
		margin-top: 6rpx;
	}

	.q-wrong {
		color: #ff3b30;
		font-size: 26rpx;
		margin-top: 6rpx;
	}

	.q-state {
		margin-top: 10rpx;
		font-size: 26rpx;
	}

	.right {
		color: #4cd964;
	}

	.wrong {
		color: #ff3b30;
	}

	.close {
		background: #007aff;
		color: #fff;
		text-align: center;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-top: 20rpx;
	}
</style>