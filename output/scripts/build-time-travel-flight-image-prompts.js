const fs = require("fs");
const path = require("path");
const theme = require("../../miniprogram/themes/time-travel-flight/theme");

const out = path.join("output", "themes", "time-travel-flight", "prompts");
fs.mkdirSync(out, { recursive: true });

const rows = [];
const style = "明亮可爱的桌游插画风格，适合微信小程序，暖色阳光，红黄蓝绿飞行棋配色，画面清晰，细节丰富，不要紫色或紫蓝色，不要水印";

function add(id, prompt, size) {
  rows.push({
    id,
    prompt,
    size: size || "1024x1024",
    quality: "auto",
    n: 1
  });
}

add(
  "home-time-travel-flight-hero",
  `一张可爱的时空旅行飞行棋主题首页封面图，传统飞行棋棋盘、四架红黄蓝绿小飞机、地球、世界历史景点剪影、云朵和时空航线，画面里要有清晰中文标题“时空旅行飞行棋”，标题融入画面中央偏上，${style}`,
  "1536x1024"
);
add("victory-flight", `飞行棋胜利画面，四架彩色小飞机抵达中心终点，世界景点印章和星光庆祝，适合桌游胜利弹窗，不要文字，${style}`);
add("rule-takeoff", `飞行棋起飞规则说明插画，机场、骰子六点和一点、四枚小飞机准备从机场出发，亲子桌游规则感，不要文字，${style}`);
add("rule-route", `飞行棋同色跳跃和虚线飞行路线规则插画，小飞机沿同色格跳跃，虚线航线穿过棋盘中心，不要文字，${style}`);
add("rule-spots", `飞行棋世界景点打卡规则插画，小飞机降落在景点旁，护照印章、相机、世界地图，不要文字，${style}`);

theme.data.cities.forEach((spot) => {
  add(
    `spot-${String(spot.id).padStart(2, "0")}`,
    `世界历史景点卡插画：${spot.name}，地区：${spot.region || "世界"}，可爱但尊重历史的旅行打卡卡片风格，主体景点清晰可辨，飞行棋小飞机从天空经过，不能出现文字，${style}`
  );
});

theme.data.characters.forEach((character) => {
  add(
    `character-${String(character.id).padStart(2, "0")}`,
    `历史人物卡头像插画：${character.name}，身份：${character.role_type}，关联景点：${character.faction}，半身像，友好可爱的桌游卡牌角色设计，服饰参考对应文明历史风格，不能出现文字，不能出现现代物品，${style}`
  );
});

theme.data.events.forEach((event) => {
  add(
    `event-${String(event.id).padStart(2, "0")}`,
    `飞行棋随机事件卡插画：${event.title}。事件内容：${event.effect_desc} 画面表现线下飞行棋、小飞机、骰子、机场、航线或世界旅行中的轻松随机事件，不能出现文字，${style}`
  );
});

const file = path.join(out, "imagegen-prompts.jsonl");
fs.writeFileSync(file, rows.map((item) => JSON.stringify(item)).join("\n"), "utf8");
console.log(rows.length, file);
