const heroes = require("./data/heroes");
const creatures = require("./data/creatures");
const events = require("./data/events");
const towns = require("./data/towns");
const board = require("./data/board");
const guide = require("./data/guide");

const CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms";

module.exports = {
  id: "heroes3-kingdoms",
  title: "魔法门之英雄无敌：王国远征",
  subtitle: "九大阵营争夺魔法大陆",
  description: "以经典英雄无敌城镇、英雄、兵团和魔法设定为参考，沿着 30 格棋盘经营城镇、招募英雄、积累军力并争夺王国。",
  introTitle: "王国远征",
  introEra: "魔法大陆 · 九大阵营",
  heroImage: `${CDN_BASE}/home/kingdoms-hero.png`,
  heroThumb: `${CDN_BASE}/home/kingdoms-hero.png`,
  introAudio: `${CDN_BASE}/audio/opening.mp3`,
  victoryImage: `${CDN_BASE}/home/victory.png`,
  victoryCopy: "九大阵营的远征已经落幕，新的王国领主在此诞生。",
  victoryButtonText: "领取王冠",
  mapImage: `${CDN_BASE}/maps/kingdoms-map.png`,
  mapPreviewImage: `${CDN_BASE}/maps/kingdoms-map.png`,
  mapDownloadImage: `${CDN_BASE}/maps/kingdoms-map.png`,
  mapTitle: "王国远征棋盘地图",
  mapPrintTip: "推荐 A3 彩色打印；A4 可试玩，A2 更适合多人桌游体验。",
  buyInsufficientText: "金币不足，无法占领该城镇",
  labels: {
    character: "英雄卡",
    characterPlural: "英雄卡",
    characterGain: "英雄卡",
    city: "城镇",
    cityPlural: "城镇",
    ally: "兵团",
    event: "魔法事件",
    gameplay: "远征规则",
    map: "主题地图",
    citiesNav: "城镇",
    cityOwner: "领主",
    collection: "已招募英雄",
    ownerDisplay: "当前领主",
    tollLabel: "征税",
    attackAction: "争夺城镇",
    contestAction: "城镇争夺",
    cardVoiceLabel: "英雄语音",
    cityIntroLabel: "城镇介绍",
    grainStat: "木材",
    silverStat: "金币",
    prestigeStat: "魔力",
    battleStat: "军力",
    positionStat: "位置",
    defenseStat: "城防",
    attackPowerStat: "军团战力",
    contestBonusStat: "战术加成",
    attackerLabel: "进攻方",
    defenderLabel: "守城方",
    attackerDiceLabel: "进攻点数",
    defenderDiceLabel: "守城点数",
    forceStat: "战斗",
    strategyStat: "法术",
    fameStat: "声望",
    commandStat: "统率",
    forceShort: "战",
    strategyShort: "法",
    fameShort: "望",
    commandShort: "统"
  },
  guide,
  dockItems: [
    { key: "characters", seal: "英", text: "英雄卡" },
    { key: "events", seal: "法", text: "魔法事件" },
    { key: "cities", seal: "镇", text: "城镇" },
    { key: "guide", seal: "规", text: "远征规则" }
  ],
  data: {
    characters: heroes,
    creatures,
    events,
    cities: towns,
    characterSlots: board.characterSlots,
    introLines: board.introLines
  }
};
