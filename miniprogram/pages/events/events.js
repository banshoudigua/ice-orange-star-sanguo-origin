const backgrounds = require("../../utils/backgrounds");
const audioUtil = require("../../utils/audio");
const gameData = require("../../utils/gameData");
const shareUtil = require("../../utils/share");
const registry = require("../../themes/registry");
const gameStore = require("../../utils/gameStore");

Page({
  data: {
    pageBackgroundStyle: "",
    theme: null,
    labels: {},
    events: [],
    filteredEvents: [],
    eventTypes: [],
    activeType: "全部",
    current: null
  },
  onLoad() {
    shareUtil.enableShareMenu();
    backgrounds.apply(this, "events");
    this.voiceAudio = audioUtil.createAudioPlayer("事件卡");
    this.loadTheme();
    this.loadEvents();
  },
  onUnload() {
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
    }
  },
  onShareAppMessage() {
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · 抽一张${this.data.labels.event || '事件卡'}`,
      path: "/pages/events/events"
    });
  },
  onShareTimeline() {
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${this.data.labels.event || '事件卡牌'}`
    });
  },
  loadTheme() {
    const savedGame = gameStore.getGame();
    const theme = registry.getThemeById(savedGame && savedGame.theme_id);
    wx.setNavigationBarTitle({ title: theme.labels.event || "事件卡" });
    this.setData({ theme, labels: theme.labels || {} });
  },
  loadEvents() {
    const theme = this.data.theme || registry.getThemeById();
    const events = (gameData.getThemeData(theme.id).events || []).map((item) => {
      const next = Object.assign({}, item);
      next.preview = next.image_path || "";
      return next;
    });
    const typeNames = events.reduce((list, item) => {
      if (item.event_type && list.indexOf(item.event_type) === -1) {
        list.push(item.event_type);
      }
      return list;
    }, []);
    const eventTypes = [{ name: "全部", count: events.length }].concat(
      typeNames.map((name) => ({
        name,
        count: events.filter((item) => item.event_type === name).length
      }))
    );
    this.setData({ events, eventTypes }, () => {
      this.applyFilter("全部");
    });
  },
  applyFilter(type) {
    const events = this.data.events || [];
    const filteredEvents = type === "全部" ? events : events.filter((item) => item.event_type === type);
    this.setData({
      activeType: type,
      filteredEvents,
      current: filteredEvents[0] || null
    });
  },
  playAudio(src, label) {
    if (!src || !this.voiceAudio) {
      console.log("[事件卡] 无可播放音频", label || "");
      return;
    }
    this.voiceAudio.play(src, label);
  },
  showEvent(row) {
    if (!row) return;
    row.preview = row.image_path || "";
    this.setData({ current: row });
    this.playAudio(row.sound_path, row.title);
  },
  randomEvent() {
    const events = this.data.filteredEvents || [];
    if (!events.length) return;
    this.showEvent(events[Math.floor(Math.random() * events.length)]);
  },
  selectEvent(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    this.showEvent(this.data.filteredEvents[index]);
  },
  selectType(e) {
    const type = e.currentTarget.dataset.type || "全部";
    this.applyFilter(type);
  }
});
