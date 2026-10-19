const pageTitleMap = {
  home: "bg-home",
  room: "bg-room",
  characters: "bg-characters",
  events: "bg-events",
  imageGenerate: "bg-image-generate",
  imageMonitor: "bg-image-monitor"
};

const localBackgrounds = {
  "bg-home": "",
  "bg-room": "",
  "bg-characters": "",
  "bg-events": "",
  "bg-image-generate": "",
  "bg-image-monitor": ""
};

function buildStyle(imagePath) {
  if (!imagePath) return "";
  return `background-image: linear-gradient(180deg, rgba(33, 18, 8, 0.22), rgba(244, 221, 166, 0.42)), url("${imagePath}");`;
}

function apply(page, pageKey) {
  const title = pageTitleMap[pageKey];
  if (!page || !title) return;
  page.setData({ pageBackgroundStyle: buildStyle(localBackgrounds[title]) });
}

function clear() {
  console.log("[本地背景] 当前背景使用 app.wxss 默认底色，无需清理远程缓存");
}

module.exports = {
  apply,
  clear
};
