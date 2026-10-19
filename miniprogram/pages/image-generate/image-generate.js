const backgrounds = require("../../utils/backgrounds");

const STORAGE_KEY = "sanguo_origin_local_asset_batches";

const pageBackgroundPrompts = [
  "bg-home｜三国起源小程序首页背景，东汉末年洛阳城门与远山晨雾，国风桌游插画，竖屏9:16构图，中央上方留出标题区域，下半部留出按钮和表单区域，暖金朱红与墨绿点缀，细腻但不抢UI，不要文字，不要水印，不要紫色或紫蓝色",
  "bg-room｜三国桌游对局控制台背景，军帐案台、竹简、骰子、地图与令旗，竖屏9:16构图，中心留出信息面板区域，边缘有沉浸式战场氛围，暖木色、赤色、青绿色，不要文字，不要水印，不要紫色或紫蓝色",
  "bg-characters｜三国武将卡册背景，木质兵器架、卷轴、微光甲胄、古代纹样边框，竖屏9:16构图，适合作为卡牌列表背景，画面有层次但中间干净，不要文字，不要水印，不要紫色或紫蓝色",
  "bg-events｜三国事件卡背景，黄巾烽火、洛阳宫阙剪影、雨夜营寨与战鼓元素融合，国风历史事件插画，竖屏9:16构图，中心偏暗便于叠放卡片，不要文字，不要水印，不要紫色或紫蓝色",
  "bg-image-generate｜三国工坊图像生成页背景，画师案台、颜料、毛笔、展开的空白画卷、微弱烛光，竖屏9:16构图，画卷区域留白适合放输入框，不要文字，不要水印，不要紫色或紫蓝色",
  "bg-image-monitor｜三国军机监控页背景，军情沙盘、进度令牌、传令旗与灯火，竖屏9:16构图，适合显示生成进度列表，中央干净、边缘丰富，不要文字，不要水印，不要紫色或紫蓝色"
].join("\n");

Page({
  data: {
    pageBackgroundStyle: "",
    batchName: "小程序页面背景图",
    promptsText: pageBackgroundPrompts
  },
  onLoad() {
    backgrounds.apply(this, "imageGenerate");
  },
  onBatchNameInput(e) {
    this.setData({ batchName: e.detail.value });
  },
  onPromptsInput(e) {
    this.setData({ promptsText: e.detail.value });
  },
  useBackgroundPrompts() {
    this.setData({
      batchName: "小程序页面背景图",
      promptsText: pageBackgroundPrompts
    });
  },
  parsePromptLine(line, index) {
    const parts = line.split("｜");
    if (parts.length > 1 && parts[0].trim()) {
      return {
        title: parts[0].trim(),
        prompt: parts.slice(1).join("｜").trim()
      };
    }
    return {
      title: `图片${index + 1}`,
      prompt: line
    };
  },
  readBatches() {
    return wx.getStorageSync(STORAGE_KEY) || [];
  },
  saveBatch(batch, jobs) {
    const batches = this.readBatches();
    const record = {
      batch,
      jobs
    };
    batches.unshift(record);
    wx.setStorageSync(STORAGE_KEY, batches.slice(0, 30));
  },
  createBatch() {
    const lines = this.data.promptsText.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) {
      wx.showToast({ title: "请填写提示词", icon: "none" });
      return;
    }
    const jobs = [];
    lines.forEach((prompt, index) => {
      const parsed = this.parsePromptLine(prompt, index);
      const isPageBackground = parsed.title.indexOf("bg-") === 0;
      jobs.push({
        title: parsed.title,
        assetType: isPageBackground ? "page_background" : "board_asset",
        prompt: parsed.prompt,
        size: isPageBackground ? "1024x1536" : "1024x1024",
        quality: "auto"
      });
    });
    const timestamp = new Date().toISOString();
    const batchId = Date.now();
    const batch = {
      id: batchId,
      batch_name: this.data.batchName || "本地素材规划",
      total_count: jobs.length,
      success_count: jobs.length,
      failed_count: 0,
      generating_count: 0,
      progress: 100,
      status: "local_saved",
      created_at: timestamp,
      updated_at: timestamp
    };
    const localJobs = jobs.map((job, index) => Object.assign({}, job, {
      id: batchId + index + 1,
      batch_id: batchId,
      status: "local_prompt",
      progress: 100,
      image_path: "",
      error_message: "",
      created_at: timestamp,
      updated_at: timestamp
    }));
    this.saveBatch(batch, localJobs);
    console.log("[本地素材规划] 已保存到缓存", {
      batchId,
      total: localJobs.length
    });
    wx.navigateTo({ url: `/pages/image-monitor/image-monitor?batchId=${batchId}` });
  }
});
