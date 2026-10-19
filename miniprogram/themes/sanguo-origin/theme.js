const originData = require("../../utils/gameData.sanguo");

const CDN_BASE = "https://cdn.example.com/cdn-upload-final";

module.exports = {
  id: "sanguo-origin",
  title: "三国起源",
  subtitle: "乱世棋局初开",
  description: "以东汉末年群雄并起为主题的桌游助手。选择武将、经营城池、抽取历史事件，沿着 30 格棋盘推进局势。",
  introTitle: "乱世序章",
  introEra: "东汉末年 · 三国起源",
  heroImage: `${CDN_BASE}/sanguo-origin-home-hero-cute-title-v3.png`,
  heroThumb: `${CDN_BASE}/sanguo-origin-home-hero-cute-title-v3.png`,
  introAudio: `${CDN_BASE}/sanguo-opening.mp3`,
  victoryImage: `${CDN_BASE}/victory-celebration.png`,
  mapImage: `${CDN_BASE}/sanguo-map-image2-1.png`,
  mapPreviewImage: `${CDN_BASE}/sanguo-map-image2-1.png`,
  mapDownloadImage: `${CDN_BASE}/sanguo-map-image2-1.png`,
  mapDownloadOptions: [
    { title: "三国起源地图 1", desc: "三国起源主题棋盘图，适合自行打印试玩。", url: `${CDN_BASE}/sanguo-map-image2-1.png` },
    { title: "三国起源地图 2", desc: "三国起源主题备选棋盘图，可按喜好选择打印。", url: `${CDN_BASE}/sanguo-map-image2-2.png` },
    { title: "三国起源地图 3", desc: "三国起源新版棋盘图，适合查看后选择打印。", url: `${CDN_BASE}/sanguo-map-image2-3.png` },
    { title: "三国起源地图 4", desc: "三国起源横版大图，适合按桌面空间打印。", url: `${CDN_BASE}/sanguo-map-image2-4.png` },
    { title: "三国起源地图 5", desc: "三国起源备用地图，可作为不同美术风格选择。", url: `${CDN_BASE}/sanguo-map-image2-5.png` }
  ],
  mapTitle: "三国起源棋盘地图",
  mapPrintTip: "推荐优先使用 A3 彩色打印；A4 也可使用但格子较小，A2 更适合多人桌游体验。",
  buyInsufficientAudio: `${CDN_BASE}/city-buy-insufficient-v2.wav`,
  buyInsufficientText: "银两不足，无法购买该城池",
  labels: {
    character: "人物卡",
    characterPlural: "武将卡",
    characterGain: "人物卡",
    city: "城池",
    cityPlural: "城池",
    ally: "随从",
    event: "事件卡",
    gameplay: "玩法介绍",
    map: "主题地图",
    citiesNav: "城池",
    cityOwner: "城主",
    collection: "已拥有人物",
    ownerDisplay: "拥有者",
    tollLabel: "过路费",
    attackAction: "攻城",
    contestAction: "争夺",
    cardVoiceLabel: "人物语音",
    cityIntroLabel: "城池介绍",
    grainStat: "粮草",
    silverStat: "银两",
    prestigeStat: "声望",
    battleStat: "战功",
    positionStat: "位置",
    defenseStat: "防御",
    attackPowerStat: "战力",
    contestBonusStat: "攻城加成",
    attackerLabel: "攻方",
    defenderLabel: "守方",
    attackerDiceLabel: "攻方点数",
    defenderDiceLabel: "守方点数",
    forceStat: "武力",
    strategyStat: "智谋",
    fameStat: "名望",
    commandStat: "统率",
    forceShort: "武",
    strategyShort: "智",
    fameShort: "名",
    commandShort: "统"
  },
  guide: [
    { title: "玩法介绍", desc: "选择玩家人数、回合数和胜利目标后，每名玩家选择一张初始人物卡，人物属性会影响事件和攻城。", image: `${CDN_BASE}/guide-character-setup.png` },
    { title: "主题地图", desc: "棋盘按 30 格循环，经过起点可获得银两奖励。落到城池时可购买、升级、收费或攻城。", image: `${CDN_BASE}/guide-dice-city.png` },
    { title: "历史事件", desc: "黄巾、讨董、虎牢关等早期三国事件会改变数值和局势，并可抽到武将卡。", image: `${CDN_BASE}/guide-event-card.png` }
  ],
  dockItems: [
    { key: "characters", seal: "将", text: "人物卡" },
    { key: "events", seal: "事", text: "事件卡" },
    { key: "cities", seal: "城", text: "城池" },
    { key: "guide", seal: "玩", text: "玩法介绍" }
  ],
  data: Object.assign({}, originData, {
    introLines: [
      "东汉末年，朝纲倾颓。",
      "黄巾烽火自民间燃起，州郡兵马四散而动。",
      "洛阳宫阙之内，外戚、宦官与权臣相争。",
      "天下旧秩序开始松动，董卓入京，诸侯并起。",
      "英雄豪杰纷纷登场，三国尚未成形。",
      "命运的棋盘却已经铺开。",
      "请召集玩家，掷下第一枚骰子，从乱世最初的一步开始。"
    ]
  })
};
