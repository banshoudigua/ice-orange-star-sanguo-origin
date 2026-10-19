const backgrounds = require("../../utils/backgrounds");

const STORAGE_KEY = "sanguo_origin_local_asset_batches";

Page({
  data: {
    pageBackgroundStyle: "",
    batchId: "",
    batch: null,
    hasBatch: false,
    batches: [],
    jobs: []
  },
  onLoad(options) {
    backgrounds.apply(this, "imageMonitor");
    this.setData({ batchId: options.batchId || "" });
    this.loadLatest();
  },
  readBatches() {
    return wx.getStorageSync(STORAGE_KEY) || [];
  },
  loadLatest() {
    if (this.data.batchId) {
      this.loadBatch(this.data.batchId);
      return;
    }
    const records = this.readBatches();
    const batches = records.map((item) => item.batch);
    this.setData({ batches, hasBatch: false, batch: null, jobs: [] });
  },
  loadBatch(batchId) {
    const records = this.readBatches();
    const record = records.find((item) => String(item.batch.id) === String(batchId));
    if (!record) {
      console.log("[本地素材规划] 未找到批次", batchId);
      wx.showToast({ title: "未找到本地批次", icon: "none" });
      this.setData({ hasBatch: false, batch: null, jobs: [], batchId: "" });
      return;
    }
    const jobs = (record.jobs || []).map((job) => {
      const next = Object.assign({}, job);
      next.preview = next.image_path || "";
      next.canRetry = false;
      return next;
    });
    this.setData({ batch: record.batch, hasBatch: true, jobs, batchId });
    console.log("[本地素材规划] 读取批次", record.batch.id, jobs.length, record.batch.updated_at);
  },
  showBatchList() {
    const records = this.readBatches();
    const batches = records.map((item) => item.batch);
    this.setData({ batchId: "", batch: null, hasBatch: false, batches, jobs: [] });
  },
  openBatch(e) {
    this.loadBatch(e.currentTarget.dataset.id);
  },
  clearLocalBatches() {
    wx.showModal({
      title: "清空本地规划",
      content: "会清空当前小程序缓存中的素材提示词批次。",
      confirmText: "清空",
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(STORAGE_KEY);
          this.setData({ batchId: "", batch: null, hasBatch: false, batches: [], jobs: [] });
          wx.showToast({ title: "已清空", icon: "none" });
        }
      }
    });
  }
});
