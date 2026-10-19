const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "..");
const sourceDir = path.join(root, "output", "imagegen", "time-travel-flight-square-yunwu");
const promptFile = path.join(root, "output", "themes", "time-travel-flight", "prompts", "imagegen-square-prompts.jsonl");
const finalBase = path.join(root, "output", "cdn-upload-final", "themes", "time-travel-flight");
const backupBase = path.join(root, "output", "cdn-upload-final-original-backup", "themes", "time-travel-flight", "yunwu-square-png-originals");

function safeResolve(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(root)) {
    throw new Error(`路径超出项目目录：${resolved}`);
  }
  return resolved;
}

function getTargetDir(id) {
  if (id.startsWith("spot-")) return path.join(finalBase, "spots");
  if (id.startsWith("character-")) return path.join(finalBase, "characters");
  if (id.startsWith("event-")) return path.join(finalBase, "events");
  throw new Error(`未知资源类型：${id}`);
}

function readJobs() {
  return fs.readFileSync(promptFile, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function makeJpeg(input, output) {
  let quality = 82;
  let buffer = await sharp(input)
    .resize(1024, 1024, { fit: "cover", position: "centre" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  while (buffer.length > 1024 * 1024 && quality > 58) {
    quality -= 6;
    buffer = await sharp(input)
      .resize(1024, 1024, { fit: "cover", position: "centre" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  fs.writeFileSync(output, buffer);
  return { quality, bytes: buffer.length };
}

async function main() {
  safeResolve(sourceDir);
  safeResolve(finalBase);
  safeResolve(backupBase);

  const jobs = readJobs();
  const results = [];
  for (const job of jobs) {
    const id = job.id;
    const source = path.join(sourceDir, `${id}.png`);
    if (!fs.existsSync(source)) {
      throw new Error(`缺少云雾生成图片：${source}`);
    }

    const targetDir = getTargetDir(id);
    const backupDir = path.join(backupBase, path.basename(targetDir));
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(backupDir, { recursive: true });

    const backup = path.join(backupDir, `${id}.png`);
    const target = path.join(targetDir, `${id}.jpg`);
    fs.copyFileSync(source, backup);
    const info = await makeJpeg(source, target);
    const meta = await sharp(target).metadata();
    results.push({
      id,
      target: path.relative(root, target),
      width: meta.width,
      height: meta.height,
      kb: Math.round(info.bytes / 1024),
      quality: info.quality
    });
  }

  const oversized = results.filter((item) => item.kb > 1024);
  console.table(results);
  if (oversized.length) {
    throw new Error(`仍有超过 1MB 的图片：${oversized.map((item) => item.id).join(", ")}`);
  }
  console.log(`已整理 ${results.length} 张时空旅行飞行棋正方形图片。`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
