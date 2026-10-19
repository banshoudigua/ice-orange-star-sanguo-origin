const backgrounds = require("../../utils/backgrounds");
const audioUtil = require("../../utils/audio");
const gameData = require("../../utils/gameData");
const gameStore = require("../../utils/gameStore");
const shareUtil = require("../../utils/share");
const registry = require("../../themes/registry");
const themeManager = require("../../themes/themeManager");

const INTRO_TEXT_LEAD_SECONDS = 1.4;
const INTRO_ROLL_START_RPX = 220;
const INTRO_ROLL_DISTANCE_RPX = 760;
const SETUP_GUIDE_AUDIO = "https://cdn.example.com/cdn-upload-final/home-options-guide.mp3";
const DEFAULT_PLAYER_COUNT_OPTIONS = [
  { value: 2, label: "2人", desc: "节奏最快，适合先熟悉流程。" },
  { value: 3, label: "3人", desc: "互动更均衡，推荐新手首局。" },
  { value: 4, label: "4人", desc: "竞争明显，适合完整体验。" },
  { value: 5, label: "5人", desc: "等待稍长，事件变化更多。" },
  { value: 6, label: "6人", desc: "聚会人数多时使用，建议回合数少一点。" }
];
const FLIGHT_PLAYER_COUNT_OPTIONS = [
  { value: 2, label: "2人", desc: "两色对飞，适合快速试玩。" },
  { value: 3, label: "3人", desc: "三色混战，路线更容易相遇。" },
  { value: 4, label: "4人", desc: "完整传统飞行棋体验。" }
];
const DICE_TOOL_THEME = {
  id: "dice-tool",
  title: "自动摇色器",
  subtitle: "桌游工具",
  description: "单独进入一个摇骰工具页，点击即可随机出现 1-6 点。适合线下桌游、抽签和临时判定。",
  heroImage: "https://cdn.example.com/cdn-upload-final/icon-dice.png",
  heroThumb: "https://cdn.example.com/cdn-upload-final/icon-dice.png",
  isTool: true,
  toolPath: "/pages/dice-tool/dice-tool",
  toolButtonText: "进入掷骰器"
};

Page({
  data: {
    pageBackgroundStyle: "",
    hasSavedGame: false,
    savedGameText: "",
    savedGameThemeTitle: "",
    setupStep: "theme",
    playerCount: 3,
    playerCountOptions: DEFAULT_PLAYER_COUNT_OPTIONS,
    maxRound: 6,
    customRoundInput: "6",
    diceMode: "auto",
    diceModeOptions: [
      { value: "auto", label: "系统自动掷点", desc: "小程序直接生成点数，移动后自动触发落点事件。" },
      { value: "manual", label: "玩家线下掷点", desc: "玩家用实体骰子掷出点数，再在小程序选择 1-6 点结算。" }
    ],
    roundOptions: [
      { value: 3, label: "3回合", desc: "试玩局，约十几分钟完成。" },
      { value: 6, label: "6回合", desc: "推荐局，节奏和成长都比较完整。" },
      { value: 9, label: "9回合", desc: "进阶局，适合想经营更多点位。" },
      { value: 12, label: "12回合", desc: "长局，适合多人慢慢玩。" }
    ],
    victoryType: "city",
    victoryTarget: 3,
    victoryOptions: [
      { type: "city", label: "城池", target: 3, unit: "座", desc: "获得 3 个城池即为最终胜利玩家。" },
      { type: "silver", label: "银两", target: 20, unit: "两", desc: "银两达到 20 两即为最终胜利玩家。" },
      { type: "prestige", label: "声望", target: 12, unit: "点", desc: "声望达到 12 点即为最终胜利玩家。" },
      { type: "grain", label: "粮草", target: 15, unit: "份", desc: "粮草达到 15 份即为最终胜利玩家。" },
      { type: "ally", label: "武将", target: 6, unit: "名", desc: "收集 6 名武将即为最终胜利玩家。" }
    ],
    isFlightTheme: false,
    flightPieceCount: 4,
    flightStartMode: "six",
    flightCollisionMode: "off",
    flightSpotMode: "mixed",
    flightStartModeOptions: [],
    flightCollisionModeOptions: [],
    flightSpotModeOptions: [],
    themes: [],
    currentThemeId: themeManager.DEFAULT_THEME_ID,
    currentTheme: null,
    currentThemeIndex: 0,
    themeLabels: {},
    gameplaySlides: [],
    dockItems: [],
    gameplayGuideVisible: false,
    selectedGuideImage: null,
    characterPickerVisible: false,
    selectedCharacterSeatIndex: -1,
    characterPickerSeatLabel: "",
    characterPickerOptions: [],
    characterOptions: [],
    players: [],
    introVisible: false,
    introPlaying: false,
    introLines: [],
    introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`,
    introProgress: 0
  },
  getThemeStatLabel(key, fallback) {
    const labels = this.data.themeLabels || {};
    return labels[key] || fallback;
  },
  onLoad() {
    shareUtil.enableShareMenu();
    backgrounds.apply(this, "home");
    this.pendingCreateRoom = false;
    this.introAudioSource = "";
    this.introAudioIgnoreErrorUntil = 0;
    this.introAudio = wx.createInnerAudioContext();
    this.introAudio.obeyMuteSwitch = false;
    this.setupGuideAudio = audioUtil.createAudioPlayer("首页设置引导");
    this.bindIntroAudioEvents();
    this.loadThemes();
    this.refreshSavedGame();
  },
  onShow() {
    this.refreshSavedGame();
  },
  onHide() {
    this.stopIntroAudio();
    this.stopSetupGuideAudio();
  },
  onUnload() {
    this.destroySetupGuideAudio();
    this.destroyIntroAudio();
  },
  onShareAppMessage() {
    const currentTheme = this.data.currentTheme || {};
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · ${currentTheme.title || "主题开局"}`,
      imageUrl: currentTheme.heroThumb || currentTheme.heroImage || undefined
    });
  },
  onShareTimeline() {
    const currentTheme = this.data.currentTheme || {};
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${currentTheme.title || "主题开局"}`,
      imageUrl: currentTheme.heroThumb || currentTheme.heroImage || undefined
    });
  },
  loadThemes() {
    const themes = registry.getThemeList().map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      heroImage: item.heroImage,
      heroThumb: item.heroThumb || item.heroImage,
      mapTitle: item.mapTitle,
      isTool: !!item.isTool,
      toolPath: item.toolPath || "",
      toolButtonText: item.toolButtonText || ""
    }));
    themes.push(DICE_TOOL_THEME);
    const currentThemeId = themeManager.getSelectedThemeId();
    let currentThemeIndex = themes.findIndex((item) => item.id === currentThemeId);
    if (currentThemeIndex < 0) currentThemeIndex = 0;
    this.setData({ themes, currentThemeIndex }, () => {
      this.applyTheme(themes[currentThemeIndex] ? themes[currentThemeIndex].id : themeManager.DEFAULT_THEME_ID);
    });
  },
  applyTheme(themeId) {
    const registryTheme = registry.getThemeById(themeId);
    const isToolTheme = themeId === DICE_TOOL_THEME.id || !!registryTheme.isTool;
    const theme = themeId === DICE_TOOL_THEME.id ? DICE_TOOL_THEME : registryTheme;
    if (!theme.isTool) {
      themeManager.setSelectedThemeId(theme.id);
    }
    const labels = isToolTheme ? {} : (theme.labels || {});
    const isFlightTheme = !isToolTheme && theme.gameMode === "flight";
    const victoryOptions = isFlightTheme ? [
      { type: "flight_finish_4", label: "4 枚到终点", target: 4, unit: "枚", desc: "率先让 4 枚棋子全部到达终点即为最终胜利玩家。" },
      { type: "flight_finish_2", label: "2 枚到终点", target: 2, unit: "枚", desc: "率先让 2 枚棋子到达终点即为简化胜利玩家。" },
      { type: "prestige", label: labels.prestigeStat || "旅行人气", target: 15, unit: "点", desc: `${labels.prestigeStat || "旅行人气"}达到 15 点即为最终胜利玩家。` },
      { type: "ally", label: labels.character || "历史人物卡", target: 6, unit: "张", desc: `收集 6 张${labels.character || "历史人物卡"}即为最终胜利玩家。` }
    ] : [
      { type: "city", label: labels.city || "城池", target: 3, unit: "个", desc: `获得 3 个${labels.city || "城池"}即为最终胜利玩家。` },
      { type: "silver", label: labels.silverStat || "银两", target: 20, unit: "两", desc: `银两达到 20 两即为最终胜利玩家。` },
      { type: "prestige", label: labels.prestigeStat || "声望", target: 12, unit: "点", desc: `声望达到 12 点即为最终胜利玩家。` },
      { type: "grain", label: labels.grainStat || "粮草", target: 15, unit: "份", desc: `粮草达到 15 份即为最终胜利玩家。` },
      { type: "ally", label: labels.character || "人物卡", target: 6, unit: "张", desc: `收集 6 张${labels.character || "人物卡"}即为最终胜利玩家。` }
    ];
    const playerCountOptions = isFlightTheme ? FLIGHT_PLAYER_COUNT_OPTIONS : DEFAULT_PLAYER_COUNT_OPTIONS;
    const playerCount = isFlightTheme && this.data.playerCount > 4 ? 4 : this.data.playerCount;
    this.setData({
      currentThemeId: theme.id,
      currentTheme: theme,
      isFlightTheme,
      playerCountOptions,
      playerCount,
      themeLabels: labels,
      gameplaySlides: isToolTheme ? [] : gameData.getThemeGuide(theme.id),
      dockItems: isToolTheme ? [] : gameData.getThemeDockItems(theme.id),
      introLines: isToolTheme ? [] : gameData.getThemeIntroLines(theme.id),
      victoryOptions,
      victoryType: victoryOptions.find((item) => item.type === this.data.victoryType) ? this.data.victoryType : victoryOptions[0].type,
      victoryTarget: victoryOptions.find((item) => item.type === this.data.victoryType)?.target || victoryOptions[0].target,
      flightPieceCount: isFlightTheme ? ((theme.flightSetup && theme.flightSetup.pieceCount) || 4) : 4,
      flightStartModeOptions: isFlightTheme ? ((theme.flightSetup && theme.flightSetup.startModes) || []) : [],
      flightCollisionModeOptions: isFlightTheme ? ((theme.flightSetup && theme.flightSetup.collisionModes) || []) : [],
      flightSpotModeOptions: isFlightTheme ? ((theme.flightSetup && theme.flightSetup.spotModes) || []) : []
    });
    this.prepareIntroAudio(theme);
    if (!isToolTheme) {
      this.loadInitialCharacters(theme.id);
    } else {
      this.setData({ characterOptions: [], players: [] });
    }
    this.refreshSavedGame();
  },
  bindIntroAudioEvents() {
    this.introAudio.onPlay(() => {
      this.setData({ introPlaying: true });
    });
    this.introAudio.onPause(() => {
      this.setData({ introPlaying: false });
    });
    this.introAudio.onStop(() => {
      this.setData({
        introPlaying: false,
        introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`,
        introProgress: 0
      });
    });
    this.introAudio.onTimeUpdate(() => {
      this.updateIntroByTime(this.introAudio.currentTime || 0, this.introAudio.duration || 40);
    });
    this.introAudio.onEnded(() => {
      this.setData({
        introPlaying: false,
        introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX - INTRO_ROLL_DISTANCE_RPX}rpx);`,
        introProgress: 100
      });
      if (this.pendingCreateRoom) {
        this.pendingCreateRoom = false;
        this.createRoomNow();
      }
    });
    this.introAudio.onError((err) => {
      const isExpectedInterrupt = Date.now() < this.introAudioIgnoreErrorUntil;
      console.log("[首页] 开场音频错误", {
        err,
        source: this.introAudioSource,
        isExpectedInterrupt,
        introVisible: this.data.introVisible
      });
      if (isExpectedInterrupt) return;
      wx.showToast({ title: "开场音频播放失败，已跳过", icon: "none" });
      this.setData({ introVisible: false, introPlaying: false });
      if (this.pendingCreateRoom) {
        this.pendingCreateRoom = false;
        this.createRoomNow();
      }
    });
  },
  updateIntroByTime(currentTime, duration) {
    const displayTime = Number(currentTime || 0) + INTRO_TEXT_LEAD_SECONDS;
    const progress = Math.min(100, Math.round((currentTime / duration) * 100));
    const safeDuration = Math.max(1, Number(duration || 40));
    const rollRate = Math.min(1, Math.max(0, displayTime / safeDuration));
    const rollOffset = Math.round(INTRO_ROLL_START_RPX - (INTRO_ROLL_DISTANCE_RPX * rollRate));
    this.setData({
      introProgress: progress,
      introRollStyle: `transform: translateY(${rollOffset}rpx);`
    });
  },
  noop() {},
  prepareIntroAudio(theme) {
    this.introAudioSource = theme && theme.introAudio
      ? audioUtil.resolveAudioSrc(theme.introAudio)
      : "";
    this.introAudioIgnoreErrorUntil = Date.now() + 800;
    if (!this.introAudio) return;
    // 主题轮播只切换音频地址记录，不提前设置 src，避免微信把旧音频中断误报为播放失败。
    this.introAudio.stop();
    this.setData({
      introPlaying: false,
      introVisible: false,
      introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`,
      introProgress: 0
    });
  },
  stopIntroAudio() {
    if (!this.introAudio) return;
    this.introAudioIgnoreErrorUntil = Date.now() + 800;
    this.introAudio.stop();
    this.setData({
      introPlaying: false,
      introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`,
      introProgress: 0
    });
  },
  destroyIntroAudio() {
    if (!this.introAudio) return;
    this.introAudio.stop();
    this.introAudio.destroy();
    this.introAudio = null;
  },
  onThemeSwiperChange(e) {
    const index = Number(e.detail.current || 0);
    const theme = (this.data.themes || [])[index];
    if (!theme) return;
    this.setData({ currentThemeIndex: index });
    this.applyTheme(theme.id);
  },
  onThemeCardTap(e) {
    const themeId = e.currentTarget.dataset.themeId;
    if (!themeId) return;
    if (themeId !== this.data.currentThemeId) {
      const index = (this.data.themes || []).findIndex((item) => item.id === themeId);
      this.setData({ currentThemeIndex: index < 0 ? 0 : index });
      this.applyTheme(themeId);
    }
    this.goSetupOptions();
  },
  onThemeChoiceTap(e) {
    const themeId = e.currentTarget.dataset.themeId;
    if (!themeId || themeId === this.data.currentThemeId) return;
    const index = (this.data.themes || []).findIndex((item) => item.id === themeId);
    this.setData({ currentThemeIndex: index < 0 ? 0 : index });
    this.applyTheme(themeId);
  },
  goSetupOptions() {
    if (this.data.currentTheme && this.data.currentTheme.isTool) {
      this.goDiceTool();
      return;
    }
    this.setData({ setupStep: "options" }, () => {
      this.playSetupGuideAudio();
    });
  },
  backToThemeStep() {
    this.stopSetupGuideAudio();
    this.setData({ setupStep: "theme" });
  },
  playSetupGuideAudio() {
    if (!this.setupGuideAudio) return;
    this.setupGuideAudio.play(
      SETUP_GUIDE_AUDIO,
      "设置页选择说明",
      {
        onError: (err) => {
          console.log("[首页设置引导] 设置页语音播放失败", err);
        }
      }
    );
  },
  stopSetupGuideAudio() {
    if (!this.setupGuideAudio) return;
    this.setupGuideAudio.stop();
  },
  destroySetupGuideAudio() {
    if (!this.setupGuideAudio) return;
    this.setupGuideAudio.destroy();
    this.setupGuideAudio = null;
  },
  onPlayerCountTap(e) {
    const count = Number(e.currentTarget.dataset.count || 2);
    this.rebuildPlayers(count);
  },
  onRoundTap(e) {
    const maxRound = Number(e.currentTarget.dataset.round || 6);
    this.setData({
      maxRound,
      customRoundInput: String(maxRound)
    });
  },
  onDiceModeTap(e) {
    const diceMode = e.currentTarget.dataset.mode || "auto";
    this.setData({ diceMode });
  },
  onFlightStartModeTap(e) {
    this.setData({ flightStartMode: e.currentTarget.dataset.mode || "six" });
  },
  onFlightCollisionModeTap(e) {
    this.setData({ flightCollisionMode: e.currentTarget.dataset.mode || "off" });
  },
  onFlightSpotModeTap(e) {
    this.setData({ flightSpotMode: e.currentTarget.dataset.mode || "mixed" });
  },
  normalizeRoundValue(value) {
    const numeric = Math.floor(Number(value || 0));
    if (!Number.isFinite(numeric) || numeric <= 0) return 6;
    return Math.max(1, Math.min(numeric, 99));
  },
  onCustomRoundInput(e) {
    const rawValue = e.detail.value || "";
    const maxRound = this.normalizeRoundValue(rawValue);
    this.setData({ customRoundInput: rawValue, maxRound });
  },
  onCustomRoundBlur(e) {
    const maxRound = this.normalizeRoundValue(e.detail.value || this.data.customRoundInput);
    this.setData({ maxRound, customRoundInput: String(maxRound) });
  },
  onVictoryTap(e) {
    const type = e.currentTarget.dataset.type || "city";
    const option = (this.data.victoryOptions || []).find((item) => item.type === type) || this.data.victoryOptions[0];
    this.setData({ victoryType: option.type, victoryTarget: option.target });
  },
  buildVictoryOptionsWithTarget(type, target) {
    const nextOptions = [];
    const options = this.data.victoryOptions || [];
    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];
      nextOptions.push(option.type === type ? Object.assign({}, option, { target }) : option);
    }
    return nextOptions;
  },
  onVictoryTargetInput(e) {
    const rawValue = e.detail.value;
    if (rawValue === "") {
      this.setData({ victoryTarget: "", victoryOptions: this.buildVictoryOptionsWithTarget(this.data.victoryType, "") });
      return;
    }
    const value = Math.max(1, Math.min(Number(rawValue || 1), 99));
    this.setData({ victoryTarget: value, victoryOptions: this.buildVictoryOptionsWithTarget(this.data.victoryType, value) });
  },
  onVictoryTargetBlur(e) {
    const value = Math.max(1, Math.min(Number(e.detail.value || 1), 99));
    this.setData({ victoryTarget: value, victoryOptions: this.buildVictoryOptionsWithTarget(this.data.victoryType, value) });
  },
  buildSeatPlayer(index, oldPlayer, usedCharacterIds) {
    const characterOptions = this.data.characterOptions || [];
    const oldCharacterId = oldPlayer && oldPlayer.characterId;
    let characterIndex = characterOptions.findIndex((item) => item.id === oldCharacterId);
    if (characterIndex >= 0 && usedCharacterIds.indexOf(characterOptions[characterIndex].id) !== -1) {
      characterIndex = -1;
    }
    if (characterIndex < 0) {
      characterIndex = characterOptions.findIndex((item, itemIndex) => itemIndex >= index && usedCharacterIds.indexOf(item.id) === -1);
    }
    if (characterIndex < 0) {
      characterIndex = characterOptions.findIndex((item) => usedCharacterIds.indexOf(item.id) === -1);
    }
    if (characterIndex < 0) characterIndex = 0;
    const character = characterOptions[characterIndex] || {};
    if (character.id) usedCharacterIds.push(character.id);
    return {
      playerName: character.name || `玩家${index + 1}`,
      faction: character.faction || "群雄",
      characterId: character.id || 0,
      characterIndex,
      character
    };
  },
  loadInitialCharacters(themeId) {
    const characterOptions = (gameData.getThemeData(themeId).characters || []).map((item) => Object.assign({}, item));
    this.setData({ characterOptions }, () => {
      this.rebuildPlayers(this.data.playerCount);
    });
  },
  rebuildPlayers(count) {
    const oldPlayers = this.data.players || [];
    const players = [];
    const usedCharacterIds = [];
    for (let i = 0; i < count; i += 1) {
      players.push(this.buildSeatPlayer(i, oldPlayers[i] || {}, usedCharacterIds));
    }
    this.setData({ playerCount: count, players });
  },
  buildCharacterPickerOptions(seatIndex) {
    const players = this.data.players || [];
    const selectedPlayer = players[seatIndex] || {};
    const usedCharacterIds = [];
    for (let i = 0; i < players.length; i += 1) {
      if (i !== seatIndex && players[i].characterId) usedCharacterIds.push(players[i].characterId);
    }
    return (this.data.characterOptions || []).map((character) => Object.assign({}, character, {
      selected: selectedPlayer.characterId === character.id,
      disabled: usedCharacterIds.indexOf(character.id) !== -1
    }));
  },
  openCharacterPicker(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    this.setData({
      characterPickerVisible: true,
      selectedCharacterSeatIndex: index,
      characterPickerSeatLabel: `玩家${index + 1}`,
      characterPickerOptions: this.buildCharacterPickerOptions(index)
    });
  },
  closeCharacterPicker() {
    this.setData({
      characterPickerVisible: false,
      selectedCharacterSeatIndex: -1,
      characterPickerSeatLabel: "",
      characterPickerOptions: []
    });
  },
  selectCharacterFromModal(e) {
    const characterId = Number(e.currentTarget.dataset.characterId || 0);
    const seatIndex = Number(this.data.selectedCharacterSeatIndex);
    const characterOptions = this.data.characterOptions || [];
    const characterIndex = characterOptions.findIndex((item) => item.id === characterId);
    const character = characterOptions[characterIndex];
    if (!character || seatIndex < 0) return;
    const players = this.data.players.slice();
    const hasUsed = players.some((item, itemIndex) => itemIndex !== seatIndex && item.characterId === character.id);
    if (hasUsed) {
      wx.showToast({ title: "此卡片已被其他玩家选择", icon: "none" });
      return;
    }
    const player = players[seatIndex] || {};
    player.playerName = character.name;
    player.faction = character.faction;
    player.characterId = character.id;
    player.characterIndex = characterIndex;
    player.character = character;
    players[seatIndex] = player;
    this.setData({
      players,
      characterPickerVisible: false,
      selectedCharacterSeatIndex: -1,
      characterPickerSeatLabel: "",
      characterPickerOptions: []
    });
  },
  refreshSavedGame() {
    const game = gameStore.getGame();
    if (!game || !game.room) {
      this.setData({ hasSavedGame: false, savedGameText: "", savedGameThemeTitle: "" });
      return;
    }
    const players = game.players || [];
    const current = players.find((player) => player.id === game.room.current_player_id) || players[0] || {};
    const savedTheme = registry.getThemeById(game.theme_id);
    this.setData({
      hasSavedGame: true,
      savedGameThemeTitle: savedTheme.title,
      savedGameText: `${game.room.current_round}/${game.room.max_round} 回合 · ${current.player_name || "待行动"}`
    });
  },
  createRoom() {
    this.stopSetupGuideAudio();
    if (this.data.hasSavedGame) {
      wx.showModal({
        title: "已有进行中的对局",
        content: "开始新局会清空当前缓存对局，是否继续？",
        confirmText: "重新开始",
        cancelText: "继续本局",
        success: (res) => {
          if (res.confirm) {
            gameStore.clearGame();
            this.startOpeningIntro();
          } else {
            this.continueGame();
          }
        }
      });
      return;
    }
    this.startOpeningIntro();
  },
  startOpeningIntro() {
    if (!this.introAudioSource) {
      wx.showToast({ title: "当前主题暂无开场语音", icon: "none" });
      this.createRoomNow();
      return;
    }
    this.pendingCreateRoom = true;
    this.setData({
      introVisible: true,
      introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`,
      introProgress: 0
    });
    this.introAudioIgnoreErrorUntil = Date.now() + 300;
    this.introAudio.stop();
    this.introAudio.src = this.introAudioSource;
    this.introAudio.seek(0);
    this.introAudio.play();
  },
  replayIntro() {
    this.setData({ introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`, introProgress: 0 });
    this.introAudioIgnoreErrorUntil = Date.now() + 300;
    this.introAudio.stop();
    this.introAudio.src = this.introAudioSource;
    this.introAudio.seek(0);
    this.introAudio.play();
  },
  skipIntro() {
    this.introAudio.stop();
    this.setData({ introVisible: false, introPlaying: false, introRollStyle: `transform: translateY(${INTRO_ROLL_START_RPX}rpx);`, introProgress: 0 });
    if (this.pendingCreateRoom) {
      this.pendingCreateRoom = false;
      this.createRoomNow();
    }
  },
  createRoomNow() {
    this.stopIntroAudio();
    this.setData({ introVisible: false, introPlaying: false });
    const players = this.data.players.map((player) => {
      const character = player.character || (this.data.characterOptions || []).find((item) => item.id === player.characterId);
      return Object.assign({}, player, {
        playerName: character ? character.name : player.playerName,
        faction: character ? character.faction : player.faction,
        allies: character ? [character] : []
      });
    });
    for (let i = 0; i < players.length; i += 1) {
      if (!players[i].characterId) {
        wx.showToast({ title: `请选择玩家${i + 1}初始卡片`, icon: "none" });
        return;
      }
    }
    const maxRound = this.normalizeRoundValue(this.data.customRoundInput || this.data.maxRound);
    this.setData({ maxRound, customRoundInput: String(maxRound) });
    const game = gameStore.createGame({
      themeId: this.data.currentThemeId,
      playerCount: this.data.playerCount,
      maxRound,
      diceMode: this.data.diceMode,
      victoryType: this.data.victoryType,
      victoryTarget: Math.max(1, Math.min(Number(this.data.victoryTarget || 1), 99)),
      flightOptions: {
        enabled: !!this.data.isFlightTheme,
        pieceCount: this.data.flightPieceCount,
        startMode: this.data.flightStartMode,
        collisionMode: this.data.flightCollisionMode,
        spotMode: this.data.flightSpotMode
      },
      players
    });
    console.log("[首页] 本地新局创建完成", {
      themeId: game.theme_id,
      playerCount: game.players.length,
      maxRound: game.room.max_round
    });
    this.refreshSavedGame();
    wx.navigateTo({ url: "/pages/room/room" });
  },
  continueGame() {
    this.stopSetupGuideAudio();
    const savedGame = gameStore.getGame();
    if (!savedGame) {
      wx.showToast({ title: "暂无可继续对局", icon: "none" });
      return;
    }
    const savedThemeId = savedGame.theme_id || themeManager.DEFAULT_THEME_ID;
    const themeIndex = (this.data.themes || []).findIndex((item) => item.id === savedThemeId);
    if (themeIndex >= 0) this.setData({ currentThemeIndex: themeIndex });
    this.applyTheme(savedThemeId);
    this.pendingCreateRoom = false;
    this.stopIntroAudio();
    wx.navigateTo({ url: "/pages/room/room" });
  },
  restartGame() {
    wx.showModal({
      title: "重新开始",
      content: "会清空当前缓存对局，并回到开局设置。",
      confirmText: "清空",
      success: (res) => {
        if (res.confirm) {
          this.pendingCreateRoom = false;
          this.stopIntroAudio();
          gameStore.clearGame();
          this.refreshSavedGame();
          wx.showToast({ title: "已清空对局", icon: "none" });
        }
      }
    });
  },
  goCharacters() {
    wx.navigateTo({ url: "/pages/characters/characters" });
  },
  goEvents() {
    wx.navigateTo({ url: "/pages/events/events" });
  },
  goCities() {
    wx.navigateTo({ url: "/pages/cities/cities" });
  },
  goThemeMap() {
    if (this.data.currentTheme && this.data.currentTheme.isTool) return;
    wx.navigateTo({ url: `/pages/theme-map/theme-map?themeId=${this.data.currentThemeId}` });
  },
  goDiceTool() {
    const currentTheme = this.data.currentTheme || {};
    wx.navigateTo({ url: currentTheme.toolPath || "/pages/dice-tool/dice-tool" });
  },
  openGameplayGuide() {
    this.setData({ gameplayGuideVisible: true, selectedGuideImage: null });
  },
  closeGameplayGuide() {
    this.setData({ gameplayGuideVisible: false, selectedGuideImage: null });
  },
  openGuideImage(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const item = (this.data.gameplaySlides || [])[index];
    if (!item) return;
    this.setData({ selectedGuideImage: item });
  },
  closeGuideImage() {
    this.setData({ selectedGuideImage: null });
  },
  onDockTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === "characters") this.goCharacters();
    if (key === "events") this.goEvents();
    if (key === "cities") this.goCities();
    if (key === "map") this.goThemeMap();
    if (key === "guide") this.openGameplayGuide();
  }
});
