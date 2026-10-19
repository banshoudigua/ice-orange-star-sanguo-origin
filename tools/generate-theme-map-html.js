const fs = require("fs");
const path = require("path");

const sanguoData = require("../miniprogram/utils/gameData.sanguo");
const chaoshanSpots = require("../miniprogram/themes/chaoshan-travel/data/scenic-spots");
const chaoshanBoard = require("../miniprogram/themes/chaoshan-travel/data/board");

const OUT_DIR = path.join(__dirname, "..", "output", "theme-map-html");
const WIDTH = 4961;
const HEIGHT = 3508;

fs.mkdirSync(OUT_DIR, { recursive: true });

function pickText(value, max) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function text(x, y, value, size, fill, weight, anchor, extra) {
  return `<text x="${x}" y="${y}" font-family="'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight || 700}" text-anchor="${anchor || "middle"}" ${extra || ""}>${value}</text>`;
}

function lines(items, x, y, size, gap, fill, weight, anchor) {
  return items.map((item, index) => text(x, y + index * gap, item, size, fill, weight, anchor)).join("\n");
}

function polar(cx, cy, rx, ry, deg) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * rx,
    y: cy + Math.sin(rad) * ry
  };
}

function wrapCn(value, maxChars, maxLines) {
  const raw = String(value || "");
  const chunks = [];
  let current = raw;
  while (current.length > 0 && chunks.length < maxLines) {
    chunks.push(current.slice(0, maxChars));
    current = current.slice(maxChars);
  }
  if (current.length > 0 && chunks.length > 0) {
    chunks[chunks.length - 1] = `${chunks[chunks.length - 1].slice(0, Math.max(1, maxChars - 1))}…`;
  }
  return chunks;
}

function routePositions() {
  return Array.from({ length: 30 }, (_, index) => {
    const position = index + 1;
    const angle = 90 - (index * 360) / 30;
    const point = polar(WIDTH / 2, HEIGHT / 2 + 20, 1960, 1210, angle);
    return {
      position,
      angle,
      x: point.x,
      y: point.y
    };
  });
}

function tileKind(theme, position, placeByPosition, slotByPosition) {
  const place = placeByPosition.get(position);
  if (place) return { type: "place", title: place.name, sub: `${theme.placeLabel} · 买${place.price} 费${place.toll}`, data: place };
  const slot = slotByPosition.get(position);
  if (slot) return { type: "card", title: slot.name, sub: theme.cardSlotSub(slot), data: slot };
  if (position === 1) return { type: "start", title: "起点", sub: theme.startSub };
  const cycle = theme.cycle[(position - 1) % theme.cycle.length];
  return cycle;
}

function tile(theme, positionInfo, placeByPosition, slotByPosition) {
  const item = tileKind(theme, positionInfo.position, placeByPosition, slotByPosition);
  const tone = theme.tileTones[item.type] || theme.tileTones.event;
  const isPlace = item.type === "place";
  const w = isPlace ? 330 : 155;
  const h = isPlace ? 178 : 116;
  const x = positionInfo.x - w / 2;
  const y = positionInfo.y - h / 2;
  const badge = isPlace ? 35 : 29;
  const titleSize = isPlace ? 44 : 34;
  const subSize = isPlace ? 25 : 22;
  if (!isPlace) {
    const label = item.type === "start" ? "起点" : "";
    return `
    <g class="map-tile">
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="22" fill="${theme.cardFill}" stroke="${theme.tileStroke}" stroke-width="5" filter="url(#tileShadow)"/>
      <rect x="${(x + 12).toFixed(1)}" y="${(y + 12).toFixed(1)}" width="${w - 24}" height="${h - 24}" rx="16" fill="${tone}" opacity="0.95"/>
      ${text(positionInfo.x.toFixed(1), (y + 56).toFixed(1), positionInfo.position, 31, theme.tileTitle, 900)}
      ${label ? text(positionInfo.x.toFixed(1), (y + 88).toFixed(1), label, 21, theme.tileSub, 800) : ""}
    </g>`;
  }
  return `
    <g class="map-tile">
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="24" fill="${theme.cardFill}" stroke="${theme.tileStroke}" stroke-width="${isPlace ? 8 : 6}" filter="url(#tileShadow)"/>
      <rect x="${(x + 13).toFixed(1)}" y="${(y + 13).toFixed(1)}" width="${w - 26}" height="${h - 26}" rx="17" fill="${tone}" opacity="0.95"/>
      <circle cx="${(x + 42).toFixed(1)}" cy="${(y + 42).toFixed(1)}" r="${badge}" fill="${theme.badgeFill}" stroke="${theme.badgeStroke}" stroke-width="4"/>
      ${text((x + 42).toFixed(1), (y + 54).toFixed(1), positionInfo.position, isPlace ? 32 : 27, theme.badgeText, 900)}
      ${text(positionInfo.x.toFixed(1), (y + (isPlace ? 82 : 72)).toFixed(1), pickText(item.title, isPlace ? 6 : 5), titleSize, theme.tileTitle, 900)}
      ${text(positionInfo.x.toFixed(1), (y + (isPlace ? 126 : 112)).toFixed(1), pickText(item.sub, isPlace ? 12 : 10), subSize, theme.tileSub, 800)}
    </g>`;
}

function centerPlaceCard(theme, place, index) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const left = 1384 + col * 735;
  const top = 1468 + row * 268;
  const titleX = left + 118;
  const body = wrapCn(place.desc || place.history_desc, 18, 2);
  return `
    <g>
      <rect x="${left}" y="${top}" width="680" height="222" rx="24" fill="${theme.panelFill}" stroke="${theme.panelStroke}" stroke-width="6" filter="url(#panelShadow)"/>
      <rect x="${left + 18}" y="${top + 20}" width="78" height="176" rx="17" fill="${theme.panelBadgeFill}" stroke="${theme.panelBadgeStroke}" stroke-width="4"/>
      ${text(left + 57, top + 82, place.position, 34, theme.panelBadgeText, 900)}
      ${text(left + 57, top + 132, theme.placeShort, 26, theme.panelBadgeText, 900)}
      ${text(titleX, top + 54, place.name, 38, theme.panelTitle, 900, "start")}
      ${text(titleX, top + 94, `${theme.buyLabel}${place.price}  ${theme.tollLabel}${place.toll}  ${theme.defenseLabel}${place.defense}`, 24, theme.panelText, 800, "start")}
      ${lines(body, titleX, top + 138, 25, 36, theme.panelMuted, 700, "start")}
    </g>`;
}

function centerContent(theme, places) {
  const cards = places.map((item, index) => centerPlaceCard(theme, item, index)).join("\n");
  return `
  <g filter="url(#panelShadow)">
    <rect x="1298" y="1046" width="2366" height="1015" rx="46" fill="${theme.centerFill}" stroke="${theme.centerStroke}" stroke-width="12"/>
    ${text(2481, 1160, "林同学的桌游助手", 48, theme.brandText, 900)}
    ${text(2481, 1260, theme.title, 94, theme.titleText, 900)}
    ${text(2481, 1334, theme.subtitle, 36, theme.subtitleText, 800)}
    ${text(2481, 1394, theme.actionText, 30, theme.centerText, 800)}
    ${cards}
  </g>`;
}

function buildSvg(theme) {
  const places = theme.places;
  const slots = theme.slots;
  const placeByPosition = new Map(places.map((item) => [Number(item.position), item]));
  const slotByPosition = new Map(slots.map((item) => [Number(item.position), item]));
  const tiles = routePositions().map((item) => tile(theme, item, placeByPosition, slotByPosition)).join("\n");
  const center = centerContent(theme, places);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${theme.title}棋盘地图">
  <defs>
    <radialGradient id="pageGlow" cx="52%" cy="45%" r="76%">
      <stop offset="0%" stop-color="${theme.glow0}"/>
      <stop offset="58%" stop-color="${theme.glow1}"/>
      <stop offset="100%" stop-color="${theme.glow2}"/>
    </radialGradient>
    <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.route0}"/>
      <stop offset="100%" stop-color="${theme.route1}"/>
    </linearGradient>
    <filter id="tileShadow" x="-24%" y="-24%" width="148%" height="148%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="${theme.shadow}" flood-opacity="0.28"/>
    </filter>
    <filter id="panelShadow" x="-16%" y="-16%" width="132%" height="132%">
      <feDropShadow dx="0" dy="14" stdDeviation="13" flood-color="${theme.shadow}" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${theme.outerBg}"/>
  <rect x="118" y="110" width="4725" height="3288" rx="110" fill="url(#pageGlow)" stroke="${theme.outerStroke}" stroke-width="34"/>
  <rect x="218" y="210" width="4525" height="3088" rx="74" fill="none" stroke="${theme.innerStroke}" stroke-width="10" opacity="0.7"/>
  ${theme.background}
  <ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2 + 20}" rx="2080" ry="1320" fill="none" stroke="${theme.routeOuter}" stroke-width="26" opacity="0.52"/>
  <ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2 + 20}" rx="1815" ry="1100" fill="none" stroke="url(#routeLine)" stroke-width="12" stroke-dasharray="40 26" opacity="0.72"/>
  ${center}
  ${tiles}
  <rect x="118" y="110" width="4725" height="3288" rx="110" fill="none" stroke="${theme.outerStroke}" stroke-width="34"/>
</svg>`;
}

function buildHtml(theme) {
  const svg = buildSvg(theme);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${theme.title}地图 HTML - 林同学的桌游助手</title>
  <style>
    @page { size: A3 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: ${theme.browserBg}; }
    body { display: grid; place-items: center; padding: 24px; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; }
    .stage { width: min(100vw - 48px, 1400px); aspect-ratio: ${WIDTH} / ${HEIGHT}; background: ${theme.outerBg}; box-shadow: 0 22px 70px rgba(42, 26, 14, .28); }
    svg { width: 100%; height: 100%; display: block; }
    @media print {
      body { padding: 0; }
      .stage { width: 100vw; height: 100vh; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main class="stage" aria-label="${theme.title}地图预览">
${svg}
  </main>
</body>
</html>
`;
}

const commonCycle = [
  { type: "event", title: "抽事件", sub: "小程序结算" },
  { type: "silver", title: "银两", sub: "+2 银两" },
  { type: "energy", title: "补给", sub: "+1 资源" },
  { type: "fame", title: "人气", sub: "+1 声望" },
  { type: "rest", title: "整备", sub: "下次 +1" }
];

const themes = [
  {
    filename: "sanguo-origin-map-image2.html",
    title: "三国起源",
    subtitle: "乱世棋局初开 · 30 格循环地图",
    places: sanguoData.cities,
    slots: sanguoData.characterSlots,
    placeLabel: "城池",
    placeShort: "城",
    buyLabel: "购",
    tollLabel: "费",
    defenseLabel: "防",
    startSub: "过起点 +3 银两",
    cardSlotSub: (slot) => `抽${slot.tier}人物卡`,
    slotSub: (slot) => `抽${slot.tier}人物`,
    printTip: "建议 A3 横版优先；多人桌面游玩可使用 A2，A4 适合便携试玩。",
    actionText: "掷骰移动，遇城池可购买、升级、交费或攻城",
    centerLines: [
      "沿 1-30 格循环推进，经过起点获得银两。",
      "城池格展示购买、通行费和防御值。",
      "人物卡格由小程序抽卡并记录到玩家名下。"
    ],
    cycle: commonCycle,
    browserBg: "#2e1a12",
    outerBg: "#432313",
    outerStroke: "#261108",
    innerStroke: "#f1d184",
    glow0: "#fff1c7",
    glow1: "#d59b50",
    glow2: "#6e321d",
    route0: "#f1cf76",
    route1: "#5f8c68",
    routeOuter: "#5c2d16",
    shadow: "#261108",
    cardFill: "#f3ddb0",
    tileStroke: "#552813",
    badgeFill: "#ffe6a6",
    badgeStroke: "#cf9a3d",
    badgeText: "#5b2a12",
    tileTitle: "#fff3c6",
    tileSub: "#ffe7bd",
    tileTones: {
      place: "#923621",
      card: "#5f7c59",
      event: "#8b4527",
      silver: "#a5742b",
      energy: "#527a45",
      fame: "#2f6e66",
      rest: "#6f5a36",
      start: "#b64227"
    },
    panelFill: "#f4dda9",
    panelStroke: "#653015",
    panelBadgeFill: "#8d3520",
    panelBadgeStroke: "#d8a64b",
    panelBadgeText: "#ffe8a8",
    panelTitle: "#572311",
    panelText: "#66391c",
    panelMuted: "#755239",
    slotFill: "#f1d89b",
    slotStroke: "#704019",
    slotNumber: "#8c351f",
    slotTitle: "#4c2513",
    slotText: "#6d4c2e",
    centerFill: "#3c2115",
    centerStroke: "#e1b85f",
    brandText: "#f9d789",
    titleText: "#ffcf63",
    subtitleText: "#f3ddad",
    centerText: "#f6dfaa",
    centerActionFill: "#7f371d",
    centerActionStroke: "#d8a64b",
    actionTextColor: "#fff0bd",
    printFill: "#f4dda9",
    printStroke: "#643116",
    printTitle: "#722c17",
    printText: "#4d2a14",
    printMuted: "#745135",
    background: `
      <path d="M 930 2450 C 1320 2030, 1230 1570, 1770 1355 C 2400 1105, 2580 1630, 3195 1370 C 3680 1165, 3770 790, 4230 615" fill="none" stroke="#4f8f8b" stroke-width="112" stroke-linecap="round" opacity="0.45"/>
      <path d="M 705 930 L 845 705 L 980 930 Z M 930 980 L 1100 700 L 1268 980 Z M 3810 2530 L 3985 2240 L 4165 2530 Z M 4050 2578 L 4230 2290 L 4410 2578 Z" fill="#71553a" opacity="0.55"/>
      <path d="M 1180 2620 C 1600 2800, 2040 2880, 2500 2865 C 3050 2848, 3470 2700, 3810 2440" fill="none" stroke="#647f45" stroke-width="54" stroke-linecap="round" opacity="0.36"/>
    `
  },
  {
    filename: "chaoshan-travel-map-image2.html",
    title: "潮汕游玩记",
    subtitle: "边走边吃边逛景点 · 30 格循环地图",
    places: chaoshanSpots,
    slots: chaoshanBoard.characterSlots,
    placeLabel: "景点",
    placeShort: "景",
    buyLabel: "购",
    tollLabel: "费",
    defenseLabel: "排",
    startSub: "过起点 +3 银两",
    cardSlotSub: (slot) => `抽${slot.tier}美食卡`,
    slotSub: (slot) => `抽${slot.tier}美食`,
    printTip: "建议 A3 横版优先；A2 更适合多人围桌查看，A4 适合轻量试玩。",
    actionText: "打卡景点，收集美食卡，比拼谁吃得多",
    centerLines: [
      "沿潮州、汕头、南澳的游玩路线前进。",
      "景点格展示购买、游玩费用和排队热度。",
      "美食卡格由小程序抽取美食介绍并播放语音。"
    ],
    cycle: [
      { type: "event", title: "游玩事件", sub: "小程序结算" },
      { type: "silver", title: "银两", sub: "+2 银两" },
      { type: "energy", title: "体力", sub: "+1 体力" },
      { type: "fame", title: "人气", sub: "+1 人气" },
      { type: "rest", title: "工夫茶", sub: "下次 +1" }
    ],
    browserBg: "#204235",
    outerBg: "#1f4f49",
    outerStroke: "#10312d",
    innerStroke: "#f1d7a1",
    glow0: "#fff3d6",
    glow1: "#d5b86d",
    glow2: "#2f7a70",
    route0: "#f4c96d",
    route1: "#ef805e",
    routeOuter: "#27695f",
    shadow: "#10312d",
    cardFill: "#fff0ce",
    tileStroke: "#24584f",
    badgeFill: "#ffe6a8",
    badgeStroke: "#d49a3b",
    badgeText: "#24584f",
    tileTitle: "#fff6d9",
    tileSub: "#fff0c8",
    tileTones: {
      place: "#d46c4a",
      card: "#2e8a70",
      event: "#b85e3c",
      silver: "#b78030",
      energy: "#477c4a",
      fame: "#27756d",
      rest: "#8b6d38",
      start: "#cc4f38"
    },
    panelFill: "#fff0ce",
    panelStroke: "#24584f",
    panelBadgeFill: "#d46c4a",
    panelBadgeStroke: "#f2c56c",
    panelBadgeText: "#fff6d5",
    panelTitle: "#1e534c",
    panelText: "#5d4324",
    panelMuted: "#6a5a43",
    slotFill: "#f6dfaa",
    slotStroke: "#287267",
    slotNumber: "#c84f37",
    slotTitle: "#24584f",
    slotText: "#684c2f",
    centerFill: "#1f514b",
    centerStroke: "#f0c66a",
    brandText: "#ffe3a4",
    titleText: "#ffd06b",
    subtitleText: "#fff0c8",
    centerText: "#fff1cf",
    centerActionFill: "#d46c4a",
    centerActionStroke: "#f1c66a",
    actionTextColor: "#fff8df",
    printFill: "#fff0ce",
    printStroke: "#24584f",
    printTitle: "#1d524b",
    printText: "#4f3d22",
    printMuted: "#705d3c",
    background: `
      <path d="M 720 2440 C 1040 2200, 1230 1910, 1580 1840 C 1990 1760, 2200 2040, 2640 1880 C 3040 1735, 3180 1330, 3650 1248 C 3990 1188, 4190 930, 4360 680" fill="none" stroke="#2f9b91" stroke-width="130" stroke-linecap="round" opacity="0.36"/>
      <path d="M 3850 2560 C 4100 2440, 4295 2230, 4410 1960 C 4510 1720, 4490 1430, 4390 1190" fill="none" stroke="#f3d08c" stroke-width="44" stroke-linecap="round" stroke-dasharray="16 28" opacity="0.62"/>
      <circle cx="780" cy="830" r="120" fill="#f2c66f" opacity="0.45"/>
      <circle cx="990" cy="990" r="45" fill="#ef805e" opacity="0.45"/>
      <path d="M 900 2620 C 1320 2820, 1850 2920, 2420 2870 C 3100 2810, 3610 2630, 4115 2265" fill="none" stroke="#e97758" stroke-width="48" stroke-linecap="round" opacity="0.34"/>
    `
  }
];

const written = themes.map((theme) => {
  const htmlPath = path.join(OUT_DIR, theme.filename);
  fs.writeFileSync(htmlPath, buildHtml(theme), "utf8");
  return htmlPath;
});

console.log(JSON.stringify({ outDir: OUT_DIR, files: written }, null, 2));
