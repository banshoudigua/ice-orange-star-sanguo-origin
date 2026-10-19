const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const promptDir = path.join(root, "themes", "heroes3-kingdoms", "prompts");
fs.mkdirSync(promptDir, { recursive: true });

const style = "明亮精致的西方奇幻亲子桌游插画，丰富细节，清晰主体，金色、森林绿、砖红、青绿和自然石材配色，避免紫色和紫蓝色，不要文字，不要水印，不要游戏商标，不要直接临摹现有游戏画面";
const imageJobs = [];
function image(id, prompt, size = "1024x1024") { imageJobs.push({ id, filename: id, prompt: `${prompt}。${style}。`, size, quality: "auto", n: 1 }); }

image("kingdoms-hero", "九大奇幻阵营在辽阔魔法大陆上集结，前景是骑士、森林游侠和法师，远景可见圣堂、森林、高塔、熔岩、墓城和元素圣殿，适合作为微信小程序主题首页主视觉", "1536x1024");
image("victory", "胜利领主站在城堡高台举起旗帜，英雄与多种奇幻兵团共同庆祝，金色晨光，适合作为桌游胜利页面", "1536x1024");
image("kingdoms-map", "俯视奇幻王国桌游棋盘地图，30格循环道路串联九座不同阵营城镇，并有英雄酒馆、魔法学院、兵团营地、宝物库和传送门，适合A3打印，不出现任何文字和数字", "1536x1024");
image("guide-hero", "酒馆内多位奇幻英雄等待领主招募，骑士、巡林客、法师和女巫围绕任务桌");
image("guide-town", "奇幻城镇经营场景，工匠加固城墙，商队进入城门，领主查看城镇建筑");
image("guide-magic", "英雄率领兵团在魔法阵前集结，火水风土四种元素环绕但画面整体不使用紫色");

const heroes = ["圣堂骑士，白金盔甲与红色披风","森林巡林客，绿色斗篷与长弓","银塔法师，青白法袍与金色法杖","地狱领主，黑红铠甲与火焰背景","死亡骑士，骨白与灰绿色重甲","地下领主，暗色岩石铠甲与红宝石","雷霆酋长，山地野蛮战士与巨斧","沼堡女巫，橄榄绿服饰与沼泽药剂","元素使，火水风土元素环绕","王国牧师，米白金色圣袍","独角兽使者，森林德鲁伊与独角兽","炼金术士，青铜器械与炼金瓶"];
heroes.forEach((name, index) => image(`hero-${index + 1}`, `${name}，正面半身英雄卡人物插画，表情清楚，背景体现所属阵营城镇`));

const towns = ["圣堂城，白石城墙、金色尖顶与红色旗帜","林冠城，巨树、木制高塔与瀑布","银塔城，雪山中的青白魔法高塔","焚炎城，熔岩峡谷中的黑红恶魔堡垒","亡者墓城，灰绿色雾气中的古老墓园城堡","深渊城，地下洞窟中的岩石城堡和红色晶石","雷霆要塞，山巅木石堡垒与战鼓","沼堡，湿地中的木石防御城镇","元素圣殿，火水风土四区围绕中央圣殿"];
towns.forEach((name, index) => image(`town-${index + 1}`, `${name}，完整城镇全景，适合作为地点介绍图`));

const events = ["冒险者在山谷发现闪耀金矿","暴风雨摧毁运送木材的车队","流浪英雄在热闹酒馆接受招募","英雄通过金色传送门跨越大陆","军队被迟缓魔法困在泥泞道路","工匠和士兵共同加固城墙","兵营中奇幻兵团列队接受征召","火水风土元素形成壮观风暴","古老墓园中亡灵军团苏醒","英雄在遗迹宝箱中发现魔法卷轴","城镇居民在城门前发生叛乱","两位英雄在野外战场进行荣誉决斗"];
events.forEach((name, index) => image(`event-${index + 1}`, `${name}，奇幻桌游事件卡场景图，不使用人物头像构图`));

const ttsJobs = [{ id: "opening", filename: "opening", voice: "fable", format: "mp3", text: "魔法大陆的九大阵营同时吹响远征号角。城堡、森林、高塔与深渊，都在寻找能够统一王国的领主。英雄从酒馆出发，兵团在营地集结，古老魔法正在棋盘上苏醒。占领城镇，积累金币，招募英雄，让你的旗帜走得更远。王国远征，现在开始。" }];
heroes.forEach((name, index) => ttsJobs.push({ id: `hero-${index + 1}`, filename: `hero-${index + 1}`, voice: index % 2 ? "marin" : "cedar", format: "mp3", text: `你招募了${name.split("，")[0]}。新的英雄已经加入远征队伍。` }));
towns.forEach((name, index) => ttsJobs.push({ id: `town-${index + 1}`, filename: `town-${index + 1}`, voice: "sage", format: "mp3", text: `你抵达${name.split("，")[0]}。这里是一个拥有独特建筑与兵团传统的重要城镇，请选择占领、升级、征税或发起争夺。` }));
const eventTexts = ["发现新的金矿，当前玩家获得三枚金币。","木材车队遭遇暴风雨，当前玩家失去一份木材。","一名流浪英雄来到酒馆，当前玩家抽取一张精英英雄卡。","传送术生效，当前玩家下一次移动增加三格。","迟缓魔法笼罩道路，当前玩家下一次移动减少两格。","城墙加固完成，当前玩家获得一个防御令。","兵营开始征召，当前玩家军力增加两点。","元素风暴席卷大陆，所有玩家魔力增加一点，当前玩家下一次移动增加一格。","亡灵军团从墓园苏醒，当前玩家军力增加两点，魔力增加一点。","你发现了失落卷轴，获得一次魔法事件重抽机会。","城镇发生叛乱，当前玩家暂停行动一次，并获得两枚金币补偿。","英雄决斗开始，当前玩家军力增加一点，拥有英雄时再获得一枚金币。"];
eventTexts.forEach((text, index) => ttsJobs.push({ id: `event-${index + 1}`, filename: `event-${index + 1}`, voice: "cedar", format: "mp3", text }));

fs.writeFileSync(path.join(promptDir, "images.jsonl"), imageJobs.map((item) => JSON.stringify(item)).join("\n") + "\n");
fs.writeFileSync(path.join(promptDir, "tts.jsonl"), ttsJobs.map((item) => JSON.stringify(item)).join("\n") + "\n");
console.log(JSON.stringify({ imageJobs: imageJobs.length, ttsJobs: ttsJobs.length, promptDir }, null, 2));
