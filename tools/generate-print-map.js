const fs = require("fs");
const path = require("path");

const gameData = require("../miniprogram/utils/gameData");

const outDir = path.join(__dirname, "..", "output", "print-map");
fs.mkdirSync(outDir, { recursive: true });

const width = 4961;
const height = 3508;
const cities = gameData.cities || [];
const cityByPosition = new Map(cities.map((city) => [Number(city.position), city]));

const normalTiles = [
  { type: "start", title: "起点", sub: "过起点 +3 银两", tone: "#a53623" },
  { type: "event", title: "抽事件", sub: "主持机结算", tone: "#8f3f24" },
  { type: "silver", title: "银两", sub: "+2 银两", tone: "#a9752b" },
  { type: "grain", title: "粮草", sub: "+1 粮草", tone: "#4f7d48" },
  { type: "fame", title: "声望", sub: "+1 声望", tone: "#2e6b68" },
  { type: "ally", title: "武将", sub: "抽人物卡", tone: "#6e4f95" },
  { type: "rest", title: "整备", sub: "下次移动 +1", tone: "#516c94" },
  { type: "event", title: "抽事件", sub: "主持机结算", tone: "#8f3f24" },
  { type: "silver", title: "商路", sub: "+2 银两", tone: "#a9752b" },
  { type: "grain", title: "粮道", sub: "+1 粮草", tone: "#4f7d48" }
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function polar(cx, cy, rx, ry, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * rx, y: cy + Math.sin(rad) * ry };
}

function tileData(position) {
  const city = cityByPosition.get(position);
  if (city) {
    return {
      title: city.name,
      sub: `买${city.price} 通${city.toll} 防${city.defense}`,
      tone: "#8e2f1f",
      city
    };
  }
  if (position === 1) return normalTiles[0];
  return normalTiles[position % normalTiles.length];
}

function text(x, y, content, size, fill = "#43220f", weight = 700, anchor = "middle") {
  return `<text x="${x}" y="${y}" font-family="'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${xmlEscape(content)}</text>`;
}

function wrappedText(lines, x, y, size, gap, fill = "#43220f", weight = 700, anchor = "middle") {
  return lines.map((line, index) => text(x, y + index * gap, line, size, fill, weight, anchor)).join("\n");
}

function tile(position) {
  const cx = 2480.5;
  const cy = 1754;
  const rx = 1960;
  const ry = 1245;
  const angle = 90 - ((position - 1) * 360) / 30;
  const p = polar(cx, cy, rx, ry, angle);
  const data = tileData(position);
  const isCity = !!data.city;
  const w = isCity ? 310 : 260;
  const h = isCity ? 190 : 164;
  const x = p.x - w / 2;
  const y = p.y - h / 2;
  const rotate = angle > 90 && angle < 270 ? angle + 90 : angle - 90;
  const titleSize = isCity ? 50 : 38;
  const subSize = isCity ? 27 : 24;
  const frame = isCity ? "#f2cf73" : "#d0a15f";
  const glow = isCity ? "filter='url(#cityGlow)'" : "";

  return `
    <g transform="rotate(${rotate.toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)})" ${glow}>
      <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w}" height="${h}" rx="26" fill="#f3ddb0" stroke="#5a2e17" stroke-width="${isCity ? 10 : 7}"/>
      <rect x="${(x + 14).toFixed(2)}" y="${(y + 14).toFixed(2)}" width="${w - 28}" height="${h - 28}" rx="18" fill="${data.tone}" opacity="0.9"/>
      <circle cx="${(x + 42).toFixed(2)}" cy="${(y + 42).toFixed(2)}" r="${isCity ? 32 : 27}" fill="#ffe8a8" stroke="${frame}" stroke-width="5"/>
      ${text((x + 42).toFixed(2), (y + 54).toFixed(2), position, isCity ? 31 : 26, "#5a2a12", 900)}
      ${text(p.x.toFixed(2), (y + (isCity ? 82 : 76)).toFixed(2), data.title, titleSize, "#fff1bd", 900)}
      ${text(p.x.toFixed(2), (y + (isCity ? 132 : 118)).toFixed(2), data.sub, subSize, "#ffedc7", 800)}
    </g>`;
}

function cityPanel(city, index) {
  const panelW = 545;
  const panelH = 170;
  const left = index < 3 ? 410 : 4006;
  const top = 545 + (index % 3) * 250;
  return `
    <g>
      <rect x="${left}" y="${top}" width="${panelW}" height="${panelH}" rx="20" fill="#f5dfad" stroke="#6a3518" stroke-width="6"/>
      <rect x="${left + 18}" y="${top + 18}" width="92" height="134" rx="14" fill="#8e2f1f" stroke="#d6a64d" stroke-width="4"/>
      ${text(left + 64, top + 79, city.position, 40, "#ffe8a8", 900)}
      ${text(left + 137, top + 63, city.name, 42, "#5a2413", 900, "start")}
      ${text(left + 137, top + 108, `购买 ${city.price}  通行 ${city.toll}  征税 ${city.income}`, 25, "#643b1f", 800, "start")}
      ${text(left + 137, top + 142, `防御 ${city.defense}  升级 ${city.upgrade_cost}`, 25, "#643b1f", 800, "start")}
    </g>`;
}

const tiles = Array.from({ length: 30 }, (_, i) => tile(i + 1)).join("\n");
const cityPanels = cities.map(cityPanel).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="paperGlow" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#fff0c5"/>
      <stop offset="58%" stop-color="#e5b865"/>
      <stop offset="100%" stop-color="#8a3f21"/>
    </radialGradient>
    <linearGradient id="river" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6db0b1" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#245d62" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#3b1d0d" flood-opacity="0.35"/>
    </filter>
    <filter id="cityGlow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#ffd36c" flood-opacity="0.82"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#4a2414"/>
  <rect x="120" y="110" width="4721" height="3288" rx="110" fill="url(#paperGlow)" stroke="#2a1409" stroke-width="34"/>
  <rect x="205" y="195" width="4551" height="3118" rx="78" fill="none" stroke="#f5d583" stroke-width="9" opacity="0.75"/>

  <path d="M 930 2450 C 1320 2030, 1230 1570, 1770 1355 C 2400 1105, 2580 1630, 3195 1370 C 3680 1165, 3770 790, 4230 615"
        fill="none" stroke="url(#river)" stroke-width="112" stroke-linecap="round" opacity="0.62"/>
  <path d="M 705 930 L 845 705 L 980 930 Z M 930 980 L 1100 700 L 1268 980 Z M 3810 2530 L 3985 2240 L 4165 2530 Z M 4050 2578 L 4230 2290 L 4410 2578 Z"
        fill="#7a5c39" opacity="0.52"/>
  <path d="M 1180 2620 C 1600 2800, 2040 2880, 2500 2865 C 3050 2848, 3470 2700, 3810 2440"
        fill="none" stroke="#6d8b4f" stroke-width="54" stroke-linecap="round" opacity="0.42"/>

  <ellipse cx="2480.5" cy="1754" rx="2082" ry="1365" fill="none" stroke="#5d2d14" stroke-width="24" opacity="0.42"/>
  <ellipse cx="2480.5" cy="1754" rx="1748" ry="1085" fill="none" stroke="#fff2b7" stroke-width="8" stroke-dasharray="32 26" opacity="0.55"/>

  <g filter="url(#shadow)">
    <rect x="1652" y="1128" width="1658" height="950" rx="46" fill="#f5dc9d" stroke="#5a2b13" stroke-width="12"/>
    <rect x="1700" y="1176" width="1562" height="854" rx="34" fill="#3d2114" opacity="0.92"/>
    ${text(2481, 1310, "冰橙星星乐", 86, "#ffe9a8", 900)}
    ${text(2481, 1410, "三国篇 · 起源", 112, "#f7c85f", 900)}
    ${wrappedText(["30 格循环地图 · 主持机自动结算", "掷骰移动，经过起点获得银两奖励", "遇城池可购买、升级、交费或攻城"], 2481, 1535, 43, 68, "#f6dfaa", 800)}
    <rect x="1905" y="1790" width="1152" height="120" rx="20" fill="#7b381d" stroke="#d6a64d" stroke-width="5"/>
    ${text(2481, 1868, "起点格：经过或到达均按主持机记录位置", 35, "#fff0bd", 900)}
  </g>

  ${tiles}

  ${cityPanels}

  <g>
    <rect x="650" y="2865" width="3660" height="250" rx="30" fill="#f4dda9" stroke="#643116" stroke-width="8" opacity="0.95"/>
    ${text(770, 2938, "图例", 42, "#702a17", 900, "start")}
    ${text(1000, 2938, "城池：按格子标注购买/通行/防御", 30, "#4d2a14", 800, "start")}
    ${text(1000, 2995, "抽事件：打开小程序抽事件并播放语音", 30, "#4d2a14", 800, "start")}
    ${text(1000, 3052, "资源/武将：由主持机直接变更玩家数值或抽人物卡", 30, "#4d2a14", 800, "start")}
    ${text(3150, 2938, "建议打印：A3 横版 / 300DPI", 30, "#4d2a14", 800, "start")}
    ${text(3150, 2995, "棋子按 1-30 循环前进", 30, "#4d2a14", 800, "start")}
    ${text(3150, 3052, "不用在地图额外放置事件标记", 30, "#4d2a14", 800, "start")}
  </g>

  <rect x="120" y="110" width="4721" height="3288" rx="110" fill="none" stroke="#2a1409" stroke-width="34"/>
</svg>`;

const svgPath = path.join(outDir, "sanguo-origin-print-map-a3.svg");
const pngPath = path.join(outDir, "sanguo-origin-print-map-a3.png");
const htmlPath = path.join(outDir, "sanguo-origin-print-map-a3.html");
const pdfPath = path.join(outDir, "sanguo-origin-print-map-a3.pdf");

fs.writeFileSync(svgPath, svg, "utf8");

async function main() {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>冰橙星星乐 三国篇 起源 打印地图</title>
  <style>
    @page { size: A3 landscape; margin: 0; }
    html, body { margin: 0; width: 100%; height: 100%; background: #4a2414; }
    img { width: 100vw; height: 100vh; object-fit: contain; display: block; }
  </style>
</head>
<body><img src="${path.basename(svgPath)}" /></body>
</html>`;
  fs.writeFileSync(htmlPath, html, "utf8");

  try {
    const { chromium } = require("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: pngPath, fullPage: true });
    await page.pdf({ path: pdfPath, format: "A3", landscape: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    await browser.close();
  } catch (error) {
    console.warn(`Skipped PNG/PDF export: ${error.message}`);
  }

  console.log(JSON.stringify({ svgPath, pngPath, htmlPath, pdfPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
