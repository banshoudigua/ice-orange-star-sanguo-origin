const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "..");
const outDir = path.join(root, "output", "cdn-upload-final", "themes", "dice-score", "home");
const backupDir = path.join(root, "output", "cdn-upload-final-original-backup", "themes", "dice-score", "home");
const sourceDir = path.join(root, "output", "cdn-upload-final");

const diceArt1 = path.join(sourceDir, "dice-art-1.png");
const diceArt2 = path.join(sourceDir, "dice-art-2.png");
const diceArt3 = path.join(sourceDir, "dice-art-3.png");
const diceArt6 = path.join(sourceDir, "dice-art-6.png");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function svgLayer(width, height, body) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
  );
}

function titleLayer() {
  return svgLayer(1536, 1024, `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8d4d1d"/>
        <stop offset="35%" stop-color="#5b2d12"/>
        <stop offset="100%" stop-color="#24150c"/>
      </linearGradient>
      <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff2c5"/>
        <stop offset="100%" stop-color="#f0b844"/>
      </linearGradient>
      <filter id="blurSoft"><feGaussianBlur stdDeviation="22"/></filter>
    </defs>
    <rect width="1536" height="1024" fill="url(#bg)"/>
    <circle cx="220" cy="190" r="180" fill="#f5d78b" opacity="0.2" filter="url(#blurSoft)"/>
    <circle cx="1320" cy="160" r="170" fill="#f0c66f" opacity="0.14" filter="url(#blurSoft)"/>
    <circle cx="1200" cy="850" r="220" fill="#9d6327" opacity="0.18" filter="url(#blurSoft)"/>

    <rect x="84" y="84" width="1368" height="856" rx="40" fill="rgba(255,255,255,0.06)" stroke="#d5a34c" stroke-width="4"/>

    <text x="768" y="170" text-anchor="middle"
      font-family="Microsoft YaHei, PingFang SC, sans-serif"
      font-size="108" font-weight="900"
      fill="url(#title)" stroke="#6b3f17" stroke-width="16" paint-order="stroke fill">
      掷色器+计分器
    </text>
    <text x="768" y="236" text-anchor="middle"
      font-family="Microsoft YaHei, PingFang SC, sans-serif"
      font-size="34" font-weight="700"
      fill="#ffe2a5">
      掷骰记分一体工具 · 适合现场桌游裁判和快速计分
    </text>

    <rect x="872" y="286" width="452" height="486" rx="28" fill="#f0d39a" opacity="0.96" stroke="#a76e2e" stroke-width="4"/>
    <text x="1098" y="344" text-anchor="middle"
      font-family="Microsoft YaHei, PingFang SC, sans-serif"
      font-size="42" font-weight="900"
      fill="#6b3f17">实时看板</text>
    <rect x="910" y="382" width="376" height="82" rx="18" fill="#fff6e3" stroke="#d5a34c" stroke-width="3"/>
    <rect x="910" y="484" width="376" height="82" rx="18" fill="#fff6e3" stroke="#d5a34c" stroke-width="3"/>
    <rect x="910" y="586" width="376" height="82" rx="18" fill="#fff6e3" stroke="#d5a34c" stroke-width="3"/>
    <rect x="910" y="688" width="376" height="82" rx="18" fill="#fff6e3" stroke="#d5a34c" stroke-width="3"/>
    <circle cx="954" cy="423" r="26" fill="#8d361e"/>
    <circle cx="954" cy="525" r="26" fill="#8d361e"/>
    <circle cx="954" cy="627" r="26" fill="#8d361e"/>
    <circle cx="954" cy="729" r="26" fill="#8d361e"/>
    <text x="954" y="432" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="900" fill="#fff4cb">1</text>
    <text x="954" y="534" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="900" fill="#fff4cb">2</text>
    <text x="954" y="636" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="900" fill="#fff4cb">3</text>
    <text x="954" y="738" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="900" fill="#fff4cb">4</text>
    <text x="1016" y="430" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="32" font-weight="900" fill="#3b230f">玩家 1</text>
    <text x="1016" y="533" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="32" font-weight="900" fill="#3b230f">玩家 2</text>
    <text x="1016" y="635" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="32" font-weight="900" fill="#3b230f">玩家 3</text>
    <text x="1016" y="737" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="32" font-weight="900" fill="#3b230f">玩家 4</text>
    <text x="1240" y="430" text-anchor="end" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="900" fill="#7d2c18">120</text>
    <text x="1240" y="533" text-anchor="end" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="900" fill="#7d2c18">96</text>
    <text x="1240" y="635" text-anchor="end" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="900" fill="#7d2c18">88</text>
    <text x="1240" y="737" text-anchor="end" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="900" fill="#7d2c18">112</text>

    <rect x="116" y="282" width="640" height="528" rx="34" fill="#f0d39a" opacity="0.16" stroke="#f0c66f" stroke-width="4"/>
    <text x="140" y="860" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="34" font-weight="800" fill="#ffe7b5">点玩家图标，直接加分或减分</text>
    <text x="140" y="904" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="700" fill="#f0d39a">保留原掷骰功能，记分更快更直观</text>
  `);
}

async function main() {
  ensureDir(outDir);
  ensureDir(backupDir);

  const base = sharp({
    create: {
      width: 1536,
      height: 1024,
      channels: 4,
      background: "#8d4d1d"
    }
  });

  const overlays = [
    { input: titleLayer() },
    { input: await sharp(diceArt3).resize(390, 390, { fit: "contain" }).png().toBuffer(), top: 330, left: 122 },
    { input: await sharp(diceArt1).resize(180, 180, { fit: "contain" }).png().toBuffer(), top: 108, left: 76 },
    { input: await sharp(diceArt6).resize(180, 180, { fit: "contain" }).png().toBuffer(), top: 758, left: 286 },
    { input: await sharp(diceArt2).resize(180, 180, { fit: "contain" }).png().toBuffer(), top: 170, left: 1260 }
  ];

  const outputJpg = path.join(outDir, "dice-score-home-hero-wide-v1.jpg");
  const backupPng = path.join(backupDir, "dice-score-home-hero-wide-v1.png");

  const composed = await base.composite(overlays).png().toBuffer();
  fs.writeFileSync(backupPng, composed);

  let quality = 86;
  let jpg = await sharp(backupPng).jpeg({ quality, mozjpeg: true }).toBuffer();
  while (jpg.length > 1024 * 1024 && quality > 60) {
    quality -= 6;
    jpg = await sharp(backupPng).jpeg({ quality, mozjpeg: true }).toBuffer();
  }
  fs.writeFileSync(outputJpg, jpg);

  const meta = await sharp(outputJpg).metadata();
  console.log(`${path.relative(root, outputJpg)} ${meta.width}x${meta.height} ${Math.round(jpg.length / 1024)}KB quality=${quality}`);
}

main();
