const scenicSpots = require("./data/scenic-spots");
const foodCards = require("./data/food-cards");
const events = require("./data/events");
const board = require("./data/board");
const guide = require("./data/guide");

const CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/chaoshan-travel";
const ROOT_CDN_BASE = "https://cdn.example.com/cdn-upload-final";

module.exports = {
  id: "chaoshan-travel",
  title: "潮汕游玩记",
  subtitle: "边走边吃边逛景点",
  description: "以潮汕美食与景点游玩为主题的桌游助手。沿着主题棋盘打卡景点、经营收益、收集美食卡，完成一趟充满烟火气的游玩路线。",
  introTitle: "潮汕开场",
  introEra: "潮州 · 汕头 · 南澳游玩线路",
  heroImage: `${ROOT_CDN_BASE}/chaoshan-travel-home-hero-cute-title-v3.png`,
  heroThumb: `${ROOT_CDN_BASE}/chaoshan-travel-home-hero-cute-title-v3.png`,
  introAudio: `${CDN_BASE}/audio/chaoshan-opening.mp3`,
  victoryImage: `${CDN_BASE}/home/victory-chaoshan.png`,
  mapImage: `${ROOT_CDN_BASE}/chaoshan-map-image2-1.png`,
  mapPreviewImage: `${ROOT_CDN_BASE}/chaoshan-map-image2-1.png`,
  mapDownloadImage: `${ROOT_CDN_BASE}/chaoshan-map-image2-1.png`,
  mapDownloadOptions: [
    { title: "潮汕游玩记地图 1", desc: "潮汕游玩记主题棋盘图，适合自行打印试玩。", url: `${ROOT_CDN_BASE}/chaoshan-map-image2-1.png` },
    { title: "潮汕游玩记地图 2", desc: "潮汕游玩记主题备选棋盘图，可按喜好选择打印。", url: `${ROOT_CDN_BASE}/chaoshan-map-image2-2.png` },
    { title: "潮汕游玩记地图 3", desc: "潮汕游玩记新版棋盘图，适合查看后选择打印。", url: `${ROOT_CDN_BASE}/chaoshan-map-image2-3.png` },
    { title: "潮汕游玩记地图 4", desc: "潮汕游玩记横版大图，适合按 A4、A3 或 A2 自行打印。", url: `${ROOT_CDN_BASE}/chaoshan-map-image2-4.png` }
  ],
  mapTitle: "潮汕游玩记棋盘地图",
  mapPrintTip: "推荐优先使用 A3 彩色打印；A4 可打印但景点格和说明会更紧凑，A2 更适合桌面多人使用。",
  encounterPromptAudio: `${CDN_BASE}/audio/spot-encounter-action.mp3`,
  encounterPromptText: "遇到当地知名景点，请选择行动",
  buyInsufficientAudio: `${CDN_BASE}/audio/spot-buy-insufficient.mp3`,
  buyInsufficientText: "银两不足，无法购买该景点",
  labels: {
    character: "美食卡",
    characterPlural: "美食卡",
    characterGain: "美食卡",
    city: "景点",
    cityPlural: "景点",
    ally: "收藏",
    event: "游玩事件",
    gameplay: "主题介绍",
    map: "主题地图",
    citiesNav: "景点",
    cityOwner: "景点店主",
    collection: "已收集美食",
    ownerDisplay: "当前归属",
    tollLabel: "游玩费用",
    attackAction: "比拼饭量",
    contestAction: "比拼饭量",
    cardVoiceLabel: "美食语音",
    cityIntroLabel: "景点介绍",
    grainStat: "体力",
    silverStat: "银两",
    prestigeStat: "人气",
    battleStat: "打卡",
    positionStat: "位置",
    forceStat: "热度",
    strategyStat: "口碑",
    fameStat: "人气",
    commandStat: "传承",
    defenseStat: "排队热度",
    attackPowerStat: "饭量值",
    contestBonusStat: "加餐加成",
    attackerLabel: "挑战方",
    defenderLabel: "守擂方",
    attackerDiceLabel: "挑战点数",
    defenderDiceLabel: "守擂点数",
    battleStartText: "比拼谁吃得多开始",
    tollFreeLabel: "免游玩费",
    forceShort: "热",
    strategyShort: "碑",
    fameShort: "人",
    commandShort: "传"
  },
  guide,
  dockItems: [
    { key: "characters", seal: "食", text: "美食卡" },
    { key: "events", seal: "游", text: "游玩事件" },
    { key: "cities", seal: "景", text: "景点" },
    { key: "guide", seal: "介", text: "主题介绍" }
  ],
  data: {
    characters: foodCards,
    events,
    cities: scenicSpots,
    characterSlots: board.characterSlots,
    introLines: board.introLines
  }
};
