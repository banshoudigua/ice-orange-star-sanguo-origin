const audioUtil = require("../../utils/audio");
const shareUtil = require("../../utils/share");

const ASSET_CDN_BASE = "https://cdn.example.com/cdn-upload-final";
const TIME_TRAVEL_CHARACTER_BASE = `${ASSET_CDN_BASE}/themes/time-travel-flight/characters`;
const CHAOSHAN_SPOT_BASE = `${ASSET_CDN_BASE}/themes/chaoshan-travel/cities`;
const CHAOSHAN_FOOD_BASE = `${ASSET_CDN_BASE}/themes/chaoshan-travel/cards`;
const SCORE_OPERATION_AUDIO = {
  add: `${ASSET_CDN_BASE}/themes/dice-score/audio/score-add-success.wav`,
  subtract: `${ASSET_CDN_BASE}/themes/dice-score/audio/score-subtract-success.wav`,
  transfer: `${ASSET_CDN_BASE}/themes/dice-score/audio/score-transfer-success.wav`
};
const SCORE_KEY_AUDIO = {
  "0": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-0.mp3`,
  "1": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-1.mp3`,
  "2": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-2.mp3`,
  "3": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-3.mp3`,
  "4": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-4.mp3`,
  "5": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-5.mp3`,
  "6": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-6.mp3`,
  "7": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-7.mp3`,
  "8": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-8.mp3`,
  "9": `${ASSET_CDN_BASE}/themes/dice-score/audio/key-9.mp3`,
  undo: `${ASSET_CDN_BASE}/themes/dice-score/audio/key-undo.mp3`,
  confirm: `${ASSET_CDN_BASE}/themes/dice-score/audio/key-confirm.mp3`,
  add: `${ASSET_CDN_BASE}/themes/dice-score/audio/key-add.mp3`,
  subtract: `${ASSET_CDN_BASE}/themes/dice-score/audio/key-subtract.mp3`,
  transfer: `${ASSET_CDN_BASE}/themes/dice-score/audio/key-transfer.mp3`
};
const ROLLING_AUDIO = `${ASSET_CDN_BASE}/dice-tool-rolling.mp3`;
const ROLL_DURATION = 920;
const SCORE_INPUT_MAX_LENGTH = 10;

function buildDiceImage(value) {
  const safeValue = Math.max(1, Math.min(Number(value || 1), 6));
  return `${ASSET_CDN_BASE}/dice-art-${safeValue}.png`;
}

function randomDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function parseInteger(value, fallback) {
  const numeric = Math.floor(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return numeric;
}

function clampPlayerCount(value) {
  return Math.max(2, Math.min(parseInteger(value, 4), 12));
}

function normalizeStartScore(value) {
  return parseInteger(value, 0);
}

function buildScorekeeperPlayers(count, startScore) {
  const players = [];
  for (let i = 0; i < count; i += 1) {
    players.push({
      id: i + 1,
      number: i + 1,
      score: startScore,
      history: [],
      avatarIndex: i,
      avatarUrl: "",
      avatarLabel: `头像 ${i + 1}`
    });
  }
  return players;
}

function buildScorekeeperAvatarPool() {
  const pool = [];
  for (let i = 1; i <= 16; i += 1) {
    const padded = String(i).padStart(2, "0");
    pool.push({
      id: `time-travel-character-${padded}`,
      label: `历史人物 ${i}`,
      group: "历史人物",
      url: `${TIME_TRAVEL_CHARACTER_BASE}/character-${padded}.jpg`
    });
  }
  const spotSlugs = [
    ["1", "guangjiqiao"],
    ["2", "paifangjie"],
    ["3", "hanwengongci"],
    ["4", "guchengqiang"],
    ["5", "nanao"],
    ["6", "xiaogongyuan"]
  ];
  for (let i = 0; i < spotSlugs.length; i += 1) {
    const item = spotSlugs[i];
    pool.push({
      id: `chaoshan-spot-${item[0]}`,
      label: `潮汕景点 ${item[0]}`,
      group: "潮汕景点",
      url: `${CHAOSHAN_SPOT_BASE}/spot-${item[0]}-${item[1]}.png`
    });
  }
  for (let i = 1; i <= 24; i += 1) {
    const padded = String(i).padStart(2, "0");
    pool.push({
      id: `chaoshan-food-${padded}`,
      label: `潮汕美食 ${i}`,
      group: "潮汕美食",
      url: `${CHAOSHAN_FOOD_BASE}/food-${padded}.png`
    });
  }
  return pool;
}

function resolveScorekeeperSetupPlayers(count, avatarIndexes, avatarPool) {
  const players = [];
  const safePool = avatarPool || [];
  const safeIndexes = Array.isArray(avatarIndexes) ? avatarIndexes : [];
  for (let i = 0; i < count; i += 1) {
    const avatarIndex = safeIndexes[i] !== undefined ? safeIndexes[i] : i % Math.max(safePool.length, 1);
    const avatar = safePool[avatarIndex] || safePool[0] || { url: "", label: "" };
    players.push({
      id: i + 1,
      number: i + 1,
      avatarIndex,
      avatarUrl: avatar.url || "",
      avatarLabel: avatar.label || `头像 ${i + 1}`
    });
  }
  return players;
}

function resolveTransferTargetIndex(targets, currentIndex) {
  const list = Array.isArray(targets) ? targets : [];
  if (!list.length) return -1;
  const numericIndex = Math.floor(Number(currentIndex));
  if (Number.isFinite(numericIndex) && list.some((item) => item.index === numericIndex)) {
    return numericIndex;
  }
  return list[0].index;
}

function normalizeAvatarIndexes(count, avatarIndexes, avatarPoolLength) {
  const poolLength = Math.max(avatarPoolLength, 1);
  const safeIndexes = Array.isArray(avatarIndexes) ? avatarIndexes.slice(0, count) : [];
  while (safeIndexes.length < count) {
    safeIndexes.push(safeIndexes.length % poolLength);
  }
  for (let i = 0; i < safeIndexes.length; i += 1) {
    const numeric = Math.floor(Number(safeIndexes[i]));
    if (!Number.isFinite(numeric) || numeric < 0) {
      safeIndexes[i] = i % poolLength;
      continue;
    }
    safeIndexes[i] = numeric % poolLength;
  }
  return safeIndexes;
}

function formatScoreClock(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeScoreDigits(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "0";
  if (digits.length > 1 && digits.charAt(0) === "0") {
    return (digits.replace(/^0+/, "") || "0").slice(0, SCORE_INPUT_MAX_LENGTH);
  }
  return digits.slice(0, SCORE_INPUT_MAX_LENGTH);
}

function buildScoreHistoryItem(type, amount, sourceNumber, targetNumber, currentScore) {
  const date = new Date();
  const prefix = type === "transfer-in" || type === "transfer-out"
    ? "转分"
    : type === "subtract"
      ? "减分"
      : "加分";
  let text = `${prefix} ${amount}`;
  if (type === "transfer-out" && targetNumber) {
    text = `转出 ${amount} 给 玩家${targetNumber}`;
  } else if (type === "transfer-in" && sourceNumber) {
    text = `收到 玩家${sourceNumber} 转入 ${amount}`;
  } else if (sourceNumber) {
    text = `${prefix} ${amount}`;
  }
  return {
    id: `${date.getTime()}_${Math.random().toString(16).slice(2, 8)}`,
    type,
    amount,
    sourceNumber,
    targetNumber,
    text,
    currentScore,
    time: formatScoreClock(date)
  };
}

function buildRecentDiceHistory(history) {
  return (history || []).slice(0, 3);
}

function buildScoreToast(mode, amount, sourceNumber, targetNumber) {
  if (mode === "transfer") {
    return `玩家${sourceNumber}转给玩家${targetNumber}${amount}分，已完成`;
  }
  if (mode === "subtract") {
    return `玩家${sourceNumber}减分${amount}分，已保存`;
  }
  return `玩家${sourceNumber}加分${amount}分，已保存`;
}

function resolveScoreOperationAudio(mode) {
  if (mode === "transfer") return SCORE_OPERATION_AUDIO.transfer;
  if (mode === "subtract") return SCORE_OPERATION_AUDIO.subtract;
  return SCORE_OPERATION_AUDIO.add;
}

function resolveScoreKeyAudio(key) {
  return SCORE_KEY_AUDIO[key] || "";
}

Page({
  data: {
    pageMode: "dice",
    pageTitle: "自动摇色器",
    pageSubTitle: "点一下骰子，随机出现 1-6 点。",
    shareImageUrl: `${ASSET_CDN_BASE}/icon-dice.png`,
    rolling: false,
    currentValue: 1,
    currentDiceImage: buildDiceImage(1),
    statusTitle: "准备好了",
    statusDesc: "点击中间的大骰子或底部按钮即可摇色。",
    rollCount: 0,
    history: [],
    recentHistory: [],
    isScorekeeperMode: false,
    scorekeeperReady: false,
    scorekeeperSetupPlayerCount: "4",
    scorekeeperSetupStartScore: "0",
    scorekeeperAvatarPool: buildScorekeeperAvatarPool(),
    scorekeeperSetupAvatarIndexes: [0, 1, 2, 3],
    scorekeeperSetupPlayers: [],
    scorePlayers: [],
    selectedScorePlayerIndex: -1,
    selectedScorePlayer: { score: 0 },
    scorePanelVisible: false,
    scoreAdjustMode: "add",
    scoreInputDigits: "0",
    scoreKeyActive: "",
    scoreTransferTargetIndex: -1,
    scoreTransferTargets: [],
    scorePreviewBase: 0,
    scorePreviewDelta: 1,
    scorePreviewFinal: 1,
    scorePreviewLabel: "+1",
    scorePreviewTargetBase: 0,
    scorePreviewTargetFinal: 0,
    scorePanelTip: "默认加分，点减分即可切换，点转给玩家可转给另一位玩家。",
    scoreAvatarPickerVisible: false,
    scoreAvatarPickerPlayerIndex: -1
  },
  onLoad(options) {
    const isScorekeeperMode = options && options.mode === "scorekeeper";
    const pageTitle = isScorekeeperMode ? "掷色器+计分器" : "自动摇色器";
    const pageSubTitle = isScorekeeperMode
      ? "先设玩家数和起始分，再点玩家图标，用数字键加分、点减分或转分。"
      : "点一下骰子，随机出现 1-6 点。";
    const shareImageUrl = isScorekeeperMode
      ? `${ASSET_CDN_BASE}/themes/dice-score/home/dice-score-home-hero-wide-v1.jpg`
      : `${ASSET_CDN_BASE}/icon-dice.png`;

    shareUtil.enableShareMenu();
    this.voiceAudio = audioUtil.createAudioPlayer(pageTitle);
    this.keyAudio = audioUtil.createAudioPlayer(`${pageTitle}-keys`);
    this.pageMode = isScorekeeperMode ? "scorekeeper" : "dice";
    this.rollTimer = null;
    this.previewTimer = null;
    wx.setNavigationBarTitle({ title: pageTitle });
    this.setData({
      pageMode: this.pageMode,
      pageTitle,
      pageSubTitle,
      shareImageUrl,
      isScorekeeperMode
    }, () => {
      if (isScorekeeperMode) {
        const count = this.normalizeScorekeeperPlayerCount(this.data.scorekeeperSetupPlayerCount);
        this.syncScorekeeperSetupPlayers(count, this.data.scorekeeperSetupAvatarIndexes);
      }
    });
  },
  onUnload() {
    if (this.rollTimer) clearTimeout(this.rollTimer);
    if (this.previewTimer) clearInterval(this.previewTimer);
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
      this.voiceAudio = null;
    }
    if (this.keyAudio) {
      this.keyAudio.destroy();
      this.keyAudio = null;
    }
    if (this.scoreKeyTimer) {
      clearTimeout(this.scoreKeyTimer);
      this.scoreKeyTimer = null;
    }
  },
  onShareAppMessage() {
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · ${this.data.pageTitle}`,
      path: this.data.isScorekeeperMode ? "/pages/dice-tool/dice-tool?mode=scorekeeper" : "/pages/dice-tool/dice-tool",
      imageUrl: this.data.shareImageUrl
    });
  },
  onShareTimeline() {
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${this.data.pageTitle}`,
      query: this.data.isScorekeeperMode ? "mode=scorekeeper" : "",
      imageUrl: this.data.shareImageUrl
    });
  },
  playAudio(src, label) {
    if (!this.voiceAudio || !src) return;
    this.voiceAudio.play(src, label, {
      onError: (err) => {
        console.log("[骰子工具] 音频播放失败", label, err);
      }
    });
  },
  playKeyAudio(key, label) {
    if (!this.keyAudio) return;
    const src = resolveScoreKeyAudio(key);
    if (!src) return;
    this.keyAudio.play(src, label || key, {
      onError: (err) => {
        console.log("[骰子工具] 按键音频播放失败", label || key, err);
      }
    });
  },
  flashScoreKey(key) {
    if (this.scoreKeyTimer) {
      clearTimeout(this.scoreKeyTimer);
      this.scoreKeyTimer = null;
    }
    this.setData({ scoreKeyActive: key || "" });
    this.scoreKeyTimer = setTimeout(() => {
      this.setData({ scoreKeyActive: "" });
      this.scoreKeyTimer = null;
    }, 140);
  },
  playCurrentAudio() {
    if (this.data.rolling) return;
    const value = Number(this.data.currentValue || 1);
    this.playAudio(`${ASSET_CDN_BASE}/dice-${value}.mp3`, `${value}点`);
  },
  rollDice() {
    if (this.data.rolling) return;
    if (this.rollTimer) clearTimeout(this.rollTimer);
    if (this.previewTimer) clearInterval(this.previewTimer);
    this.playAudio(ROLLING_AUDIO, "摇骰过程");
    this.setData({
      rolling: true,
      statusTitle: "摇动中",
      statusDesc: "骰子正在转动，马上揭晓点数。"
    });
    this.previewTimer = setInterval(() => {
      const previewValue = randomDiceValue();
      this.setData({
        currentValue: previewValue,
        currentDiceImage: buildDiceImage(previewValue)
      });
    }, 120);
    this.rollTimer = setTimeout(() => {
      const value = randomDiceValue();
      if (this.previewTimer) {
        clearInterval(this.previewTimer);
        this.previewTimer = null;
      }
      const history = [{
        id: Date.now(),
        value,
        image: buildDiceImage(value)
      }].concat(this.data.history || []).slice(0, 8);
      this.setData({
        rolling: false,
        currentValue: value,
        currentDiceImage: buildDiceImage(value),
        statusTitle: `摇出 ${value} 点`,
        statusDesc: "可直接用于线下桌游、抽签或临时判定。",
        rollCount: Number(this.data.rollCount || 0) + 1,
        history,
        recentHistory: buildRecentDiceHistory(history)
      });
      this.playAudio(`${ASSET_CDN_BASE}/dice-${value}.mp3`, `${value}点`);
    }, ROLL_DURATION);
  },
  clearHistory() {
    if (this.data.rolling) return;
    this.setData({ history: [], recentHistory: [], rollCount: 0 });
  },
  noop() {},
  normalizeScorekeeperPlayerCount(value) {
    return clampPlayerCount(value);
  },
  normalizeScorekeeperStartScore(value) {
    return normalizeStartScore(value);
  },
  syncScorekeeperSetupPlayers(nextCount, nextAvatarIndexes) {
    const count = this.normalizeScorekeeperPlayerCount(nextCount);
    const avatarPool = this.data.scorekeeperAvatarPool || [];
    const avatarIndexes = normalizeAvatarIndexes(count, nextAvatarIndexes || this.data.scorekeeperSetupAvatarIndexes, avatarPool.length);
    const scorekeeperSetupPlayers = resolveScorekeeperSetupPlayers(count, avatarIndexes, avatarPool);
    this.setData({
      scorekeeperSetupAvatarIndexes: avatarIndexes,
      scorekeeperSetupPlayers
    });
  },
  onScorekeeperPlayerCountInput(e) {
    const value = e.detail.value || "";
    const count = this.normalizeScorekeeperPlayerCount(value);
    this.setData({
      scorekeeperSetupPlayerCount: value
    }, () => {
      this.syncScorekeeperSetupPlayers(count);
    });
  },
  onScorekeeperStartScoreInput(e) {
    this.setData({ scorekeeperSetupStartScore: e.detail.value || "" });
  },
  startScorekeeper() {
    const count = this.normalizeScorekeeperPlayerCount(this.data.scorekeeperSetupPlayerCount);
    const startScore = this.normalizeScorekeeperStartScore(this.data.scorekeeperSetupStartScore);
    const avatarPool = this.data.scorekeeperAvatarPool || [];
    const avatarIndexes = normalizeAvatarIndexes(count, this.data.scorekeeperSetupAvatarIndexes, avatarPool.length);
    const setupPlayers = resolveScorekeeperSetupPlayers(count, avatarIndexes, avatarPool);
    const scorePlayers = buildScorekeeperPlayers(count, startScore);
    for (let i = 0; i < scorePlayers.length; i += 1) {
      scorePlayers[i].avatarIndex = setupPlayers[i] ? setupPlayers[i].avatarIndex : i;
      scorePlayers[i].avatarUrl = setupPlayers[i] ? setupPlayers[i].avatarUrl : "";
      scorePlayers[i].avatarLabel = setupPlayers[i] ? setupPlayers[i].avatarLabel : `头像 ${i + 1}`;
    }
    this.setData({
      scorekeeperReady: true,
      scorePlayers,
      selectedScorePlayerIndex: -1,
      selectedScorePlayer: { score: 0 },
      scorePanelVisible: false,
      scoreAdjustMode: "add",
      scoreInputDigits: "0",
      scoreTransferTargetIndex: -1,
      scoreTransferTargets: [],
      scoreAvatarPickerVisible: false,
      scoreAvatarPickerPlayerIndex: -1,
      scorekeeperSetupPlayerCount: String(count),
      scorekeeperSetupStartScore: String(startScore),
      scorekeeperSetupAvatarIndexes: avatarIndexes,
      scorekeeperSetupPlayers: setupPlayers
    });
  },
  getSelectedScorePlayer(index) {
    const players = this.data.scorePlayers || [];
    return players[index] || null;
  },
  buildScoreTransferTargets(currentIndex) {
    const players = this.data.scorePlayers || [];
    const targets = [];
    for (let i = 0; i < players.length; i += 1) {
      if (i === currentIndex) continue;
      targets.push({
        index: i,
        number: players[i].number,
        score: players[i].score
      });
    }
    return targets;
  },
  getScoreInputAmount() {
    const amount = Math.floor(Number(this.data.scoreInputDigits || 0));
    if (!Number.isFinite(amount) || amount < 0) return 0;
    return amount;
  },
  buildScorePreview(base, mode, value, transferTarget) {
    const numericValue = Math.max(0, Math.floor(Number(value || 0)));
    const delta = mode === "subtract" ? -numericValue : numericValue;
    const preview = {
      delta,
      final: base + delta,
      label: `${delta >= 0 ? "+" : ""}${delta}`,
      targetBase: 0,
      targetFinal: 0
    };
    if (mode === "transfer" && transferTarget) {
      preview.delta = -numericValue;
      preview.final = base - numericValue;
      preview.label = `转给 玩家${transferTarget.number}`;
      preview.targetBase = transferTarget.score;
      preview.targetFinal = transferTarget.score + numericValue;
    } else if (mode === "transfer") {
      preview.label = "请选择玩家";
    }
    return preview;
  },
  refreshScorePreview() {
    const player = this.data.selectedScorePlayer;
    if (!player) return;
    const target = this.data.scoreAdjustMode === "transfer"
      ? this.getSelectedScorePlayer(this.data.scoreTransferTargetIndex)
      : null;
    const preview = this.buildScorePreview(
      player.score,
      this.data.scoreAdjustMode,
      this.getScoreInputAmount(),
      target
    );
    this.setData({
      scorePreviewBase: player.score,
      scorePreviewDelta: preview.delta,
      scorePreviewFinal: preview.final,
      scorePreviewLabel: preview.label,
      scorePreviewTargetBase: preview.targetBase,
      scorePreviewTargetFinal: preview.targetFinal
    });
  },
  openScorePlayerPanel(e) {
    if (!this.data.scorekeeperReady) return;
    const index = Number(e.currentTarget.dataset.index || 0);
    const player = this.getSelectedScorePlayer(index);
    if (!player) return;
    const transferTargets = this.buildScoreTransferTargets(index);
    const transferTargetIndex = resolveTransferTargetIndex(transferTargets, this.data.scoreTransferTargetIndex);
    this.setData({
      selectedScorePlayerIndex: index,
      selectedScorePlayer: player,
      scorePanelVisible: true,
      scoreAdjustMode: "add",
      scoreInputDigits: "0",
      scoreTransferTargetIndex: transferTargetIndex,
      scoreTransferTargets: transferTargets
    }, () => {
      this.refreshScorePreview();
    });
  },
  openScorekeeperAvatarPicker(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const count = this.normalizeScorekeeperPlayerCount(this.data.scorekeeperSetupPlayerCount);
    if (index < 0 || index >= count) return;
    this.setData({
      scoreAvatarPickerVisible: true,
      scoreAvatarPickerPlayerIndex: index
    });
  },
  closeScorekeeperAvatarPicker() {
    this.setData({
      scoreAvatarPickerVisible: false,
      scoreAvatarPickerPlayerIndex: -1
    });
  },
  pickScorekeeperAvatar(e) {
    const avatarIndex = Number(e.currentTarget.dataset.index || 0);
    const playerIndex = this.data.scoreAvatarPickerPlayerIndex;
    if (playerIndex < 0) return;
    const count = this.normalizeScorekeeperPlayerCount(this.data.scorekeeperSetupPlayerCount);
    const nextIndexes = normalizeAvatarIndexes(count, this.data.scorekeeperSetupAvatarIndexes, this.data.scorekeeperAvatarPool.length);
    nextIndexes[playerIndex] = avatarIndex;
    const setupPlayers = resolveScorekeeperSetupPlayers(count, nextIndexes, this.data.scorekeeperAvatarPool);
    this.setData({
      scorekeeperSetupAvatarIndexes: nextIndexes,
      scorekeeperSetupPlayers: setupPlayers,
      scoreAvatarPickerVisible: false,
      scoreAvatarPickerPlayerIndex: -1
    });
  },
  closeScorePlayerPanel() {
    this.setData({
      scorePanelVisible: false,
      selectedScorePlayerIndex: -1,
      selectedScorePlayer: { score: 0 },
      scoreTransferTargetIndex: -1,
      scoreTransferTargets: []
    });
  },
  onScoreAdjustModeTap(e) {
    const mode = e.currentTarget.dataset.mode === "transfer"
      ? "transfer"
      : e.currentTarget.dataset.mode === "subtract"
        ? "subtract"
        : "add";
    const transferTargetIndex = resolveTransferTargetIndex(
      this.data.scoreTransferTargets,
      this.data.scoreTransferTargetIndex
    );
    const nextData = {
      scoreAdjustMode: mode,
      scoreInputDigits: "0",
      scoreTransferTargetIndex: mode === "transfer" ? transferTargetIndex : -1
    };
    this.setData(nextData, () => {
      this.refreshScorePreview();
    });
    this.flashScoreKey(mode);
    this.playKeyAudio(mode, mode === "transfer" ? "转给玩家" : mode === "subtract" ? "减分" : "加分");
  },
  onScorePanelDigitTap(e) {
    const digit = String(e.currentTarget.dataset.digit || "");
    if (!/^\d$/.test(digit)) return;
    let nextDigits = String(this.data.scoreInputDigits || "0");
    if (nextDigits.length >= SCORE_INPUT_MAX_LENGTH && nextDigits !== "0") {
      this.flashScoreKey(digit);
      this.playKeyAudio(digit, digit);
      return;
    }
    if (nextDigits === "0") {
      nextDigits = digit;
    } else {
      nextDigits += digit;
    }
    this.setData({ scoreInputDigits: normalizeScoreDigits(nextDigits) }, () => {
      this.refreshScorePreview();
    });
    this.flashScoreKey(digit);
    this.playKeyAudio(digit, digit);
  },
  onScorePanelUndoTap() {
    let nextDigits = String(this.data.scoreInputDigits || "0");
    if (nextDigits.length <= 1) {
      nextDigits = "0";
    } else {
      nextDigits = nextDigits.slice(0, -1);
    }
    this.setData({ scoreInputDigits: normalizeScoreDigits(nextDigits) }, () => {
      this.refreshScorePreview();
    });
    this.flashScoreKey("undo");
    this.playKeyAudio("undo", "撤销");
  },
  onScorePanelConfirmTap() {
    this.flashScoreKey("confirm");
    this.playKeyAudio("confirm", "确认");
    setTimeout(() => {
      this.applyScoreChange();
    }, 260);
  },
  onScoreTransferTargetTap(e) {
    const index = Number(e.currentTarget.dataset.index || -1);
    const target = this.getSelectedScorePlayer(index);
    if (!target || index === this.data.selectedScorePlayerIndex) return;
    this.setData({
      scoreAdjustMode: "transfer",
      scoreTransferTargetIndex: index,
      scoreInputDigits: "0"
    }, () => {
      this.refreshScorePreview();
    });
    this.flashScoreKey(`player-${index}`);
  },
  applyScoreChange() {
    const player = this.data.selectedScorePlayer;
    if (!player) return;
    const amount = this.getScoreInputAmount();
    if (!amount) {
      wx.showToast({
        title: "请输入分数",
        icon: "none"
      });
      return;
    }
    const players = (this.data.scorePlayers || []).slice();
    const currentIndex = this.data.selectedScorePlayerIndex;
    const currentPlayer = Object.assign({}, players[currentIndex]);
    let nextCurrentPlayer = null;
    if (this.data.scoreAdjustMode === "transfer") {
      const targetIndex = resolveTransferTargetIndex(this.data.scoreTransferTargets, this.data.scoreTransferTargetIndex);
      const targetPlayer = this.getSelectedScorePlayer(targetIndex);
      if (!targetPlayer) {
        wx.showToast({
          title: "请选择转给玩家",
          icon: "none"
        });
        return;
      }
      nextCurrentPlayer = Object.assign({}, currentPlayer, {
        score: currentPlayer.score - amount,
        history: (currentPlayer.history || []).slice()
      });
      const nextTargetPlayer = Object.assign({}, targetPlayer, {
        score: targetPlayer.score + amount,
        history: (targetPlayer.history || []).slice()
      });
      nextCurrentPlayer.history.push(buildScoreHistoryItem(
        "transfer-out",
        amount,
        currentPlayer.number,
        targetPlayer.number,
        nextCurrentPlayer.score
      ));
      nextTargetPlayer.history.push(buildScoreHistoryItem(
        "transfer-in",
        amount,
        currentPlayer.number,
        targetPlayer.number,
        nextTargetPlayer.score
      ));
      players[currentIndex] = nextCurrentPlayer;
      players[targetIndex] = nextTargetPlayer;
      this.setData({
        scorePlayers: players,
        selectedScorePlayer: nextCurrentPlayer,
        scoreInputDigits: "0"
      }, () => {
        this.refreshScorePreview();
      });
      wx.showToast({
        title: buildScoreToast("transfer", amount, currentPlayer.number, targetPlayer.number),
        icon: "none",
        duration: 1800
      });
      this.playAudio(resolveScoreOperationAudio("transfer"), "分数转移成功");
      this.setData({
        scorePanelVisible: false,
        selectedScorePlayerIndex: -1,
        selectedScorePlayer: { score: 0 },
        scoreTransferTargetIndex: -1,
        scoreTransferTargets: []
      });
      return;
    }

    const delta = this.data.scoreAdjustMode === "subtract" ? -amount : amount;
    nextCurrentPlayer = Object.assign({}, currentPlayer, {
      score: currentPlayer.score + delta,
      history: (currentPlayer.history || []).slice()
    });
    nextCurrentPlayer.history.push(buildScoreHistoryItem(
      delta < 0 ? "subtract" : "add",
      amount,
      currentPlayer.number,
      0,
      nextCurrentPlayer.score
    ));
    players[currentIndex] = nextCurrentPlayer;
    this.setData({
      scorePlayers: players,
      selectedScorePlayer: nextCurrentPlayer,
      scoreInputDigits: "0"
    }, () => {
      this.refreshScorePreview();
    });
    wx.showToast({
      title: buildScoreToast(this.data.scoreAdjustMode, amount, currentPlayer.number, 0),
      icon: "none",
      duration: 1800
    });
    this.playAudio(resolveScoreOperationAudio(this.data.scoreAdjustMode), "分数变动成功");
    this.setData({
      scorePanelVisible: false,
      selectedScorePlayerIndex: -1,
      selectedScorePlayer: { score: 0 },
      scoreTransferTargetIndex: -1,
      scoreTransferTargets: []
    });
  },
  onScorePanelTap() {
    if (this.data.scoreAdjustMode === "transfer") {
      return;
    }
    this.setData({ scoreAdjustMode: "add" }, () => {
      this.refreshScorePreview();
    });
  }
});
