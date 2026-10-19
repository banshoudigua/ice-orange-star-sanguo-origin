const fs = require("fs");
const path = require("path");

const outputRoot = path.resolve(__dirname, "..");
const sourceImages = path.join(outputRoot, "themes", "heroes3-kingdoms", "generated-images");
const sourceAudio = path.join(outputRoot, "themes", "heroes3-kingdoms", "generated-audio");
const finalRoot = path.join(outputRoot, "cdn-upload-final", "themes", "heroes3-kingdoms");

["home", "heroes", "towns", "events", "maps", "audio"].forEach((folder) => {
  fs.mkdirSync(path.join(finalRoot, folder), { recursive: true });
});

function copy(source, target) {
  if (!fs.existsSync(source)) return false;
  fs.copyFileSync(source, target);
  return true;
}

const copied = [];
const missing = [];
const imageTargets = {
  "kingdoms-hero.png": "home/kingdoms-hero.png",
  "victory.png": "home/victory.png",
  "kingdoms-map.png": "maps/kingdoms-map.png",
  "guide-hero.png": "home/guide-hero.png",
  "guide-town.png": "home/guide-town.png",
  "guide-magic.png": "home/guide-magic.png"
};
for (let i = 1; i <= 12; i += 1) imageTargets[`hero-${i}.png`] = `heroes/hero-${i}.png`;
for (let i = 1; i <= 9; i += 1) imageTargets[`town-${i}.png`] = `towns/town-${i}.png`;
for (let i = 1; i <= 12; i += 1) imageTargets[`event-${i}.png`] = `events/event-${i}.png`;

Object.keys(imageTargets).forEach((name) => {
  const target = imageTargets[name];
  if (copy(path.join(sourceImages, name), path.join(finalRoot, target))) copied.push(target);
  else missing.push(name);
});

const audioNames = ["opening.mp3"];
for (let i = 1; i <= 12; i += 1) audioNames.push(`hero-${i}.mp3`);
for (let i = 1; i <= 9; i += 1) audioNames.push(`town-${i}.mp3`);
for (let i = 1; i <= 12; i += 1) audioNames.push(`event-${i}.mp3`);
audioNames.forEach((name) => {
  if (copy(path.join(sourceAudio, name), path.join(finalRoot, "audio", name))) copied.push(`audio/${name}`);
  else missing.push(name);
});

console.log(JSON.stringify({ copied: copied.length, missing: missing.length, missingFiles: missing, finalRoot }, null, 2));
if (missing.length) process.exitCode = 2;
