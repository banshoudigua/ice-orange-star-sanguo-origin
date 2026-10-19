const gameData = require("./gameData");
const themeManager = require("../themes/themeManager");

const STORAGE_KEY = "sanguo_origin_current_game";
const BOARD_LOOP_SIZE = 30;
const LOOP_REWARD_SILVER = 3;
const ATTACK_ASSET_BASE = "https://cdn.example.com/cdn-upload-final";
const STAT_LABELS = {
  grain: "粮草",
  prestige: "声望",
  battle: "战功",
  silver: "银两",
  paused_turns: "暂停",
  redraw_tokens: "重抽",
  guard_tokens: "防守令",
  toll_free_tokens: "免税",
  tactic_tokens: "计策",
  siege_tokens: "攻城令",
  move_adjust: "移动修正"
};

function getCityOwnerWord(game) {
  return getThemeWord(game, "cityOwner", "城主");
}

function getOwnerDisplayWord(game) {
  return getThemeWord(game, "ownerDisplay", "拥有者");
}

function getTollWord(game) {
  return getThemeWord(game, "tollLabel", "过路费");
}

function getAttackActionWord(game) {
  return getThemeWord(game, "attackAction", "攻城");
}

function getContestActionWord(game) {
  return getThemeWord(game, "contestAction", "争夺");
}

function getCharacterGainWord(game) {
  return getThemeWord(game, "characterGain", "人物卡");
}

function getStatWord(game, key, fallback) {
  return getThemeWord(game, key, fallback);
}

function getFieldLabel(game, field) {
  const fieldThemeKeys = {
    grain: "grainStat",
    silver: "silverStat",
    prestige: "prestigeStat",
    battle: "battleStat",
    position: "positionStat"
  };
  return getThemeWord(game, fieldThemeKeys[field], STAT_LABELS[field] || field);
}

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomItem(list) {
  if (!list || !list.length) return null;
  return clone(list[Math.floor(Math.random() * list.length)]);
}

function getThemeIdFromGame(game) {
  return (game && game.theme_id) || themeManager.DEFAULT_THEME_ID;
}

function getGameThemeData(game) {
  return gameData.getThemeData(getThemeIdFromGame(game));
}

function getGameThemeLabels(game) {
  return gameData.getThemeLabels(getThemeIdFromGame(game));
}

function getThemeWord(game, key, fallback) {
  return getGameThemeLabels(game)[key] || fallback;
}

function saveGame(game) {
  wx.setStorageSync(STORAGE_KEY, game);
  return game;
}

function getGame() {
  return wx.getStorageSync(STORAGE_KEY) || null;
}

function clearGame() {
  wx.removeStorageSync(STORAGE_KEY);
}

function addLog(game, playerId, logType, content, data) {
  const logs = game.logs || [];
  logs.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    room_id: game.room.id,
    player_id: playerId || null,
    log_type: logType,
    content,
    data_json: JSON.stringify(data || {}),
    created_at: now()
  });
  game.logs = logs.slice(0, 50);
}

function getVictoryLabel(rule, game) {
  const labels = {
    city: getThemeWord(game, "city", "城池"),
    flight_finish_4: "4 枚棋子到达终点",
    flight_finish_2: "2 枚棋子到达终点",
    silver: "银两",
    prestige: "声望",
    grain: "粮草",
    ally: getThemeWord(game, "character", "武将")
  };
  return labels[rule && rule.type] || getThemeWord(game, "city", "城池");
}

function getPlayerById(game, playerId) {
  return (game.players || []).find((player) => player.id === playerId) || null;
}

function normalizePlayerNumber(value, fallback) {
  const next = Number(value != null ? value : fallback);
  return Number.isFinite(next) ? next : Number(fallback || 0);
}

function signedNumber(value) {
  const next = Number(value || 0);
  return next > 0 ? `+${next}` : String(next);
}

function normalizeBoardPosition(position) {
  const value = normalizePlayerNumber(position, 0);
  if (value <= 0) return 0;
  return ((value - 1) % BOARD_LOOP_SIZE) + 1;
}

function isFlightGame(game) {
  return getGameThemeData(game).gameMode === "flight";
}

function getFlightConfig(game) {
  const themeRules = getGameThemeData(game).flightRules || {};
  const config = (game && game.flight_config) || {};
  return {
    pieceCount: Math.max(1, Math.min(Number(config.piece_count || themeRules.pieceCount || 4), 4)),
    startMode: config.start_mode || "six",
    collisionMode: config.collision_mode || "off",
    spotMode: config.spot_mode || "mixed"
  };
}

function canFlightTakeOff(game, dice) {
  const mode = getFlightConfig(game).startMode;
  if (mode === "any") return true;
  if (mode === "six_or_one") return dice === 6 || dice === 1;
  return dice === 6;
}

function makeFlightPieces(pieceCount) {
  const pieces = [];
  for (let i = 0; i < pieceCount; i += 1) {
    pieces.push({
      index: i,
      name: `${i + 1}号机`,
      status: "airport",
      status_text: "机场",
      position_text: "机场等待",
      updated_at: now()
    });
  }
  return pieces;
}

function initFlightState(game) {
  if (!game || !isFlightGame(game)) return;
  const config = getFlightConfig(game);
  const colorRules = (getGameThemeData(game).flightRules || {}).colors || [];
  (game.players || []).forEach((player, index) => {
    const color = colorRules[index] || {};
    player.flight_color = color.key || `seat-${index + 1}`;
    player.flight_color_name = color.name || `${index + 1}号队`;
    player.flight_pieces = makeFlightPieces(config.pieceCount);
    player.finished_pieces = 0;
    player.passport_stamps = 0;
  });
  game.flight_state = {
    consecutive_sixes: 0,
    last_player_id: null,
    last_roll: 0
  };
}

function getFlightPieceStatusText(status) {
  const map = {
    airport: "机场",
    active: "飞行中",
    final: "终点跑道",
    finished: "已到终点"
  };
  return map[status] || "机场";
}

function countFlightFinishedPieces(player) {
  return ((player && player.flight_pieces) || []).filter((piece) => piece.status === "finished").length;
}

function resetCurrentFlightPieces(game, player) {
  if (!player || !Array.isArray(player.flight_pieces)) return 0;
  let count = 0;
  player.flight_pieces.forEach((piece) => {
    if (piece.status !== "finished") {
      piece.status = "airport";
      piece.status_text = "机场";
      piece.position_text = "连续三个 6 返回机场";
      piece.updated_at = now();
      count += 1;
    }
  });
  player.finished_pieces = countFlightFinishedPieces(player);
  return count;
}

function applyPositionChange(player, delta, summaries) {
  const oldPosition = normalizeBoardPosition(player.position);
  const moveDelta = Number(delta || 0);
  const rawNextPosition = Math.max(0, oldPosition + moveDelta);
  const nextPosition = normalizeBoardPosition(rawNextPosition);
  player.position = nextPosition;
  if (summaries && moveDelta !== 0) summaries.push(`位置 ${oldPosition} → ${nextPosition}`);
  if (moveDelta > 0) {
    const loopCount = Math.floor((oldPosition + moveDelta - 1) / BOARD_LOOP_SIZE);
    if (loopCount > 0) {
      const reward = loopCount * LOOP_REWARD_SILVER;
      player.silver = Math.max(0, normalizePlayerNumber(player.silver, 0) + reward);
      if (summaries) summaries.push(`经过起点 ${loopCount} 次，银两 +${reward}`);
      return { oldPosition, nextPosition, rawNextPosition, loopCount, reward };
    }
  }
  return { oldPosition, nextPosition, rawNextPosition, loopCount: 0, reward: 0 };
}

function applyStatChanges(player, changes, summaries, game) {
  if (!player || !changes) return;
  const minZeroFields = ["grain", "prestige", "battle", "position", "silver", "paused_turns", "redraw_tokens", "guard_tokens", "toll_free_tokens", "tactic_tokens", "siege_tokens"];
  Object.keys(changes).forEach((field) => {
    if (field === "position") {
      applyPositionChange(player, changes[field], summaries);
      return;
    }
    const current = normalizePlayerNumber(player[field], 0);
    const changeValue = Number(changes[field] || 0);
    const value = current + changeValue;
    const nextValue = minZeroFields.indexOf(field) === -1 ? value : Math.max(0, value);
    player[field] = nextValue;
    if (summaries && changeValue !== 0) {
      const actualChange = nextValue - current;
      if (actualChange !== 0) {
        summaries.push(`${getFieldLabel(game, field)} ${signedNumber(actualChange)}`);
      } else if (changeValue < 0 && minZeroFields.indexOf(field) !== -1) {
        summaries.push(`${getFieldLabel(game, field)}不足，保持 0`);
      }
    }
  });
}

function hasEnough(player, changes) {
  if (!player || !changes) return false;
  const fields = Object.keys(changes);
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const value = Number(changes[field] || 0);
    if (value < 0 && normalizePlayerNumber(player[field], 0) < Math.abs(value)) return false;
  }
  return true;
}

function getPlayerAllies(player) {
  if (!player.allies) player.allies = [];
  return player.allies;
}

function findAlly(player, name) {
  const allies = getPlayerAllies(player);
  return allies.find((item) => item.name === name) || null;
}

function findAllyByFaction(player, faction) {
  const allies = getPlayerAllies(player);
  return allies.find((item) => item.faction === faction) || null;
}

function findAllyByThreshold(player, field, value) {
  const allies = getPlayerAllies(player);
  return allies.find((item) => normalizePlayerNumber(item[field], 0) >= Number(value || 0)) || null;
}

function drawCharacter(filter, excludedIds) {
  const source = gameData.characters || [];
  const rules = filter || {};
  const excluded = excludedIds || [];
  const list = source.filter((item) => {
    if (rules.tier && item.tier !== rules.tier) return false;
    if (rules.faction && item.faction !== rules.faction) return false;
    return true;
  });
  const matchedList = list.length ? list : source;
  const availableList = matchedList.filter((item) => excluded.indexOf(item.id) === -1);
  return randomItem(availableList);
}

function drawCharacterByTheme(themeId, filter, excludedIds) {
  const source = gameData.getThemeData(themeId).characters || [];
  const rules = filter || {};
  const excluded = excludedIds || [];
  const list = source.filter((item) => {
    if (rules.tier && item.tier !== rules.tier) return false;
    if (rules.faction && item.faction !== rules.faction) return false;
    return true;
  });
  const matchedList = list.length ? list : source;
  const availableList = matchedList.filter((item) => excluded.indexOf(item.id) === -1);
  return randomItem(availableList);
}

function getAllOwnedCharacterIds(game) {
  const ids = [];
  (game.players || []).forEach((player) => {
    getPlayerAllies(player).forEach((ally) => {
      if (ids.indexOf(ally.id) === -1) ids.push(ally.id);
    });
  });
  return ids;
}

function pushCardEffect(effects, character, title, desc) {
  if (!effects || !character) return;
  effects.push({
    id: `${character.id}-${Date.now()}-${effects.length}`,
    name: character.name,
    title: title || character.skill_name || "卡片效果生效",
    desc: desc || character.skill_desc || "",
    image_path: character.image_path || "",
    tier: character.tier || "",
    faction: character.faction || "",
    role_type: character.role_type || ""
  });
}

function applyCharacterJoin(game, player, filter, summaries, activatedCardEffects) {
  if (!player) return null;
  const allies = getPlayerAllies(player);
  const ownedIds = getAllOwnedCharacterIds(game);
  const character = drawCharacterByTheme(getThemeIdFromGame(game), filter, ownedIds);
  if (!character) {
    summaries.push(`可抽取的${getThemeWord(game, "character", "人物卡")}已被玩家获得，改为银两 +2`);
    applyStatChanges(player, { silver: 2 });
    return null;
  }
  if (allies.find((item) => item.id === character.id)) {
    summaries.push(`${character.name} 已被当前玩家收藏，改为银两 +2`);
    applyStatChanges(player, { silver: 2 });
    return null;
  }
  allies.push(character);
  summaries.push(`获得${getCharacterGainWord(game)}：${character.name}`);
  // 主题卡片最高属性会立刻给一点小奖励，后续事件也会继续检查这些属性。
  if (normalizePlayerNumber(character.force_value, 0) >= 90) {
    applyStatChanges(player, { battle: 1 }, null, game);
    summaries.push(`${character.name}${getStatWord(game, "forceStat", "武力")}出众，${getFieldLabel(game, "battle")} +1`);
    pushCardEffect(activatedCardEffects, character, `${getStatWord(game, "forceStat", "武力")}出众`, `${getFieldLabel(game, "battle")} +1`);
  }
  if (normalizePlayerNumber(character.strategy_value, 0) >= 90) {
    applyStatChanges(player, { prestige: 1 }, null, game);
    summaries.push(`${character.name}${getStatWord(game, "strategyStat", "智谋")}出众，${getFieldLabel(game, "prestige")} +1`);
    pushCardEffect(activatedCardEffects, character, `${getStatWord(game, "strategyStat", "智谋")}出众`, `${getFieldLabel(game, "prestige")} +1`);
  }
  if (normalizePlayerNumber(character.fame_value, 0) >= 90) {
    applyStatChanges(player, { silver: 1 }, null, game);
    summaries.push(`${character.name}${getStatWord(game, "fameStat", "名望")}出众，${getFieldLabel(game, "silver")} +1`);
    pushCardEffect(activatedCardEffects, character, `${getStatWord(game, "fameStat", "名望")}出众`, `${getFieldLabel(game, "silver")} +1`);
  }
  if (normalizePlayerNumber(character.command_value, 0) >= 90) {
    applyStatChanges(player, { move_adjust: 1 });
    summaries.push(`${character.name}${getStatWord(game, "commandStat", "统率")}出众，下次移动 +1`);
    pushCardEffect(activatedCardEffects, character, `${getStatWord(game, "commandStat", "统率")}出众`, "下次移动 +1");
  }
  return character;
}

function playerOwnsCity(game, playerId) {
  return (game.cities || []).some((city) => city.owner_id === playerId);
}

function countOwnedCities(game, playerId) {
  return (game.cities || []).filter((city) => city.owner_id === playerId).length;
}

function getBoardSlot(position) {
  return normalizeBoardPosition(position);
}

function getPassedCities(game, oldPosition, rawNextPosition) {
  const cities = game.cities || [];
  const passed = [];
  const start = normalizePlayerNumber(oldPosition, 0);
  const end = normalizePlayerNumber(rawNextPosition, start);
  for (let step = start + 1; step <= end; step += 1) {
    const slot = getBoardSlot(step);
    const city = cities.find((item) => Number(item.position) === slot);
    if (city && !passed.find((item) => item.id === city.id)) {
      passed.push({
        id: city.id,
        name: city.name,
        position: city.position,
        owner_id: city.owner_id || null,
        owner_name: city.owner_name || "",
        toll: city.toll,
        level: city.level
      });
    }
  }
  return passed;
}

function formatPassedCity(game, city, currentPlayerId, finalPosition) {
  const action = Number(city.position) === Number(finalPosition) ? "到达" : "路过";
  if (!city.owner_id) {
    return action === "到达"
      ? `${action}${city.name}：尚未被玩家购买，可在弹窗中选择购买`
      : `${action}${city.name}：尚未被玩家购买，本次无需交通行费`;
  }
  if (city.owner_id === currentPlayerId) {
    return `${action}${city.name}：这是自己的${getThemeWord(game, "city", "城池")}，无需交通行费`;
  }
  return `${action}${city.name}：${getCityOwnerWord(game)}为${city.owner_name || "其他玩家"}，${getTollWord(game)} ${city.toll || 0} 银两，可选择交费或${getAttackActionWord(game)}`;
}

function getVictoryValue(game, player, type) {
  if (!player) return 0;
  if (type === "flight_finish_4" || type === "flight_finish_2") return countFlightFinishedPieces(player);
  if (type === "city") return countOwnedCities(game, player.id);
  if (type === "ally") return getPlayerAllies(player).length;
  return normalizePlayerNumber(player[type], 0);
}

function getLeaderBySilver(game) {
  const players = game.players || [];
  if (!players.length) return null;
  let leader = players[0];
  for (let i = 1; i < players.length; i += 1) {
    if (normalizePlayerNumber(players[i].silver, 0) > normalizePlayerNumber(leader.silver, 0)) {
      leader = players[i];
    }
  }
  return leader;
}

function finishGameBySilver(game, reason) {
  if (!game || !game.room || game.room.status === "finished") return null;
  const leader = getLeaderBySilver(game);
  if (!leader) return null;
  const silver = normalizePlayerNumber(leader.silver, 0);
  game.room.status = "finished";
  updateStep(game, "最终结算");
  game.winner = {
    player_id: leader.id,
    player_name: leader.player_name,
    victory_type: "silver_final",
    victory_label: "最终银两",
    target: silver,
    value: silver,
    reason: reason || "回合数结束，按银两最多判定胜利"
  };
  addLog(game, leader.id, "victory", `最终结算：${leader.player_name} 银两最多（${silver} 两），获得最终胜利`, game.winner);
  return game.winner;
}

function checkVictory(game) {
  if (!game || !game.room || game.room.status === "finished") return null;
  const rule = game.victory_rule || { type: "city", target: 3 };
  const target = Math.max(1, Number(rule.target || 1));
  for (let i = 0; i < (game.players || []).length; i += 1) {
    const player = game.players[i];
    const value = getVictoryValue(game, player, rule.type);
    if (value >= target) {
      game.room.status = "finished";
      updateStep(game, "胜利结算");
      game.winner = {
        player_id: player.id,
        player_name: player.player_name,
        victory_type: rule.type,
        victory_label: getVictoryLabel(rule, game),
        target,
        value
      };
      addLog(game, player.id, "victory", `${player.player_name} 达成${getVictoryLabel(rule, game)}目标：${value}/${target}，获得最终胜利`, game.winner);
      return game.winner;
    }
  }
  return null;
}

function buildTurnSettlement(game, endedPlayerId, nextPlayerId, finished) {
  const endedPlayer = getPlayerById(game, endedPlayerId);
  const nextPlayer = nextPlayerId ? getPlayerById(game, nextPlayerId) : null;
  const players = game.players || [];
  const silverLeader = getLeaderBySilver(game);
  const ranking = players.slice().sort((a, b) => normalizePlayerNumber(b.silver, 0) - normalizePlayerNumber(a.silver, 0));
  const rows = ranking.map((player, index) => ({
    id: player.id,
    rank: index + 1,
    name: player.player_name,
    silver: normalizePlayerNumber(player.silver, 0),
    prestige: normalizePlayerNumber(player.prestige, 0),
    grain: normalizePlayerNumber(player.grain, 0),
    battle: normalizePlayerNumber(player.battle, 0),
    cityCount: countOwnedCities(game, player.id),
    allyCount: getPlayerAllies(player).length
  }));
  return {
    id: Date.now(),
    title: finished ? "最终回合结算" : "本轮结束结算",
    endedPlayerName: endedPlayer ? endedPlayer.player_name : "当前玩家",
    nextPlayerName: nextPlayer ? nextPlayer.player_name : "",
    round: game.room.current_round,
    finished: !!finished,
    winnerName: game.winner ? game.winner.player_name : "",
    silverLeaderName: silverLeader ? silverLeader.player_name : "",
    silverLeaderValue: silverLeader ? normalizePlayerNumber(silverLeader.silver, 0) : 0,
    summary: finished
      ? `游戏结束，按银两最多结算：${silverLeader ? silverLeader.player_name : "暂无玩家"} 领先。`
      : `本轮已结算，下一位行动：${nextPlayer ? nextPlayer.player_name : "待定"}。`,
    rows
  };
}

function applyEventRules(game, event, currentPlayer) {
  const rules = event.effect_rules || {};
  const summaries = [];
  const acquiredCharacters = [];
  const activatedCardEffects = [];
  if (!currentPlayer) return { summaries, acquiredCharacters, activatedCardEffects };

  if (rules.fallbackCost && normalizePlayerNumber(currentPlayer[rules.fallbackCost.from], 0) <= 0) {
    const current = Object.assign({}, rules.current || {});
    delete current[rules.fallbackCost.from];
    applyStatChanges(currentPlayer, current, summaries, game);
    const changes = {};
    changes[rules.fallbackCost.to] = -Number(rules.fallbackCost.amount || 0);
    applyStatChanges(currentPlayer, changes, summaries, game);
    summaries.push(`${getFieldLabel(game, rules.fallbackCost.from)}不足，改扣${getFieldLabel(game, rules.fallbackCost.to)}`);
  } else {
    applyStatChanges(currentPlayer, rules.current, summaries, game);
  }

  if (rules.all) {
    (game.players || []).forEach((player) => applyStatChanges(player, rules.all, player.id === currentPlayer.id ? summaries : null, game));
    summaries.push("已结算全员影响");
  }

  if (rules.currentIfEnough && hasEnough(currentPlayer, rules.currentIfEnough)) {
    applyStatChanges(currentPlayer, rules.currentIfEnough, summaries, game);
    summaries.push("资源足够，已执行进阶结算");
  }

  if (rules.costOrPause) {
    const cost = { silver: -Number(rules.costOrPause.silver || 0) };
    if (hasEnough(currentPlayer, cost)) {
      applyStatChanges(currentPlayer, cost, summaries, game);
      summaries.push(`已支付 ${rules.costOrPause.silver} 银两`);
    } else {
      applyStatChanges(currentPlayer, { paused_turns: Number(rules.costOrPause.paused_turns || 1) }, summaries, game);
      summaries.push("银两不足，已记录暂停行动");
    }
  }

  if (rules.thresholdChoice) {
    const value = normalizePlayerNumber(currentPlayer[rules.thresholdChoice.field], 0);
    const changes = value >= Number(rules.thresholdChoice.value || 0) ? rules.thresholdChoice.pass : rules.thresholdChoice.fail;
    applyStatChanges(currentPlayer, changes, summaries, game);
    summaries.push("已按当前数值门槛完成结算");
  }

  if (rules.statThresholdBonus) {
    const value = normalizePlayerNumber(currentPlayer[rules.statThresholdBonus.field], 0);
    if (value >= Number(rules.statThresholdBonus.value || 0)) {
      applyStatChanges(currentPlayer, rules.statThresholdBonus.changes, summaries, game);
      summaries.push("触发玩家数值加成");
    }
  }

  if (rules.allyThresholdBonus) {
    const ally = findAllyByThreshold(currentPlayer, rules.allyThresholdBonus.field, rules.allyThresholdBonus.value);
    if (ally) {
    applyStatChanges(currentPlayer, rules.allyThresholdBonus.changes, summaries, game);
    summaries.push(`触发${getThemeWord(game, "ally", "随从")}属性加成`);
      pushCardEffect(activatedCardEffects, ally, ally.skill_name || `${getThemeWord(game, "character", "武将")}效果生效`, ally.skill_desc || "属性加成已触发");
    }
  }

  if (rules.namedAllyBonus) {
    const ally = findAlly(currentPlayer, rules.namedAllyBonus.name);
    if (ally) {
    applyStatChanges(currentPlayer, rules.namedAllyBonus.changes, summaries, game);
    summaries.push(`触发 ${rules.namedAllyBonus.name}${getThemeWord(game, "ally", "随从")}加成`);
      pushCardEffect(activatedCardEffects, ally, ally.skill_name || `${rules.namedAllyBonus.name}效果生效`, ally.skill_desc || "指定卡片加成已触发");
    }
  }

  if (rules.allyFactionBonus) {
    const ally = findAllyByFaction(currentPlayer, rules.allyFactionBonus.faction);
    if (ally) {
    applyStatChanges(currentPlayer, rules.allyFactionBonus.changes, summaries, game);
    summaries.push(`触发 ${rules.allyFactionBonus.faction}${getThemeWord(game, "ally", "随从")}加成`);
      pushCardEffect(activatedCardEffects, ally, ally.skill_name || `${rules.allyFactionBonus.faction}加成`, ally.skill_desc || "分类卡片加成已触发");
    }
  }

  if (rules.drawCharacter) {
    const character = applyCharacterJoin(game, currentPlayer, rules.drawCharacter, summaries, activatedCardEffects);
    if (character) acquiredCharacters.push(character);
  }

  if (rules.allyCountBonus) {
    const count = getPlayerAllies(currentPlayer).length;
    if (count >= Number(rules.allyCountBonus.value || 0)) {
      applyStatChanges(currentPlayer, rules.allyCountBonus.changes, summaries, game);
      summaries.push(`触发${getThemeWord(game, "character", "武将")}数量加成`);
    }
  }

  if (rules.namedAllyDraw && findAlly(currentPlayer, rules.namedAllyDraw.name)) {
    const character = applyCharacterJoin(game, currentPlayer, { tier: rules.namedAllyDraw.tier }, summaries, activatedCardEffects);
    if (character) acquiredCharacters.push(character);
  }

  if (rules.drawCharacterByStat) {
    const value = normalizePlayerNumber(currentPlayer[rules.drawCharacterByStat.field], 0);
    const tier = value >= Number(rules.drawCharacterByStat.value || 0) ? rules.drawCharacterByStat.passTier : rules.drawCharacterByStat.failTier;
    const character = applyCharacterJoin(game, currentPlayer, { tier }, summaries, activatedCardEffects);
    if (character) acquiredCharacters.push(character);
  }

  if (rules.cityOwnerBonus && playerOwnsCity(game, currentPlayer.id)) {
    applyStatChanges(currentPlayer, rules.cityOwnerBonus.changes, summaries, game);
    summaries.push(`触发${getThemeWord(game, "city", "城池")}${getOwnerDisplayWord(game)}加成`);
  }

  if (rules.noCityCurrent && !playerOwnsCity(game, currentPlayer.id)) {
    applyStatChanges(currentPlayer, rules.noCityCurrent, summaries, game);
    summaries.push(`当前玩家暂无${getThemeWord(game, "city", "城池")}，已补偿结算`);
  }

  if (rules.cityIncome) {
    (game.cities || []).forEach((city) => {
      const owner = city.owner_id ? getPlayerById(game, city.owner_id) : null;
      if (owner) applyStatChanges(owner, rules.cityIncome);
    });
    summaries.push(`已给${getThemeWord(game, "city", "城池")}${getOwnerDisplayWord(game)}结算收益`);
  }

  return { summaries, acquiredCharacters, activatedCardEffects };
}

function drawRandomEventForCurrent(game, currentPlayer) {
  const events = getGameThemeData(game).events || [];
  if (!events.length || !currentPlayer) return null;
  const event = clone(events[Math.floor(Math.random() * events.length)]);
  const ruleResult = applyEventRules(game, event, currentPlayer);
  const summaries = ruleResult.summaries || [];
  event.preview = event.image_path || "";
  event.auto_triggered = true;
  event.settlement_desc = summaries.length ? summaries.join("；") : "本事件仅提示线下选择，无额外自动数值变化";
  event.acquired_characters = ruleResult.acquiredCharacters || [];
  event.activated_card_effects = ruleResult.activatedCardEffects || [];
  return event;
}

function getCharacterSlot(position) {
  const slots = gameData.characterSlots || [];
  const slotPosition = normalizeBoardPosition(position);
  return slots.find((item) => Number(item.position) === slotPosition) || null;
}

function getCharacterSlotByTheme(game, position) {
  const slots = getGameThemeData(game).characterSlots || [];
  const slotPosition = normalizeBoardPosition(position);
  return slots.find((item) => Number(item.position) === slotPosition) || null;
}

function buildCharacterSlotEvent(game, currentPlayer, position) {
  const slot = getCharacterSlotByTheme(game, position);
  if (!slot || !currentPlayer) return null;
  const summaries = [];
  const activatedCardEffects = [];
  const character = applyCharacterJoin(game, currentPlayer, { tier: slot.tier }, summaries, activatedCardEffects);
  const preview = character && character.image_path ? character.image_path : `${ATTACK_ASSET_BASE}/event-7.png`;
  const slotSoundPath = getThemeIdFromGame(game) === "chaoshan-travel" ? "" : "https://cdn.example.com/cdn-upload-final/event-7.mp3";
  return {
    id: `character-slot-${slot.id}-${Date.now()}`,
      title: `${slot.name}：抽${getThemeWord(game, "character", "人物卡")}`,
      event_type: `${getThemeWord(game, "character", "人物卡")}区域`,
    rarity: slot.tier || "T2",
    trigger_condition: `落到第 ${slot.position} 格`,
      effect_desc: slot.desc || `落到${getThemeWord(game, "character", "人物卡")}区域，自动抽取一张${getThemeWord(game, "character", "人物卡")}加入当前玩家${getThemeWord(game, "ally", "随从")}。`,
      board_action: `系统结算：自动抽取${getThemeWord(game, "character", "人物卡")}；若已经拥有同一卡片，则改为银两补偿。`,
    image_path: preview,
    preview,
    sound_path: slotSoundPath,
    effect_rules: {},
    settlement_desc: summaries.length ? summaries.join("；") : `${getThemeWord(game, "character", "人物卡")}池暂未抽到新${getThemeWord(game, "ally", "随从")}`,
    acquired_characters: character ? [character] : [],
    activated_card_effects: activatedCardEffects,
    auto_triggered: true,
    character_slot: slot
  };
}

function drawMovementEvent(game, currentPlayer, position) {
  const characterSlotEvent = buildCharacterSlotEvent(game, currentPlayer, position);
  if (characterSlotEvent) return characterSlotEvent;
  return drawRandomEventForCurrent(game, currentPlayer);
}

function normalizePlayers(params) {
  const source = Array.isArray(params.players) && params.players.length ? params.players : [];
  const count = Math.max(1, Math.min(Number(params.playerCount || source.length || 1), 8));
  const factions = ["汉室", "群雄", "黄巾", "江东", "诸侯", "中立", "汉室", "群雄"];
  const players = [];
  for (let i = 0; i < count; i += 1) {
    const item = source[i] || {};
    players.push({
      id: i + 1,
      room_id: 1,
      user_id: null,
      player_name: item.playerName || item.player_name || `玩家${i + 1}`,
      faction: item.faction || factions[i] || "群雄",
      seat_no: i + 1,
      grain: Number(item.grain != null ? item.grain : 3),
      silver: Number(item.silver != null ? item.silver : 5),
      prestige: Number(item.prestige != null ? item.prestige : 0),
      battle: Number(item.battle != null ? item.battle : 0),
      position: Number(item.position != null ? item.position : 0),
      move_adjust: Number(item.move_adjust != null ? item.move_adjust : 0),
      paused_turns: Number(item.paused_turns != null ? item.paused_turns : 0),
      redraw_tokens: Number(item.redraw_tokens != null ? item.redraw_tokens : 0),
      guard_tokens: Number(item.guard_tokens != null ? item.guard_tokens : 0),
      toll_free_tokens: Number(item.toll_free_tokens != null ? item.toll_free_tokens : 0),
      tactic_tokens: Number(item.tactic_tokens != null ? item.tactic_tokens : 0),
      siege_tokens: Number(item.siege_tokens != null ? item.siege_tokens : 0),
      allies: Array.isArray(item.allies) ? item.allies : [],
      status: "ready",
      created_at: now()
    });
  }
  return players;
}

function createGame(params) {
  const timestamp = now();
  const players = normalizePlayers(params || {});
  const maxRound = Math.max(1, Math.min(Number(params.maxRound || 6), 99));
  const themeId = params.themeId || themeManager.getSelectedThemeId();
  const themeData = gameData.getThemeData(themeId);
  const game = {
    theme_id: themeId,
    room: {
      id: 1,
      host_user_id: null,
      status: "playing",
      current_round: 1,
      max_round: maxRound,
      current_player_id: players[0] ? players[0].id : null,
      dice_mode: params.diceMode === "manual" ? "manual" : "auto",
      current_step: "玩家行动",
      turn_action_done: false,
      created_at: timestamp,
      updated_at: timestamp
    },
    victory_rule: {
      type: params.victoryType || "city",
      target: Math.max(1, Math.min(Number(params.victoryTarget || 3), 99))
    },
    players,
    cities: clone(themeData.cities || []),
    logs: []
  };
  if ((themeData.gameMode || "") === "flight") {
    const flightOptions = (params && params.flightOptions) || {};
    game.flight_config = {
      piece_count: Math.max(1, Math.min(Number(flightOptions.pieceCount || 4), 4)),
      start_mode: flightOptions.startMode || "six",
      collision_mode: flightOptions.collisionMode || "off",
      spot_mode: flightOptions.spotMode || "mixed"
    };
    initFlightState(game);
  }
  addLog(game, game.room.current_player_id, "room_create", `本地新局已创建，${players.length} 名玩家入席，共 ${maxRound} 回合`, {
    playerCount: players.length,
    maxRound,
    victoryRule: game.victory_rule,
    themeId
  });
  return saveGame(game);
}

function getPayload() {
  const game = getGame();
  if (!game) return null;
  return clone(game);
}

function updateStep(game, step) {
  game.room.current_step = step || "玩家行动";
  game.room.updated_at = now();
}

function buildFlightRollPrompt(game, player, dice, thirdSixResetCount) {
  if (!player) return "";
  if (thirdSixResetCount > 0) {
    return `连续三个 6，${player.player_name} 除已到终点外的 ${thirdSixResetCount} 枚棋子全部返回机场。`;
  }
  const pieces = player.flight_pieces || [];
  const airportCount = pieces.filter((piece) => piece.status === "airport").length;
  const activeCount = pieces.filter((piece) => piece.status === "active" || piece.status === "final").length;
  const finishedCount = pieces.filter((piece) => piece.status === "finished").length;
  const tips = [`掷出 ${dice} 点`];
  if (airportCount && canFlightTakeOff(game, dice)) tips.push("可以选择一枚机场棋子起飞");
  if (airportCount && !canFlightTakeOff(game, dice)) tips.push("本点数不能起飞");
  if (activeCount) tips.push(`可选择一枚已起飞棋子前进 ${dice} 格`);
  if (dice === 6) tips.push("掷到 6，可按规则再掷一次");
  tips.push("落到同色格可跳跃，落到虚线入口可飞行");
  tips.push("终点必须刚好到达，点数超过时请从终点倒着走");
  if (finishedCount) tips.push(`已有 ${finishedCount} 枚棋子到达终点`);
  return tips.join("；");
}

function rollFlightDice(game, fixedTotal) {
  const forced = Number(fixedTotal || 0);
  const dice = forced >= 1 && forced <= 6 ? forced : Math.floor(Math.random() * 6) + 1;
  const currentPlayer = getPlayerById(game, game.room.current_player_id);
  if (!game.flight_state) game.flight_state = { consecutive_sixes: 0, last_player_id: null, last_roll: 0 };
  if (game.flight_state.last_player_id !== game.room.current_player_id) {
    game.flight_state.consecutive_sixes = 0;
  }
  game.flight_state.last_player_id = game.room.current_player_id;
  game.flight_state.last_roll = dice;
  if (dice === 6) {
    game.flight_state.consecutive_sixes = normalizePlayerNumber(game.flight_state.consecutive_sixes, 0) + 1;
  } else {
    game.flight_state.consecutive_sixes = 0;
  }
  let resetCount = 0;
  if (game.flight_state.consecutive_sixes >= 3) {
    resetCount = resetCurrentFlightPieces(game, currentPlayer);
    game.flight_state.consecutive_sixes = 0;
  }
  const result = {
    diceCount: 1,
    sides: 6,
    rolls: [dice],
    total: dice,
    rollsText: String(dice),
    moveTotal: dice,
    flight_mode: true,
    can_take_off: canFlightTakeOff(game, dice),
    extra_roll: dice === 6 && resetCount === 0,
    consecutive_sixes: normalizePlayerNumber(game.flight_state.consecutive_sixes, 0),
    third_six_reset: resetCount > 0,
    reset_piece_count: resetCount,
    flight_prompt: buildFlightRollPrompt(game, currentPlayer, dice, resetCount),
    collision_enabled: getFlightConfig(game).collisionMode === "on",
    spot_mode: getFlightConfig(game).spotMode
  };
  updateStep(game, "飞行棋掷骰");
  markTurnActionDone(game);
  addLog(game, game.room.current_player_id, "flight_dice_roll", `${forced >= 1 && forced <= 6 ? "线下点数" : "系统掷骰"}：${dice} 点。${result.flight_prompt}`, result);
  checkVictory(game);
  saveGame(game);
  return result;
}

function markTurnActionDone(game) {
  if (!game || !game.room) return;
  game.room.turn_action_done = true;
  game.room.updated_at = now();
}

function resetTurnAction(game) {
  if (!game || !game.room) return;
  game.room.turn_action_done = false;
}

function nextStep() {
  const game = getGame();
  if (!game || !game.room) return null;
  const room = game.room;
  const players = game.players || [];
  if (!players.length || room.status === "finished") return getPayload();
  if (!room.turn_action_done) {
    addLog(game, room.current_player_id, "turn_end_blocked", "本轮尚未掷点或抽事件，不能结束本轮", {
      currentPlayerId: room.current_player_id
    });
    saveGame(game);
    return getPayload();
  }

  const index = Math.max(0, players.findIndex((player) => player.id === room.current_player_id));
  const endedPlayerId = room.current_player_id;
  if (index >= players.length - 1) {
    if (Number(room.current_round || 1) >= Number(room.max_round || 1)) {
      finishGameBySilver(game, "已完成最后回合，按银两最多判定胜利");
      addLog(game, room.current_player_id, "game_finish", `游戏结束：已完成 ${room.max_round} 回合`, {
        round: room.current_round,
        maxRound: room.max_round
      });
    } else {
      room.current_round += 1;
      room.current_player_id = players[0].id;
      resetTurnAction(game);
      updateStep(game, "玩家行动");
      addLog(game, room.current_player_id, "next_round", `第 ${room.current_round} 回合开始：${players[0].player_name} 行动`, {
        round: room.current_round
      });
    }
  } else {
    const nextPlayer = players[index + 1];
    room.current_player_id = nextPlayer.id;
    resetTurnAction(game);
    updateStep(game, "玩家行动");
    addLog(game, room.current_player_id, "next_player", `轮到 ${nextPlayer.player_name} 行动`, {
      round: room.current_round,
      seatNo: nextPlayer.seat_no
    });
  }

  let guard = 0;
  while (room.status !== "finished" && guard < players.length) {
    const active = getPlayerById(game, room.current_player_id);
    if (!active || normalizePlayerNumber(active.paused_turns, 0) <= 0) break;
    active.paused_turns = Math.max(0, normalizePlayerNumber(active.paused_turns, 0) - 1);
    addLog(game, active.id, "turn_paused", `${active.player_name} 暂停行动 1 次，本次自动跳过`, {
      pausedTurns: active.paused_turns
    });
    const skippedIndex = Math.max(0, players.findIndex((player) => player.id === active.id));
    if (skippedIndex >= players.length - 1) {
      if (Number(room.current_round || 1) >= Number(room.max_round || 1)) {
        finishGameBySilver(game, "已完成最后回合，按银两最多判定胜利");
        addLog(game, active.id, "game_finish", `游戏结束：已完成 ${room.max_round} 回合`, {
          round: room.current_round,
          maxRound: room.max_round
        });
      } else {
        room.current_round += 1;
        room.current_player_id = players[0].id;
        resetTurnAction(game);
        updateStep(game, "玩家行动");
      }
    } else {
      room.current_player_id = players[skippedIndex + 1].id;
      resetTurnAction(game);
      updateStep(game, "玩家行动");
    }
    guard += 1;
  }
  game.last_turn_settlement = buildTurnSettlement(game, endedPlayerId, room.current_player_id, room.status === "finished");
  saveGame(game);
  return getPayload();
}

function rollDice(diceCount, fixedTotal) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  if (isFlightGame(game)) return rollFlightDice(game, fixedTotal);
  const count = Math.max(1, Math.min(Number(diceCount || 1), 6));
  const rolls = [];
  let total = 0;
  const forced = Number(fixedTotal || 0);
  if (forced >= 1 && forced <= 6) {
    rolls.push(forced);
    total = forced;
  }
  for (let i = rolls.length; i < count; i += 1) {
    const value = Math.floor(Math.random() * 6) + 1;
    rolls.push(value);
    total += value;
  }
  const result = { diceCount: count, sides: 6, rolls, total, rollsText: rolls.join(" + ") };
  const currentPlayer = (game.players || []).find((player) => player.id === game.room.current_player_id);
  if (currentPlayer) {
    const moveAdjust = normalizePlayerNumber(currentPlayer.move_adjust, 0);
    const moveTotal = Math.max(1, total + moveAdjust);
    const positionResult = applyPositionChange(currentPlayer, moveTotal);
    currentPlayer.move_adjust = 0;
    result.moveAdjust = moveAdjust;
    result.moveTotal = moveTotal;
    result.oldPosition = positionResult.oldPosition;
    result.position = positionResult.nextPosition;
    result.loopCount = positionResult.loopCount;
    result.loopRewardSilver = positionResult.reward;
    result.rawPosition = positionResult.rawNextPosition;
    result.passed_cities = getPassedCities(game, positionResult.oldPosition, positionResult.rawNextPosition);
    result.passed_city_names = result.passed_cities.map((city) => formatPassedCity(game, city, currentPlayer.id, positionResult.nextPosition)).join("；");
    result.passed_city_tip = result.passed_city_names;
    const movementEvent = drawMovementEvent(game, currentPlayer, positionResult.nextPosition);
    if (movementEvent) {
      result.auto_event = movementEvent;
      addLog(game, currentPlayer.id, movementEvent.character_slot ? "character_slot" : "auto_random_event", `移动后自动触发：${movementEvent.title}`, movementEvent);
    }
  }
  updateStep(game, "摇骰移动");
  markTurnActionDone(game);
  const rewardText = result.loopRewardSilver ? `，经过起点 ${result.loopCount} 次，银两 +${result.loopRewardSilver}` : "";
  const cityText = result.passed_city_names ? `，${getThemeWord(game, "city", "城池")}提示：${result.passed_city_names}` : "";
  const eventText = result.auto_event ? `，自动事件：${result.auto_event.title}` : "";
  addLog(game, game.room.current_player_id, "dice_roll", `${forced >= 1 && forced <= 6 ? '线下掷点' : '摇骰结果'}：${result.rollsText} = ${total}，实际移动 ${result.moveTotal || total}，位置 ${result.oldPosition != null ? result.oldPosition : "-"} → ${result.position != null ? result.position : "-"}${rewardText}${cityText}${eventText}`, result);
  checkVictory(game);
  saveGame(game);
  return result;
}

function updateFlightPiece(playerId, pieceIndex, status) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished" || !isFlightGame(game)) return getPayload();
  const player = getPlayerById(game, Number(playerId || game.room.current_player_id));
  if (!player || !Array.isArray(player.flight_pieces)) return getPayload();
  const index = Math.max(0, Math.min(Number(pieceIndex || 0), player.flight_pieces.length - 1));
  const safeStatus = ["airport", "active", "final", "finished"].indexOf(status) !== -1 ? status : "airport";
  const piece = player.flight_pieces[index];
  piece.status = safeStatus;
  piece.status_text = getFlightPieceStatusText(safeStatus);
  piece.position_text = safeStatus === "airport" ? "机场等待" : piece.status_text;
  piece.updated_at = now();
  player.finished_pieces = countFlightFinishedPieces(player);
  player.battle = player.finished_pieces;
  updateStep(game, "飞行棋棋子记录");
  addLog(game, player.id, "flight_piece_update", `${player.player_name} ${piece.name} 标记为${piece.status_text}`, {
    playerId: player.id,
    pieceIndex: index,
    status: safeStatus
  });
  checkVictory(game);
  saveGame(game);
  return getPayload();
}

function drawEvent() {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const currentPlayer = (game.players || []).find((player) => player.id === game.room.current_player_id);
  const event = drawRandomEventForCurrent(game, currentPlayer);
  if (!event) return null;
  event.auto_triggered = false;
  updateStep(game, "抽取事件");
  markTurnActionDone(game);
  addLog(game, game.room.current_player_id, "random_event", `抽到事件：${event.title}`, event);
  checkVictory(game);
  saveGame(game);
  return event;
}

function buyCity(cityId) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const city = (game.cities || []).find((item) => item.id === Number(cityId));
  const currentPlayer = getPlayerById(game, game.room.current_player_id);
  if (!city || !currentPlayer) return getPayload();
  if (city.owner_id) {
    addLog(game, currentPlayer.id, "city_buy_failed", `${city.name} 已归属 ${city.owner_name || "其他玩家"}`, { cityId: city.id });
    saveGame(game);
    return getPayload();
  }
  if (normalizePlayerNumber(currentPlayer.silver, 0) < normalizePlayerNumber(city.price, 0)) {
    addLog(game, currentPlayer.id, "city_buy_failed", `${currentPlayer.player_name} 银两不足，无法购买 ${city.name}`, { cityId: city.id, price: city.price });
    saveGame(game);
    return getPayload();
  }
  applyStatChanges(currentPlayer, { silver: -Number(city.price || 0), prestige: 1 });
  city.owner_id = currentPlayer.id;
  city.owner_name = currentPlayer.player_name;
  city.bought_at_round = game.room.current_round;
  updateStep(game, `${getThemeWord(game, "city", "城池")}购买`);
  addLog(game, currentPlayer.id, "city_buy", `${currentPlayer.player_name} 购买 ${city.name}，花费 ${city.price} 银两`, city);
  checkVictory(game);
  saveGame(game);
  return getPayload();
}

function upgradeCity(cityId) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const city = (game.cities || []).find((item) => item.id === Number(cityId));
  const currentPlayer = getPlayerById(game, game.room.current_player_id);
  if (!city || !currentPlayer) return getPayload();
  if (city.owner_id !== currentPlayer.id) {
    addLog(game, currentPlayer.id, "city_upgrade_failed", `${currentPlayer.player_name} 不是 ${city.name}${getCityOwnerWord(game)}，无法升级`, { cityId: city.id });
    saveGame(game);
    return getPayload();
  }
  const cost = normalizePlayerNumber(city.upgrade_cost, 3);
  if (normalizePlayerNumber(currentPlayer.silver, 0) < cost) {
    addLog(game, currentPlayer.id, "city_upgrade_failed", `${currentPlayer.player_name} 银两不足，无法升级 ${city.name}`, { cityId: city.id, cost });
    saveGame(game);
    return getPayload();
  }
  const before = {
    level: normalizePlayerNumber(city.level, 1),
    defense: normalizePlayerNumber(city.defense, 100),
    toll: normalizePlayerNumber(city.toll, 1),
    upgrade_cost: cost
  };
  applyStatChanges(currentPlayer, { silver: -cost, prestige: 1 });
  city.level = before.level + 1;
  city.defense = before.defense + 40;
  city.toll = before.toll + 1;
  city.upgrade_cost = cost + 2;
  const upgradeResult = { cityId: city.id, before, after: clone(city), cost };
  updateStep(game, `${getThemeWord(game, "city", "城池")}升级`);
  addLog(game, currentPlayer.id, "city_upgrade", `${currentPlayer.player_name} 升级 ${city.name}：等级 ${before.level}→${city.level}，${getTollWord(game)} ${before.toll}→${city.toll}，城防 ${before.defense}→${city.defense}`, upgradeResult);
  checkVictory(game);
  saveGame(game);
  return getPayload();
}

function settleCityToll(game, city, currentPlayer, multiplier, logType) {
  const owner = getPlayerById(game, city.owner_id);
  if (!owner || owner.id === currentPlayer.id) {
    addLog(game, currentPlayer.id, "city_toll_skip", `${city.name} 为己方${getThemeWord(game, "city", "城池")}，本次不收费`, { cityId: city.id });
    return;
  }
  if (normalizePlayerNumber(currentPlayer.toll_free_tokens, 0) > 0) {
    applyStatChanges(currentPlayer, { toll_free_tokens: -1 });
    addLog(game, currentPlayer.id, "city_toll_free", `${currentPlayer.player_name} 使用免税效果，通过 ${city.name}`, { cityId: city.id });
    return;
  }
  const feeTarget = normalizePlayerNumber(city.toll, 0) * Math.max(1, Number(multiplier || 1));
  if (feeTarget <= 0) {
    addLog(game, currentPlayer.id, "city_toll_skip", `${city.name} 当前通行费为 0，本次不收费`, { cityId: city.id });
    return;
  }
  if (normalizePlayerNumber(currentPlayer.silver, 0) <= 0) {
    addLog(game, currentPlayer.id, "city_toll_failed", `${currentPlayer.player_name} 银两不足，无法支付 ${city.name}${getTollWord(game)}`, {
      cityId: city.id,
      feeTarget,
      ownerId: owner.id
    });
    return;
  }
  const fee = Math.min(normalizePlayerNumber(currentPlayer.silver, 0), feeTarget);
  applyStatChanges(currentPlayer, { silver: -fee });
  applyStatChanges(owner, { silver: fee });
  const payerSilverLeft = normalizePlayerNumber(currentPlayer.silver, 0);
  const ownerSilverNow = normalizePlayerNumber(owner.silver, 0);
  updateStep(game, `${getThemeWord(game, "city", "城池")}收费`);
  addLog(game, currentPlayer.id, logType || "city_toll", `${currentPlayer.player_name} 向 ${owner.player_name} 支付 ${city.name}${getTollWord(game)} ${fee} 银两，${currentPlayer.player_name} 剩余 ${payerSilverLeft} 银两，${owner.player_name} 现有 ${ownerSilverNow} 银两`, {
    cityId: city.id,
    fee,
    payerSilverLeft,
    ownerSilverNow,
    multiplier: Math.max(1, Number(multiplier || 1)),
    ownerId: owner.id
  });
  checkVictory(game);
}

function payCityToll(cityId, multiplier) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const city = (game.cities || []).find((item) => item.id === Number(cityId));
  const currentPlayer = getPlayerById(game, game.room.current_player_id);
  if (!city || !currentPlayer || !city.owner_id) return getPayload();
  settleCityToll(game, city, currentPlayer, multiplier, "city_toll");
  saveGame(game);
  return getPayload();
}

function rollOneDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function getBestSiegeAlly(player) {
  const allies = getPlayerAllies(player);
  if (!allies.length) return null;
  let best = allies[0];
  for (let i = 1; i < allies.length; i += 1) {
    if (normalizePlayerNumber(allies[i].force_value, 0) > normalizePlayerNumber(best.force_value, 0)) {
      best = allies[i];
    }
  }
  return best;
}

function buildAttackAssets(game, outcome) {
  const themeId = getThemeIdFromGame(game);
  if (themeId === "chaoshan-travel") {
    const base = `${ATTACK_ASSET_BASE}/themes/chaoshan-travel/attack`;
    return {
      process_image: `${base}/eat-contest-process.jpg`,
      result_image: `${base}/${outcome === "success" ? "eat-contest-success.jpg" : "eat-contest-failed.jpg"}`,
      start_audio: `${base}/eat-contest-start.mp3`,
      success_audio: `${base}/eat-contest-success.mp3`,
      failed_audio: `${base}/eat-contest-failed.mp3`
    };
  }
  return {
    process_image: `${ATTACK_ASSET_BASE}/attack-process.png`,
    result_image: `${ATTACK_ASSET_BASE}/${outcome === "success" ? "attack-success.png" : "attack-failed.png"}`,
    start_audio: "https://cdn.example.com/cdn-upload-final/attack-start.mp3",
    success_audio: "https://cdn.example.com/cdn-upload-final/attack-success.mp3",
    failed_audio: "https://cdn.example.com/cdn-upload-final/attack-failed.mp3"
  };
}

function estimateAttackChance(force, siegeBonus, defense) {
  const safeForce = normalizePlayerNumber(force, 0);
  const safeSiegeBonus = normalizePlayerNumber(siegeBonus, 0);
  const safeDefense = normalizePlayerNumber(defense, 100);
  let successCount = 0;
  for (let attackDice = 1; attackDice <= 6; attackDice += 1) {
    for (let defenseDice = 1; defenseDice <= 6; defenseDice += 1) {
      const attackValue = (attackDice * safeForce) + safeSiegeBonus;
      const defenseValue = safeDefense + (defenseDice * 20);
      if (attackValue >= defenseValue) successCount += 1;
    }
  }
  return Math.round((successCount / 36) * 100);
}

function beginCityAttack(cityId) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const city = (game.cities || []).find((item) => item.id === Number(cityId));
  const currentPlayer = getPlayerById(game, game.room.current_player_id);
  if (!city || !currentPlayer) return getPayload();
  const owner = city.owner_id ? getPlayerById(game, city.owner_id) : null;
  if (!owner || owner.id === currentPlayer.id) {
    addLog(game, currentPlayer.id, "city_attack_skip", `${city.name} 无需攻打`, { cityId: city.id });
    saveGame(game);
    return { payload: getPayload(), attack: null };
  }
  const ally = getBestSiegeAlly(currentPlayer);
  const defense = normalizePlayerNumber(city.defense, 100);
  const siegeBonus = normalizePlayerNumber(currentPlayer.siege_tokens, 0);
  const baseAssets = buildAttackAssets(game, "failed");
  if (!ally) {
    const attack = Object.assign({
      id: Date.now(),
      cityId: city.id,
      cityName: city.name,
      playerId: currentPlayer.id,
      playerName: currentPlayer.player_name,
      ownerId: owner.id,
      ownerName: owner.player_name,
      outcome: "failed",
      reason: `当前玩家没有${getThemeWord(game, "character", "武将")}，${getContestActionWord(game)}失败`,
      dice: 0,
      ally: null,
      force: 0,
      siegeBonus,
      attackDice: 0,
      defenseDice: 0,
      attackValue: 0,
      defenseBase: defense,
      defenseValue: defense,
      defense,
      chance: 0,
      attackerRolled: true,
      defenderRolled: true,
      readyToResolve: true
    }, baseAssets);
    game.pending_city_attack = attack;
    updateStep(game, `${getAttackActionWord(game)}判定`);
    addLog(game, currentPlayer.id, "city_attack_prepare", `${currentPlayer.player_name} 准备${getContestActionWord(game)} ${city.name}，但没有可参与的${getThemeWord(game, "character", "武将")}`, attack);
    saveGame(game);
    return { payload: getPayload(), attack };
  }
  const force = normalizePlayerNumber(ally.force_value, 1);
  const chance = estimateAttackChance(force, siegeBonus, defense);
  const attack = Object.assign({
    id: Date.now(),
    cityId: city.id,
    cityName: city.name,
    playerId: currentPlayer.id,
    playerName: currentPlayer.player_name,
    ownerId: owner.id,
    ownerName: owner.player_name,
    outcome: "",
    reason: `${getThemeWord(game, "attackerLabel", "攻方")}和${getThemeWord(game, "defenderLabel", "守方")}尚未掷点`,
    dice: 0,
    attackDice: 0,
    defenseDice: 0,
    ally,
    force,
    siegeBonus,
    attackValue: 0,
    defenseBase: defense,
    defenseValue: defense,
    defense,
    chance,
    attackerRolled: false,
    defenderRolled: false,
    readyToResolve: false
  }, baseAssets);
  game.pending_city_attack = attack;
  updateStep(game, `${getAttackActionWord(game)}判定`);
  addLog(game, currentPlayer.id, "city_attack_prepare", `${currentPlayer.player_name} 派 ${ally.name} 准备${getAttackActionWord(game)} ${city.name}，基础${getStatWord(game, "forceStat", "武力")} ${force}，${getThemeWord(game, "defenseStat", "城防")} ${defense}，预估胜率 ${chance}%`, attack);
  saveGame(game);
  return { payload: getPayload(), attack };
}

function finalizePendingAttack(game, attack) {
  if (!attack || !attack.attackerRolled || !attack.defenderRolled) return attack;
  const success = normalizePlayerNumber(attack.attackValue, 0) >= normalizePlayerNumber(attack.defenseValue, attack.defenseBase);
  attack.outcome = success ? "success" : "failed";
  attack.reason = success ? `${getAttackActionWord(game)}成功，免交${getTollWord(game)}` : `${getAttackActionWord(game)}失败，将交双倍${getTollWord(game)}`;
  attack.result_image = buildAttackAssets(game, success ? "success" : "failed").result_image;
  attack.readyToResolve = true;
  return attack;
}

function rollPendingCityAttack(side) {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const attack = game.pending_city_attack;
  if (!attack) return { payload: getPayload(), attack: null };
  const rollSide = side === "defender" ? "defender" : "attacker";
  const dice = rollOneDice();
  if (rollSide === "attacker" && !attack.attackerRolled) {
    attack.attackDice = dice;
    attack.dice = dice;
    attack.attackValue = (dice * normalizePlayerNumber(attack.force, 0)) + normalizePlayerNumber(attack.siegeBonus, 0);
    attack.attackerRolled = true;
    addLog(game, attack.playerId, "city_attack_roll", `${attack.playerName} ${getAttackActionWord(game)}掷点 ${dice}，${getThemeWord(game, "attackPowerStat", "战力")} ${attack.attackValue}`, attack);
  }
  if (rollSide === "defender" && !attack.defenderRolled) {
    attack.defenseDice = dice;
    attack.defenseValue = normalizePlayerNumber(attack.defenseBase, attack.defense) + (dice * 20);
    attack.defense = attack.defenseValue;
    attack.defenderRolled = true;
    addLog(game, attack.playerId, "city_defense_roll", `${attack.cityName} ${getThemeWord(game, "defenderLabel", "守方")}掷点 ${dice}，${getThemeWord(game, "defenseStat", "防御")} ${attack.defenseValue}`, attack);
  }
  finalizePendingAttack(game, attack);
  game.pending_city_attack = attack;
  saveGame(game);
  return { payload: getPayload(), attack };
}

function resolveCityAttack() {
  const game = getGame();
  if (!game || !game.room || game.room.status === "finished") return null;
  const attack = game.pending_city_attack;
  if (!attack) return { payload: getPayload(), attack: null };
  if (!attack.readyToResolve) return { payload: getPayload(), attack };
  const city = (game.cities || []).find((item) => item.id === Number(attack.cityId));
  const currentPlayer = getPlayerById(game, attack.playerId);
  if (!city || !currentPlayer) {
    game.pending_city_attack = null;
    saveGame(game);
    return { payload: getPayload(), attack: null };
  }
  currentPlayer.siege_tokens = 0;
  if (attack.outcome === "success") {
    updateStep(game, `${getContestActionWord(game)}${getThemeWord(game, "city", "城池")}`);
    addLog(game, currentPlayer.id, "city_attack_success", `${currentPlayer.player_name} ${getAttackActionWord(game)} ${city.name} 成功：${attack.attackValue}/${attack.defenseValue}，免交${getTollWord(game)}`, attack);
    game.pending_city_attack = null;
    saveGame(game);
    return { payload: getPayload(), attack };
  }
  addLog(game, currentPlayer.id, "city_attack_failed", `${currentPlayer.player_name} ${getAttackActionWord(game)} ${city.name} 失败：${attack.attackValue}/${attack.defenseValue}，需交双倍${getTollWord(game)}`, attack);
  settleCityToll(game, city, currentPlayer, 2, "city_attack_double_toll");
  game.pending_city_attack = null;
  saveGame(game);
  return { payload: getPayload(), attack };
}

function attackCity(cityId) {
  const prepared = beginCityAttack(cityId);
  if (!prepared || !prepared.attack) return prepared && prepared.payload ? prepared.payload : getPayload();
  const resolved = resolveCityAttack();
  return resolved && resolved.payload ? resolved.payload : getPayload();
}

module.exports = {
  createGame,
  getGame,
  getPayload,
  saveGame,
  clearGame,
  nextStep,
  rollDice,
  updateFlightPiece,
  drawEvent,
  buyCity,
  upgradeCity,
  payCityToll,
  beginCityAttack,
  rollPendingCityAttack,
  resolveCityAttack,
  attackCity,
  STORAGE_KEY
};
