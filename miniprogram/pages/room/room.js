const backgrounds = require("../../utils/backgrounds");
const audioUtil = require("../../utils/audio");
const gameStore = require("../../utils/gameStore");
const shareUtil = require("../../utils/share");
const registry = require("../../themes/registry");
const ASSET_CDN_BASE = "https://cdn.example.com/cdn-upload-final";

Page({
  data: {
    pageBackgroundStyle: "",
    theme: null,
    labels: {},
    room: null,
    players: [],
    playerCount: 0,
    maxRound: 0,
    currentPlayerName: "",
    currentPlayerLabel: "",
    currentSeatNo: 0,
    isLastPlayer: false,
    gameFinished: false,
    roundText: "",
    victoryText: "",
    winnerText: "",
    completeButtonText: "本轮结束",
    canEndTurn: false,
    diceMode: "auto",
    manualDiceVisible: false,
    manualDiceOptions: [1, 2, 3, 4, 5, 6],
    logs: [],
    diceResult: null,
    diceRolling: false,
    diceArtSrc: "",
    iconDoneSrc: `${ASSET_CDN_BASE}/icon-done.png`,
    iconDiceSrc: `${ASSET_CDN_BASE}/icon-dice.png`,
    iconEventSrc: `${ASSET_CDN_BASE}/icon-event.png`,
    victoryImageSrc: `${ASSET_CDN_BASE}/victory-celebration.png`,
    eventCard: null,
    eventCharacter: null,
    eventModalVisible: false,
    victoryModalVisible: false,
    winnerName: "",
    turnSettlementVisible: false,
    turnSettlement: null,
    movementPromptVisible: false,
    movementPromptText: "",
    selectedPlayer: null,
    selectedCharacter: null,
    selectedCity: null,
    cityModalVisible: false,
    attackModalVisible: false,
    attackStage: "",
    currentAttack: null,
    attackBusy: false,
    cardEffectVisible: false,
    cardEffect: null,
    activeTab: "console",
    playerStats: [],
    cityStats: [],
    isFlightTheme: false,
    flightConfig: null,
    currentFlightPieces: []
  },
  onLoad() {
    shareUtil.enableShareMenu();
    backgrounds.apply(this, "room");
    this.voiceAudio = audioUtil.createAudioPlayer("对局控制台");
    this.pendingEncounterCity = null;
    this.characterVoicePlaying = false;
    this.eventVoiceChainPlaying = false;
    this.eventVoiceChainDoneCallback = null;
    this.eventVoiceChainId = 0;
    this.cardEffectQueue = [];
    this.loadThemeFromGame();
    this.loadRoom();
  },
  onUnload() {
    if (this.diceTimer) clearTimeout(this.diceTimer);
    if (this.cityPromptTimer) clearTimeout(this.cityPromptTimer);
    if (this.eventPromptTimer) clearTimeout(this.eventPromptTimer);
    if (this.movementPromptTimer) clearTimeout(this.movementPromptTimer);
    if (this.attackProcessTimer) clearTimeout(this.attackProcessTimer);
    if (this.attackResolveTimer) clearTimeout(this.attackResolveTimer);
    if (this.cardEffectTimer) clearTimeout(this.cardEffectTimer);
    this.pendingEncounterCity = null;
    this.characterVoicePlaying = false;
    this.eventVoiceChainPlaying = false;
    this.eventVoiceChainDoneCallback = null;
    this.eventVoiceChainId += 1;
    this.cardEffectQueue = [];
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
    }
  },
  onShareAppMessage() {
    const roundText = this.data.roundText || "主题桌游操作台";
    const currentPlayer = this.data.currentPlayerLabel || "一起开局";
    const theme = this.data.theme || {};
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · ${theme.title || '主题对局'} · ${roundText} · ${currentPlayer}`,
      path: shareUtil.HOME_PATH
    });
  },
  onShareTimeline() {
    const theme = this.data.theme || {};
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${theme.title || '主题对局'}操作台`
    });
  },
  loadThemeFromGame() {
    const game = gameStore.getGame();
    const theme = registry.getThemeById(game && game.theme_id);
    this.setData({ theme, labels: theme.labels || {}, victoryImageSrc: theme.victoryImage || `${ASSET_CDN_BASE}/victory-celebration.png` });
  },
  getLabel(key, fallback) {
    const labels = this.data.labels || {};
    return labels[key] || fallback;
  },
  goHome() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: "/pages/home/home" });
      }
    });
  },
  loadRoom() {
    const data = gameStore.getPayload();
    if (!data) {
      wx.showModal({
        title: "暂无对局",
        content: "本机没有缓存中的对局，请返回首页开始新局。",
        showCancel: false,
        success: () => this.goHome()
      });
      return;
    }
    this.applyRoomData(data);
  },
  // 统一整理对局数据，避免 WXML 里写复杂表达式。
  buildPlayerStats(players, logs) {
    const safeLogs = logs || [];
    return (players || []).map((player) => {
      const relatedLogs = safeLogs.filter((log) => log.player_id === player.id);
      const diceLogs = relatedLogs.filter((log) => log.log_type === "dice_roll");
      const eventLogs = relatedLogs.filter((log) => log.log_type === "random_event" || log.log_type === "auto_random_event" || log.log_type === "character_slot");
      let lastDice = "-";
      if (diceLogs.length && diceLogs[0].data_json) {
        const diceData = JSON.parse(diceLogs[0].data_json);
        lastDice = diceData.moveTotal || diceData.total || diceData.rollsText || "-";
      }
      const allies = Array.isArray(player.allies) ? player.allies : [];
      return {
        id: player.id,
        seat_no: player.seat_no,
        player_name: player.player_name,
        faction: player.faction || "群雄",
        status: player.status || "ready",
        grain: Number(player.grain != null ? player.grain : (player.food != null ? player.food : 3)),
        silver: Number(player.silver != null ? player.silver : 5),
        prestige: Number(player.prestige != null ? player.prestige : (player.fame != null ? player.fame : 0)),
        battle: Number(player.battle != null ? player.battle : (player.military != null ? player.military : 0)),
        position: Number(player.position != null ? player.position : 0),
        move_adjust: Number(player.move_adjust != null ? player.move_adjust : 0),
        paused_turns: Number(player.paused_turns != null ? player.paused_turns : 0),
        redraw_tokens: Number(player.redraw_tokens != null ? player.redraw_tokens : 0),
        guard_tokens: Number(player.guard_tokens != null ? player.guard_tokens : 0),
        toll_free_tokens: Number(player.toll_free_tokens != null ? player.toll_free_tokens : 0),
        tactic_tokens: Number(player.tactic_tokens != null ? player.tactic_tokens : 0),
        siege_tokens: Number(player.siege_tokens != null ? player.siege_tokens : 0),
        ally_count: allies.length,
        flight_color_name: player.flight_color_name || "",
        flight_pieces: (player.flight_pieces || []).map((piece) => Object.assign({}, piece)),
        finished_pieces: Number(player.finished_pieces || 0),
        passport_stamps: Number(player.passport_stamps || 0),
        ally_cards: allies.map((item) => Object.assign({}, item, {
          image_path: item.image_path || "",
          force_value: Number(item.force_value || 0),
          strategy_value: Number(item.strategy_value || 0),
          fame_value: Number(item.fame_value || 0),
          command_value: Number(item.command_value || 0)
        })),
        ally_names: allies.length ? allies.map((item) => item.name).join("、") : `暂无${this.data.labels.ally || '收藏'}`,
        dice_count: diceLogs.length,
        event_count: eventLogs.length,
        last_dice: lastDice
      };
    });
  },
  // 主题据点归属由小程序操作台记录，线下走到对应格子后点购买或收费即可。
  buildCityStats(cities, players, room) {
    const playerMap = {};
    const currentPlayerId = room && room.current_player_id;
    const currentPlayer = (players || []).find((player) => player.id === currentPlayerId) || null;
    const currentSilver = Number(currentPlayer && currentPlayer.silver != null ? currentPlayer.silver : 0);
    (players || []).forEach((player) => {
      playerMap[player.id] = player.player_name;
    });
    return (cities || []).map((city) => {
      const hasOwner = !!city.owner_id;
      const isOwner = city.owner_id === currentPlayerId;
      const price = Number(city.price || 0);
      const toll = Number(city.toll || 0);
      const level = Number(city.level || 1);
      const upgradeCost = Number(city.upgrade_cost || 3);
      const ownerName = city.owner_id ? (city.owner_name || playerMap[city.owner_id] || "已占有") : "未购买";
      const allies = currentPlayer && Array.isArray(currentPlayer.allies) ? currentPlayer.allies : [];
      let bestAlly = null;
      for (let i = 0; i < allies.length; i += 1) {
        if (!bestAlly || Number(allies[i].force_value || 0) > Number(bestAlly.force_value || 0)) bestAlly = allies[i];
      }
      const force = Number(bestAlly && bestAlly.force_value ? bestAlly.force_value : 0);
      const siegeBonus = Number(currentPlayer && currentPlayer.siege_tokens ? currentPlayer.siege_tokens : 0);
      const defense = Number(city.defense || 10);
      let successCount = 0;
      for (let attackDice = 1; attackDice <= 6; attackDice += 1) {
        for (let defenseDice = 1; defenseDice <= 6; defenseDice += 1) {
          if ((attackDice * force) + siegeBonus >= defense + (defenseDice * 20)) successCount += 1;
        }
      }
      const winChance = force ? Math.round((successCount / 36) * 100) : 0;
      return Object.assign({}, city, {
        ownerName,
        ownerTag: hasOwner ? `${ownerName} 已拥有` : "尚未购买",
        canBuy: !hasOwner && currentSilver >= price,
        canPayToll: hasOwner && !isOwner && toll > 0 && currentSilver > 0,
        hasOwner,
        level,
        defense: Number(city.defense || 10),
        upgrade_cost: upgradeCost,
        canUpgrade: isOwner,
        canAttack: hasOwner && !isOwner,
        upgradePreview: {
          cost: upgradeCost,
          levelBefore: level,
          levelAfter: level + 1,
          tollBefore: toll,
          tollAfter: toll + 1,
          defenseBefore: Number(city.defense || 10),
          defenseAfter: Number(city.defense || 10) + 40,
          nextUpgradeCost: upgradeCost + 2
        },
        attackPreview: {
          allyName: bestAlly ? bestAlly.name : `暂无${this.data.labels.character || '卡片'}`,
          force,
          siegeBonus,
          defense,
          winChance,
          diff: force + siegeBonus - defense
        }
      });
    });
  },
  buildVictoryText(data) {
    const rule = data.victory_rule || { type: "city", target: 3 };
    const labels = {
      city: this.data.labels.city || "城池",
      flight_finish_4: "4 枚棋子到达终点",
      flight_finish_2: "2 枚棋子到达终点",
      silver: this.data.labels.silverStat || "银两",
      prestige: this.data.labels.prestigeStat || "人气",
      grain: this.data.labels.grainStat || "体力",
      ally: this.data.labels.character || "卡片"
    };
    const units = { city: "座", flight_finish_4: "枚", flight_finish_2: "枚", silver: "两", prestige: "点", grain: "份", ally: "张" };
    return `${labels[rule.type] || (this.data.labels.city || '景点')}达到 ${rule.target}${units[rule.type] || ""} 获胜`;
  },
  buildCityStatById(data, cityId) {
    const city = ((data && data.cities) || []).find((item) => item.id === Number(cityId));
    if (!city) return null;
    return this.buildCityStats([city], (data && data.players) || [], (data && data.room) || {})[0] || null;
  },
  buildCityStatByPosition(data, position) {
    const city = ((data && data.cities) || []).find((item) => Number(item.position) === Number(position));
    if (!city) return null;
    return this.buildCityStatById(data, city.id);
  },
  buildEncounterCityStat(data, diceResult) {
    const finalCity = this.buildCityStatByPosition(data, diceResult && diceResult.position);
    if (finalCity) return finalCity;
    const passedCities = (diceResult && diceResult.passed_cities) || [];
    for (let i = 0; i < passedCities.length; i += 1) {
      const city = this.buildCityStatById(data, passedCities[i].id);
      if (city && city.hasOwner && !city.canUpgrade) return city;
    }
    return null;
  },
  applyRoomData(data) {
    const players = data.players || [];
    let currentPlayerName = "";
    let currentSeatNo = 0;
    let isLastPlayer = false;
    for (let i = 0; i < players.length; i += 1) {
      if (data.room && players[i].id === data.room.current_player_id) {
        currentPlayerName = players[i].player_name;
        currentSeatNo = players[i].seat_no;
        isLastPlayer = i === players.length - 1;
      }
    }
    const room = data.room || {};
    const maxRound = Number(room.max_round || 0);
    const gameFinished = room.status === "finished";
    const roundText = maxRound ? `第 ${room.current_round} / ${maxRound} 回合` : `第 ${room.current_round || 1} 回合`;
    const finalTurn = isLastPlayer && maxRound && Number(room.current_round || 1) >= maxRound;
    const currentPlayerLabel = currentSeatNo ? `${currentSeatNo}号 ${currentPlayerName}` : currentPlayerName;
    const winner = data.winner || null;
    const showVictoryModal = !!winner && !this.victoryDismissed;
    const canEndTurn = !!room.turn_action_done;
    const isFlightTheme = data.theme_id === "time-travel-flight" || (this.data.theme && this.data.theme.gameMode === "flight");
    const currentFlightPlayer = isFlightTheme ? (players.find((player) => player.id === room.current_player_id) || null) : null;
    this.setData({
      room,
      players,
      playerCount: players.length,
      maxRound,
      currentPlayerName,
      currentPlayerLabel,
      currentSeatNo,
      isLastPlayer,
      gameFinished,
      roundText,
      victoryText: this.buildVictoryText(data),
      winnerText: winner ? `${winner.player_name} 已获胜` : "",
      winnerName: winner ? winner.player_name : "",
      victoryModalVisible: showVictoryModal,
      completeButtonText: finalTurn ? "结束本局" : "本轮结束",
      canEndTurn,
      isFlightTheme,
      flightConfig: data.flight_config || null,
      currentFlightPieces: currentFlightPlayer ? (currentFlightPlayer.flight_pieces || []) : [],
      diceMode: room.dice_mode || "auto",
      logs: data.logs || [],
      playerStats: this.buildPlayerStats(players, data.logs || []),
      cityStats: this.buildCityStats(data.cities || [], players, room)
    });
  },
  playAudio(src, label, options) {
    if (!src || !this.voiceAudio) {
      console.log("[对局控制台] 无可播放音频", label || "");
      if (options && options.onEnded) options.onEnded();
      return;
    }
    this.voiceAudio.play(src, label, options);
  },
  getCharacterVoicePath(character) {
    if (!character || !character.id) return "";
    if (character.sound_path) return character.sound_path;
    return `https://cdn.example.com/cdn-upload-final/character-${character.id}-voice.mp3`;
  },
  buildCardEffectFromCharacter(character, title) {
    if (!character) return null;
    return {
      name: character.name,
      title: title || character.skill_name || `${this.data.labels.character || '卡片'}效果生效`,
      desc: character.skill_desc || character.quote_text || "",
      image_path: character.image_path || "",
      tier: character.tier || "",
      faction: character.faction || "",
      role_type: character.role_type || ""
    };
  },
  showCardEffectAnimation(effect) {
    if (!effect) return;
    if (this.cardEffectTimer) clearTimeout(this.cardEffectTimer);
    console.log("[对局控制台] 卡片效果动效", effect.name, effect.title);
    this.setData({
      cardEffect: effect,
      cardEffectVisible: true
    });
    this.cardEffectTimer = setTimeout(() => {
      if (this.cardEffectQueue && this.cardEffectQueue.length) {
        this.showCardEffectAnimation(this.cardEffectQueue.shift());
        return;
      }
      this.setData({ cardEffectVisible: false, cardEffect: null });
    }, 2300);
  },
  showEventCardEffects(eventCard, fallbackCharacter) {
    const effects = eventCard && eventCard.activated_card_effects ? eventCard.activated_card_effects : [];
    if (effects.length) {
      this.cardEffectQueue = effects.slice(1);
      this.showCardEffectAnimation(effects[0]);
      return;
    }
    if (fallbackCharacter) {
      this.showCardEffectAnimation(this.buildCardEffectFromCharacter(fallbackCharacter, `${this.data.labels.character || '卡片'}加入收藏`));
    }
  },
  playCharacterRewardVoice(character, options) {
    const done = options && options.onEnded ? options.onEnded : null;
    if (!character) {
      if (done) done();
      return;
    }
    const src = this.getCharacterVoicePath(character);
    if (!src) {
      if (done) done();
      return;
    }
    this.characterVoicePlaying = true;
    this.playAudio(src, `抽到${character.name}${this.data.labels.character || '卡片'}`, {
      onEnded: () => {
        this.characterVoicePlaying = false;
        if (done) done();
      },
      onError: () => {
        console.log("[对局控制台] 卡片语音播放失败", character.name);
      }
    });
  },
  playEventVoiceWithCharacter(eventCard, character) {
    const theme = this.data.theme || {};
    if (theme.id === "chaoshan-travel" && character) {
      this.playCharacterRewardVoice(character);
      return;
    }
    const chainId = this.eventVoiceChainId + 1;
    this.eventVoiceChainId = chainId;
    this.eventVoiceChainPlaying = true;
    this.eventVoiceChainDoneCallback = null;
    const finishChain = () => {
      if (this.eventVoiceChainId !== chainId) return;
      this.eventVoiceChainPlaying = false;
      const done = this.eventVoiceChainDoneCallback;
      this.eventVoiceChainDoneCallback = null;
      if (done) done();
    };
    const playCharacter = () => {
      if (this.eventVoiceChainId !== chainId) return;
      this.playCharacterRewardVoice(character, { onEnded: finishChain });
    };
    if (!eventCard || !eventCard.sound_path) {
      playCharacter();
      return;
    }
    this.playAudio(eventCard.sound_path, eventCard.title, {
      onEnded: playCharacter,
      onError: () => {
        console.log("[对局控制台] 事件语音播放失败，继续人物卡语音", eventCard.title);
      }
    });
  },
  playDiceAudio(total) {
    if (total >= 1 && total <= 6) {
      this.playAudio(`https://cdn.example.com/cdn-upload-final/dice-${total}.mp3`, `骰子${total}点`);
    }
  },
  playMoveAudio(steps) {
    const safeSteps = Math.max(1, Math.min(Number(steps || 1), 12));
    this.playAudio(`https://cdn.example.com/cdn-upload-final/move-${safeSteps}.mp3`, `前进${safeSteps}格`);
  },
  switchRoomTab(e) {
    const tab = e.currentTarget.dataset.tab || "console";
    this.setData({ activeTab: tab });
  },
  noop() {},
  showMenu() {
    wx.showActionSheet({
      itemList: ["查看胜利目标", "继续本局", "重新开始", "回到首页"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showVictoryGoal();
        }
        if (res.tapIndex === 1) {
          this.loadRoom();
        }
        if (res.tapIndex === 2) {
          this.confirmRestart();
        }
        if (res.tapIndex === 3) {
          this.goHome();
        }
      }
    });
  },
  showVictoryGoal() {
    const winnerText = this.data.winnerText ? `\n当前结果：${this.data.winnerText}` : "";
    wx.showModal({
      title: "胜利目标",
      content: `${this.data.victoryText || "暂无胜利目标"}${winnerText}`,
      showCancel: false,
      confirmText: "知道了"
    });
  },
  confirmRestart() {
    wx.showModal({
      title: "重新开始",
      content: "将清空本机缓存中的当前对局，并回到首页重新设置玩家。",
      confirmText: "清空",
      success: (res) => {
        if (res.confirm) {
          gameStore.clearGame();
          wx.showToast({ title: "已清空对局", icon: "none" });
          setTimeout(() => this.goHome(), 350);
        }
      }
    });
  },
  nextStep() {
    if (!this.data.room || !this.data.room.id) {
      console.log("[对局控制台] 对局数据未加载，无法推进流程");
      wx.showToast({ title: "对局数据加载中", icon: "none" });
      return;
    }
    if (this.data.gameFinished) {
      wx.showToast({ title: "本局已结束", icon: "none" });
      return;
    }
    if (!this.data.canEndTurn) {
      wx.showToast({ title: "请先掷点或抽事件", icon: "none" });
      return;
    }
    this.playAudio("https://cdn.example.com/cdn-upload-final/turn-end.mp3", "本轮结束");
    const data = gameStore.nextStep();
    if (data) {
      this.applyRoomData(data);
      this.setData({
        diceResult: null,
        diceArtSrc: "",
        eventCard: null,
        eventCharacter: null,
        eventModalVisible: false,
        movementPromptVisible: false,
        movementPromptText: "",
        turnSettlement: data.last_turn_settlement || null,
        turnSettlementVisible: !!data.last_turn_settlement
      });
    }
  },
  rollDice() {
    if (!this.data.room || !this.data.room.id) {
      console.log("[对局控制台] 对局数据未加载，无法摇骰");
      wx.showToast({ title: "对局数据加载中", icon: "none" });
      return;
    }
    if (this.data.gameFinished) {
      wx.showToast({ title: "本局已结束", icon: "none" });
      return;
    }
    if (this.data.diceRolling) return;
    if (this.data.diceMode === "manual") {
      this.setData({ manualDiceVisible: true });
      return;
    }
    const currentPlayer = (this.data.playerStats || []).find((player) => player.id === this.data.room.current_player_id);
    const pendingAdjust = Number(currentPlayer && currentPlayer.move_adjust ? currentPlayer.move_adjust : 0);
    if (pendingAdjust) {
      if (this.movementPromptTimer) clearTimeout(this.movementPromptTimer);
      this.setData({
        diceRolling: true,
        movementPromptVisible: true,
        movementPromptText: `本回合移动修正 ${pendingAdjust > 0 ? "+" : ""}${pendingAdjust} 生效`
      });
      this.movementPromptTimer = setTimeout(() => {
        this.runDiceRoll();
      }, 900);
      return;
    }
    this.runDiceRoll();
  },
  runDiceRoll(fixedTotal) {
    this.setData({ diceRolling: true });
    if (this.diceTimer) clearTimeout(this.diceTimer);
    if (this.cityPromptTimer) clearTimeout(this.cityPromptTimer);
    if (this.eventPromptTimer) clearTimeout(this.eventPromptTimer);
    if (this.movementPromptTimer) clearTimeout(this.movementPromptTimer);
    this.pendingEncounterCity = null;
    const data = gameStore.rollDice(1, fixedTotal);
    if (!data) {
      this.setData({ diceRolling: false });
      return;
    }
    const latestPayload = gameStore.getPayload();
    const autoEvent = data.auto_event || null;
    const acquiredCharacters = autoEvent && autoEvent.acquired_characters ? autoEvent.acquired_characters : [];
    const eventCharacter = acquiredCharacters.length ? acquiredCharacters[0] : null;
    this.setData({
      diceResult: data,
      diceArtSrc: `${ASSET_CDN_BASE}/dice-art-${data.total}.png`,
      eventCard: autoEvent,
      eventCharacter,
      eventModalVisible: false,
      movementPromptVisible: true,
      movementPromptText: data.flight_mode ? data.flight_prompt : (data.moveAdjust ? `移动修正 ${data.moveAdjust > 0 ? "+" : ""}${data.moveAdjust}，前进 ${data.moveTotal || data.total} 格` : `前进 ${data.moveTotal || data.total} 格`)
    });
    if (data.flight_mode) {
      this.playDiceAudio(data.total);
    } else {
      this.playMoveAudio(data.moveTotal || data.total);
    }
    if (latestPayload) {
      this.applyRoomData(latestPayload);
      if (!data.flight_mode) this.scheduleLandedCityModal(data, latestPayload);
    }
    this.movementPromptTimer = setTimeout(() => {
      this.setData({ movementPromptVisible: false });
    }, 1800);
    if (autoEvent) {
      this.eventPromptTimer = setTimeout(() => {
        this.setData({
          eventCard: autoEvent,
          eventCharacter,
          eventModalVisible: true
        });
        this.showEventCardEffects(autoEvent, eventCharacter);
        this.playEventVoiceWithCharacter(autoEvent, eventCharacter);
      }, 1600);
    }
    this.diceTimer = setTimeout(() => {
      this.setData({ diceRolling: false });
    }, 760);
  },
  closeManualDice() {
    this.setData({ manualDiceVisible: false });
  },
  selectManualDice(e) {
    const total = Number(e.currentTarget.dataset.total || 0);
    if (total < 1 || total > 6) return;
    this.setData({ manualDiceVisible: false });
    this.runDiceRoll(total);
  },
  updateFlightPiece(e) {
    const playerId = Number(e.currentTarget.dataset.playerId || 0);
    const pieceIndex = Number(e.currentTarget.dataset.pieceIndex || 0);
    const status = e.currentTarget.dataset.status || "airport";
    const data = gameStore.updateFlightPiece(playerId, pieceIndex, status);
    if (data) {
      this.applyRoomData(data);
      wx.showToast({ title: "棋子状态已记录", icon: "none" });
    }
  },
  scheduleLandedCityModal(diceResult, payload) {
    const city = this.buildEncounterCityStat(payload, diceResult);
    if (!city) return;
    if (diceResult && diceResult.auto_event) {
      console.log("[对局控制台] 自动事件未关闭，主题据点弹窗先进入等待队列", city.name);
      this.pendingEncounterCity = city;
      return;
    }
    this.cityPromptTimer = setTimeout(() => {
      this.openQueuedEncounterCity(city);
    }, 2600);
  },
  openQueuedEncounterCity(city) {
    if (!city) return;
    this.showEncounterCityModal(city);
    this.playCityIntro(city);
  },
  playCityIntro(city) {
    if (!city) return;
    const theme = this.data.theme || {};
    this.playAudio(theme.encounterPromptAudio || "https://cdn.example.com/cdn-upload-final/city-enter-action.mp3", theme.encounterPromptText || `进入${this.getLabel('city', '城池')}，请选择行动`, {
      onEnded: () => {
        if (city.sound_path) {
          this.playAudio(city.sound_path, `${city.name}${this.getLabel('cityIntroLabel', '城池介绍')}`);
        }
      }
    });
  },
  showEncounterCityModal(city) {
    console.log("[对局控制台] 移动遇到主题据点，打开选择弹窗", city.name, city);
    this.setData({
      selectedCity: city,
      cityModalVisible: true,
      activeTab: "console"
    });
  },
  showLandedCityModal(diceResult, payload) {
    const city = this.buildCityStatByPosition(payload, diceResult && diceResult.position);
    if (!city) return;
    console.log("[对局控制台] 移动落到主题据点，打开选择弹窗", city.name, city);
    this.setData({
      selectedCity: city,
      cityModalVisible: true,
      activeTab: "console"
    });
  },
  refreshSelectedCity(data, cityId) {
    const selected = this.buildCityStatById(data, cityId);
    this.setData({
      selectedCity: selected,
      cityModalVisible: !!selected
    });
  },
  closeCityModal() {
    if (this.voiceAudio && this.voiceAudio.stop) {
      this.voiceAudio.stop();
    }
    this.setData({ cityModalVisible: false, selectedCity: null });
  },
  playSelectedCityVoice() {
    const city = this.data.selectedCity;
    if (!city || !city.sound_path) {
      wx.showToast({ title: `当前${this.data.labels.city || '景点'}暂无介绍语音`, icon: "none" });
      return;
    }
    this.playAudio(city.sound_path, `${city.name}${this.getLabel('cityIntroLabel', '城池介绍')}`);
  },
  drawEvent() {
    if (!this.data.room || !this.data.room.id) {
      console.log("[对局控制台] 对局数据未加载，无法抽事件");
      wx.showToast({ title: "对局数据加载中", icon: "none" });
      return;
    }
    if (this.data.gameFinished) {
      wx.showToast({ title: "本局已结束", icon: "none" });
      return;
    }
    const data = gameStore.drawEvent();
    if (!data) return;
    data.preview = data.image_path || "";
    const acquiredCharacters = data.acquired_characters || [];
    const eventCharacter = acquiredCharacters.length ? acquiredCharacters[0] : null;
    this.setData({ eventCard: data, eventCharacter, eventModalVisible: true });
    this.showEventCardEffects(data, eventCharacter);
    this.playEventVoiceWithCharacter(data, eventCharacter);
    this.loadRoom();
  },
  closeEventModal() {
    this.eventVoiceChainId += 1;
    this.eventVoiceChainPlaying = false;
    this.characterVoicePlaying = false;
    this.eventVoiceChainDoneCallback = null;
    if (this.voiceAudio && this.voiceAudio.stop) {
      this.voiceAudio.stop();
    }
    this.setData({ eventModalVisible: false, eventCharacter: null });
    if (this.pendingEncounterCity) {
      const city = this.pendingEncounterCity;
      this.pendingEncounterCity = null;
      if (this.cityPromptTimer) clearTimeout(this.cityPromptTimer);
      const openCity = () => {
        if (this.cityPromptTimer) clearTimeout(this.cityPromptTimer);
        this.cityPromptTimer = setTimeout(() => {
          this.openQueuedEncounterCity(city);
        }, 260);
      };
      if (this.eventVoiceChainPlaying || this.characterVoicePlaying) {
        this.eventVoiceChainDoneCallback = openCity;
        return;
      }
      this.cityPromptTimer = setTimeout(() => {
        this.openQueuedEncounterCity(city);
      }, 260);
    }
  },
  openEventCharacterDetail() {
    if (!this.data.eventCharacter) return;
    this.setData({ selectedCharacter: this.data.eventCharacter });
  },
  closeVictoryModal() {
    this.victoryDismissed = true;
    this.setData({ victoryModalVisible: false });
  },
  closeTurnSettlement() {
    this.setData({ turnSettlementVisible: false });
  },
  openPlayerDetail(e) {
    const playerId = Number(e.currentTarget.dataset.id || 0);
    const selected = (this.data.playerStats || []).find((item) => item.id === playerId) || null;
    if (!selected) return;
    this.setData({ selectedPlayer: selected, selectedCharacter: null });
  },
  closePlayerDetail() {
    this.setData({ selectedPlayer: null, selectedCharacter: null });
  },
  openCharacterDetail(e) {
    const playerId = Number(e.currentTarget.dataset.playerId || 0);
    const characterId = Number(e.currentTarget.dataset.characterId || 0);
    const player = (this.data.playerStats || []).find((item) => item.id === playerId) || this.data.selectedPlayer;
    const character = player && (player.ally_cards || []).find((item) => item.id === characterId);
    if (!character) return;
    this.setData({ selectedPlayer: player, selectedCharacter: character });
  },
  closeCharacterDetail() {
    this.setData({ selectedCharacter: null });
  },
  playCurrentEventVoice() {
    const eventCard = this.data.eventCard;
    if (!eventCard || !eventCard.sound_path) {
      console.log("[对局控制台] 当前事件没有语音", eventCard ? eventCard.title : "");
      wx.showToast({ title: "当前事件暂无语音", icon: "none" });
      return;
    }
    this.playAudio(eventCard.sound_path, eventCard.title);
  },
  playEventCharacterVoice() {
    const character = this.data.eventCharacter || this.data.selectedCharacter;
    if (!character) {
      wx.showToast({ title: `当前没有${this.getLabel('cardVoiceLabel', '人物语音')}`, icon: "none" });
      return;
    }
    this.playCharacterRewardVoice(character);
  },
  showLatestCityToast(data, successTitle) {
    const log = data && data.logs && data.logs[0];
    if (!log) {
      wx.showToast({ title: successTitle, icon: "none" });
      return;
    }
    const failedTypes = {
      city_buy_failed: "购买失败",
      city_toll_failed: "交费失败",
      city_upgrade_failed: "升级失败",
      city_attack_failed: "争夺失败"
    };
    if (failedTypes[log.log_type]) {
      wx.showModal({
        title: failedTypes[log.log_type],
        content: log.content || successTitle || "操作未完成，请查看回合记录。",
        showCancel: false,
        confirmText: "知道了"
      });
      return;
    }
    const toastMap = {
      city_buy: "购买成功",
      city_toll: `${this.data.labels.tollLabel || '通行费'}已支付`,
      city_toll_skip: "无需交费",
      city_toll_free: `已免${this.data.labels.tollLabel || '通行费'}`,
      city_upgrade: `${this.data.labels.city || '景点'}已升级`,
      city_attack_success: `${this.data.labels.contestAction || '争夺'}成功`,
      city_attack_double_toll: `已收双倍${this.data.labels.tollLabel || '通行费'}`
    };
    wx.showToast({ title: toastMap[log.log_type] || successTitle, icon: "none" });
  },
  findCityStat(cityId) {
    const id = Number(cityId || 0);
    if (this.data.selectedCity && Number(this.data.selectedCity.id) === id) {
      return this.data.selectedCity;
    }
    return (this.data.cityStats || []).find((item) => Number(item.id) === id) || null;
  },
  showCityBuyInsufficient(city) {
    const cityName = city && city.name ? city.name : `该${this.data.labels.city || '景点'}`;
    const theme = this.data.theme || {};
    const moneyLabel = this.data.labels.silverStat || "银两";
    this.playAudio(theme.buyInsufficientAudio || "https://cdn.example.com/cdn-upload-final/city-buy-insufficient-v2.wav", theme.buyInsufficientText || `${moneyLabel}不足无法购买${this.data.labels.city || '景点'}`);
    wx.showModal({
      title: `${moneyLabel}不足`,
      content: `${moneyLabel}不足，无法购买${cityName}。可点击关闭按钮继续游戏。`,
      showCancel: false,
      confirmText: "关闭"
    });
  },
  buyCity(e) {
    const cityId = Number(e.currentTarget.dataset.id || 0);
    console.log("[对局控制台] 尝试购买主题据点", cityId);
    const cityStat = this.findCityStat(cityId);
    if (cityStat && !cityStat.hasOwner && !cityStat.canBuy) {
      this.showCityBuyInsufficient(cityStat);
      return;
    }
    const data = gameStore.buyCity(cityId);
    if (data) {
      this.applyRoomData(data);
      if (this.data.cityModalVisible) this.refreshSelectedCity(data, cityId);
      this.showLatestCityToast(data, `${this.data.labels.city || '景点'}已更新`);
    }
  },
  payCityToll(e) {
    const cityId = Number(e.currentTarget.dataset.id || 0);
    console.log("[对局控制台] 记录主题据点收费", cityId);
    const data = gameStore.payCityToll(cityId);
    if (data) {
      this.applyRoomData(data);
      if (this.data.cityModalVisible) this.refreshSelectedCity(data, cityId);
      this.showLatestCityToast(data, "收费已记录");
    }
  },
  upgradeCity(e) {
    const cityId = Number(e.currentTarget.dataset.id || 0);
    console.log("[对局控制台] 尝试升级主题据点", cityId);
    const data = gameStore.upgradeCity(cityId);
    if (data) {
      this.applyRoomData(data);
      if (this.data.cityModalVisible) this.refreshSelectedCity(data, cityId);
      this.showLatestCityToast(data, `${this.data.labels.city || '景点'}已升级`);
    }
  },
  attackCity(e) {
    const cityId = Number(e.currentTarget.dataset.id || 0);
    console.log("[对局控制台] 尝试发起争夺", cityId);
    if (this.data.attackBusy) return;
    const result = gameStore.beginCityAttack(cityId);
    if (!result || !result.payload) return;
    this.applyRoomData(result.payload);
    if (!result.attack) {
      this.showLatestCityToast(result.payload, "无需争夺");
      return;
    }
    this.setData({
      cityModalVisible: false,
      selectedCity: null,
      attackModalVisible: true,
      attackStage: "process",
      currentAttack: result.attack,
      attackBusy: false
    });
    this.playAudio(result.attack.start_audio, this.getLabel('battleStartText', `${this.getLabel('contestAction', '争夺')}开始`));
  },
  rollAttackSide(e) {
    const side = e.currentTarget.dataset.side || "attacker";
    const result = gameStore.rollPendingCityAttack(side);
    if (!result || !result.attack) return;
    this.applyRoomData(result.payload);
    this.setData({ currentAttack: result.attack, attackStage: result.attack.readyToResolve ? "result" : "process" });
    if (result.attack.readyToResolve) {
      this.playAudio(result.attack.outcome === "success" ? result.attack.success_audio : result.attack.failed_audio, result.attack.outcome === "success" ? `${this.getLabel('contestAction', '争夺')}成功` : `${this.getLabel('contestAction', '争夺')}失败`);
      this.setData({ attackBusy: true });
      if (this.attackResolveTimer) clearTimeout(this.attackResolveTimer);
      this.attackResolveTimer = setTimeout(() => {
        const resolved = gameStore.resolveCityAttack();
        if (resolved && resolved.payload) {
          this.applyRoomData(resolved.payload);
          this.showLatestCityToast(resolved.payload, "争夺已结算");
        }
        this.setData({ attackBusy: false });
      }, 1600);
    }
  },
  closeAttackModal() {
    if (this.data.attackBusy) {
      wx.showToast({ title: "争夺结算中", icon: "none" });
      return;
    }
    this.setData({ attackModalVisible: false, currentAttack: null, attackStage: "" });
  }
});

