const CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/dice-score";

module.exports = {
  id: "dice-score",
  title: "掷色器+计分器",
  subtitle: "现场记分工具",
  description: "保留原掷骰功能的基础上，增加玩家计分板、实时分数查看和裁判快速调整面板。",
  isTool: true,
  toolPath: "/pages/dice-tool/dice-tool?mode=scorekeeper",
  toolButtonText: "进入计分器",
  heroImage: `${CDN_BASE}/home/dice-score-home-hero-wide-v2.jpg`,
  heroThumb: `${CDN_BASE}/home/dice-score-home-hero-wide-v2.jpg`
};
