const IMAGE = "https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/events";
const AUDIO = "https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/audio";
function event(id, title, type, rarity, trigger, effect, action, rules) { return { id, title, event_type: type, rarity, trigger_condition: trigger, effect_desc: effect, board_action: action, image_path: `${IMAGE}/event-${id}.png`, sound_path: `${AUDIO}/event-${id}.mp3`, effect_rules: rules || {} }; }
module.exports = [
  event(1, "金矿发现", "资源事件", "普通", "任意回合", "当前玩家金币 +3。", "系统结算：金币 +3。", { current: { silver: 3 } }),
  event(2, "木材短缺", "资源事件", "普通", "移动后", "当前玩家木材 -1，最低为 0。", "系统结算：木材 -1。", { current: { grain: -1 } }),
  event(3, "流浪英雄加入", "英雄事件", "稀有", "经过酒馆", "抽取一张 T2 英雄卡。", "系统结算：自动抽取一名 T2 英雄。", { drawCharacter: { tier: "T2" } }),
  event(4, "传送术", "魔法事件", "稀有", "移动前", "下次移动 +3。", "系统结算：记录移动修正 +3。", { current: { move_adjust: 3 } }),
  event(5, "迟缓魔法", "魔法事件", "普通", "移动前", "下次移动 -2，最低移动 1 格。", "系统结算：记录移动修正 -2。", { current: { move_adjust: -2 } }),
  event(6, "城墙加固", "城镇事件", "稀有", "经过己方城镇", "当前玩家获得 1 个防御令。", "系统结算：防御令 +1。", { current: { guard_tokens: 1 } }),
  event(7, "兵营征召", "兵团事件", "普通", "经过兵营", "当前玩家军力 +2。", "系统结算：军力 +2。", { current: { battle: 2 } }),
  event(8, "元素风暴", "魔法事件", "重大", "落到元素圣殿", "所有玩家魔力 +1，当前玩家下次移动 +1。", "系统结算：全员魔力 +1，当前玩家移动 +1。", { all: { prestige: 1 }, current: { move_adjust: 1 } }),
  event(9, "亡灵苏醒", "阵营事件", "重大", "墓园区域", "当前玩家军力 +2、魔力 +1。", "系统结算：军力 +2、魔力 +1。", { current: { battle: 2, prestige: 1 } }),
  event(10, "失落卷轴", "奇遇事件", "稀有", "宝物库", "获得 1 次魔法重抽机会。", "系统结算：重抽机会 +1。", { current: { redraw_tokens: 1 } }),
  event(11, "城镇叛乱", "城镇事件", "重大", "经过敌方城镇", "当前玩家暂停行动 1 次，但获得金币 +2。", "系统结算：暂停 1 次、金币 +2。", { current: { paused_turns: 1, silver: 2 } }),
  event(12, "英雄决斗", "战斗事件", "普通", "战场格", "当前玩家军力 +1；若拥有英雄卡则再得金币 +1。", "系统结算：军力 +1，并检查英雄数量奖励。", { current: { battle: 1 }, allyCountBonus: { value: 1, changes: { silver: 1 } } })
];
