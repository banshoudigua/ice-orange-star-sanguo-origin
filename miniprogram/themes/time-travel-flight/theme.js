const scenicSpots = require("./data/scenic-spots");
const characters = require("./data/characters");
const events = require("./data/events");
const board = require("./data/board");
const guide = require("./data/guide");

const CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/time-travel-flight";
const ROOT_CDN_BASE = "https://cdn.example.com/cdn-upload-final";

module.exports = {
  id: "time-travel-flight",
  title: "时空旅行飞行棋",
  subtitle: "传统飞行棋 · 世界历史景点",
  description: "以线下传统飞行棋棋盘为基准，每人 4 枚棋子，小程序辅助掷骰、起飞、连续 6、撞机、同色跳跃、景点打卡与历史人物卡。",
  gameMode: "flight",
  introTitle: "时空机场开局",
  introEra: "世界历史景点 · 传统飞行棋",
  heroImage: `${CDN_BASE}/home/time-travel-flight-hero-wide-v2.jpg`,
  heroThumb: `${CDN_BASE}/home/time-travel-flight-hero-wide-v2.jpg`,
  introAudio: `${CDN_BASE}/audio/opening.mp3`,
  victoryImage: `${CDN_BASE}/home/victory-flight.jpg`,
  mapImage: `${CDN_BASE}/maps/地图.jpg`,
  mapPreviewImage: `${CDN_BASE}/maps/地图.jpg`,
  mapDownloadImage: `${CDN_BASE}/maps/地图.jpg`,
  mapDownloadOptions: [
    { title: "时空旅行飞行棋棋盘照片", desc: "以用户提供的传统飞行棋棋盘为基准，适合查看规则和线下摆放。", url: `${CDN_BASE}/maps/地图.jpg` }
  ],
  mapTitle: "时空旅行飞行棋地图",
  mapPrintTip: "建议使用线下实体飞行棋棋盘；如需打印，可下载棋盘图后按 A3 或 A2 彩色打印。",
  labels: {
    character: "历史人物卡",
    characterPlural: "历史人物卡",
    characterGain: "历史人物卡",
    city: "景点",
    cityPlural: "世界景点",
    ally: "旅行队",
    event: "飞行棋事件",
    gameplay: "规则介绍",
    map: "主题地图",
    citiesNav: "景点",
    cityOwner: "打卡者",
    collection: "旅行队人物",
    ownerDisplay: "打卡状态",
    tollLabel: "游览费",
    attackAction: "景点挑战",
    contestAction: "景点挑战",
    cardVoiceLabel: "人物介绍",
    cityIntroLabel: "景点介绍",
    grainStat: "补给",
    silverStat: "旅行基金",
    prestigeStat: "旅行人气",
    battleStat: "景点印章",
    positionStat: "航线位置",
    forceStat: "航行",
    strategyStat: "见识",
    fameStat: "探索",
    commandStat: "守护",
    defenseStat: "打卡难度",
    attackPowerStat: "探索值",
    contestBonusStat: "路线加成",
    attackerLabel: "旅行队",
    defenderLabel: "景点",
    attackerDiceLabel: "探索点数",
    defenderDiceLabel: "景点点数",
    battleStartText: "景点挑战开始",
    tollFreeLabel: "免排队",
    forceShort: "航",
    strategyShort: "识",
    fameShort: "探",
    commandShort: "守"
  },
  guide,
  dockItems: [
    { key: "characters", seal: "史", text: "人物" },
    { key: "events", seal: "飞", text: "事件" },
    { key: "cities", seal: "景", text: "景点" },
    { key: "guide", seal: "规", text: "规则" }
  ],
  data: {
    gameMode: "flight",
    flightRules: board,
    characters,
    events,
    cities: scenicSpots,
    characterSlots: board.characterSlots,
    introLines: board.introLines
  },
  flightSetup: {
    pieceCount: board.pieceCount,
    startModes: board.startModes,
    collisionModes: board.collisionModes,
    spotModes: board.spotModes
  }
};
