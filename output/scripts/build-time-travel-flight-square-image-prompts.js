const fs = require("fs");
const path = require("path");
const theme = require("../../miniprogram/themes/time-travel-flight/theme");

const out = path.join("output", "themes", "time-travel-flight", "prompts");
fs.mkdirSync(out, { recursive: true });

const rows = [];
const style = "统一正方形构图，温暖手绘日系动画电影感，柔和水彩质感，童话冒险氛围，适合亲子桌游和微信小程序，明亮阳光，红黄蓝绿飞行棋点缀，不要紫色或紫蓝色，不要水印，不要文字";

const characterSceneHints = {
  "秦始皇": "站在长城修筑与古代车马道路的场景中，远处有山岭长城和工程队伍，表现统一与大型工程",
  "蒙恬": "置身北方边关长城烽火台场景，身边有边塞地图和守望士兵，表现护航与守护",
  "胡夫": "置身古埃及金字塔营造场景，远处有尼罗河、石块运输和金字塔，表现古代工程",
  "伊姆霍特普": "置身古埃及建筑测量场景，手持卷轴和测量工具，背后是阶梯金字塔工地",
  "维斯帕先": "置身古罗马斗兽场建设场景，拱券结构和城市广场在背景中，表现公共工程",
  "提图斯": "置身罗马斗兽场开幕庆典场景，背景有人群欢呼和旗帜，表现公共庆典",
  "伯里克利": "置身雅典卫城和帕特农神庙建设场景，背景有石柱、工匠和城邦集会",
  "菲迪亚斯": "置身古希腊雕塑工坊与神庙场景，身旁有未完成雕像和石柱",
  "沙贾汗": "置身泰姬陵花园与白色大理石建筑场景，背景有水渠、穹顶和工匠",
  "帕查库特克": "置身安第斯山地和马丘比丘石砌平台场景，背景有梯田、山路和云雾",
  "苏利耶跋摩二世": "置身吴哥窟庙山和护城河场景，背景有浮雕、莲花和高棉建筑",
  "纳巴泰商队长": "置身佩特拉峡谷和沙漠商队场景，背景有玫瑰色岩壁、骆驼和古城门",
  "玛雅天文学者": "置身玛雅金字塔和观星台场景，背景有星空、历法石刻和丛林",
  "古不列颠祭司": "置身巨石阵黎明仪式场景，背景有石环、草地和柔和晨光",
  "拉帕努伊首领": "置身复活节岛摩艾石像和海岸场景，背景有岛屿草坡和太平洋",
  "拉美西斯二世": "置身阿布辛贝神庙门前场景，背景有巨大石像、沙漠阳光和尼罗河意象"
};

function add(id, prompt) {
  rows.push({
    id,
    prompt,
    size: "1024x1024",
    quality: "auto",
    n: 1
  });
}

theme.data.cities.forEach((spot) => {
  add(
    `spot-${String(spot.id).padStart(2, "0")}`,
    `世界历史景点正方形卡片插画：${spot.name}，地区：${spot.region || "世界"}。主体景点必须清晰可辨，画面加入一架小飞机、飞行棋棋子和护照印章元素，体现旅行打卡和历史学习。${style}`
  );
});

theme.data.characters.forEach((character) => {
  const scene = characterSceneHints[character.name] || `置身${character.faction}相关历史景点场景`;
  add(
    `character-${String(character.id).padStart(2, "0")}`,
    `历史人物卡正方形插画：${character.name}，身份：${character.role_type}。人物不是单纯头像，要${scene}。画面要有教育意义，能看出人物与${character.faction}的历史关系，半身到三分之二身构图，背景细节丰富但不遮挡人物。${style}`
  );
});

theme.data.events.forEach((event) => {
  add(
    `event-${String(event.id).padStart(2, "0")}`,
    `飞行棋随机事件正方形卡片插画：${event.title}。事件内容：${event.effect_desc}。画面必须围绕线下传统飞行棋、小飞机、骰子、机场、航线、棋子移动或世界旅行展开，表现这个事件发生的一瞬间，适合儿童和家庭桌游。${style}`
  );
});

const file = path.join(out, "imagegen-square-prompts.jsonl");
fs.writeFileSync(file, rows.map((item) => JSON.stringify(item)).join("\n"), "utf8");
console.log(rows.length, file);
