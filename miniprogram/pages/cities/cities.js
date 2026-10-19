const backgrounds = require("../../utils/backgrounds");
const gameData = require("../../utils/gameData");
const shareUtil = require("../../utils/share");
const registry = require("../../themes/registry");
const gameStore = require("../../utils/gameStore");
const audioUtil = require("../../utils/audio");

Page({
  data: {
    pageBackgroundStyle: "",
    theme: null,
    labels: {},
    isFlightTheme: false,
    cities: [],
    current: null,
    detailVisible: false,
    selectedCity: null
  },
  onLoad() {
    shareUtil.enableShareMenu();
    backgrounds.apply(this, "events");
    this.voiceAudio = audioUtil.createAudioPlayer("景点列表");
    this.loadTheme();
    this.loadCities();
  },
  onUnload() {
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
    }
  },
  onShareAppMessage() {
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · 查看${this.data.labels.city || '城池'}`,
      path: "/pages/cities/cities"
    });
  },
  onShareTimeline() {
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${this.data.labels.city || '城池'}一览`
    });
  },
  loadTheme() {
    const savedGame = gameStore.getGame();
    const theme = registry.getThemeById(savedGame && savedGame.theme_id);
    wx.setNavigationBarTitle({ title: theme.labels.cityPlural || theme.labels.city || "城池" });
    this.setData({ theme, labels: theme.labels || {}, isFlightTheme: theme.gameMode === "flight" });
  },
  loadCities() {
    const theme = this.data.theme || registry.getThemeById();
    const cities = (gameData.getThemeData(theme.id).cities || []).map((item) => Object.assign({}, item));
    this.setData({ cities, current: cities[0] || null });
  },
  selectCity(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const current = (this.data.cities || [])[index] || null;
    if (!current) return;
    this.setData({
      current,
      selectedCity: current,
      detailVisible: true
    });
    this.playCityVoice(current);
  },
  noop() {},
  closeCityDetail() {
    if (this.voiceAudio) this.voiceAudio.stop();
    this.setData({
      detailVisible: false,
      selectedCity: null
    });
  },
  playCityVoice(city) {
    const target = city || this.data.selectedCity || this.data.current;
    if (!target || !target.sound_path) {
      wx.showToast({ title: `当前${this.data.labels.city || '景点'}暂无介绍语音`, icon: "none" });
      return;
    }
    this.voiceAudio.play(target.sound_path, `${target.name}${this.data.labels.cityIntroLabel || '景点介绍'}`);
  },
  playSelectedCityVoice() {
    this.playCityVoice(this.data.selectedCity);
  },
  previewCityImage(e) {
    const fromDetail = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.detail;
    const current = fromDetail ? this.data.selectedCity : this.data.current;
    if (!current || !current.image_path) return;
    wx.previewImage({
      current: current.image_path,
      urls: [current.image_path]
    });
  }
});
