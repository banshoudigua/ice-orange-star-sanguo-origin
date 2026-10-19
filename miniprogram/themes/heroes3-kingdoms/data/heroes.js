const BASE = "https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/heroes";
function hero(id, name, faction, tier, role, force, strategy, fame, command, skill, desc) {
  return { id, name, faction, tier, role_type: role, force_value: force, strategy_value: strategy, fame_value: fame, command_value: command, skill_name: skill, skill_desc: desc, quote_text: `${name}：远征的号角已经吹响。`, image_path: `${BASE}/hero-${id}.png`, sound_path: `https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/audio/hero-${id}.mp3` };
}
module.exports = [
  hero(1, "圣堂骑士", "城堡", "T1", "骑士", 88, 68, 76, 94, "王国号令", "城镇争夺时军力 +20。"),
  hero(2, "森林巡林客", "壁垒", "T1", "巡林客", 78, 82, 74, 84, "林间疾行", "下一次移动额外 +2。"),
  hero(3, "银塔法师", "塔楼", "T1", "法师", 62, 98, 82, 76, "奥术专精", "魔法事件结算时魔力额外 +1。"),
  hero(4, "地狱领主", "地狱", "T1", "恶魔领主", 96, 62, 52, 86, "烈焰契约", "军力事件成功时金币 +1。"),
  hero(5, "死亡骑士", "墓园", "T1", "死亡骑士", 92, 78, 58, 82, "亡者军势", "抽到负面事件时获得军力 +1。"),
  hero(6, "地下领主", "地下城", "T1", "地下领主", 86, 90, 64, 80, "深渊伏击", "争夺城镇时战术加成 +20。"),
  hero(7, "雷霆酋长", "要塞", "T1", "野蛮人", 98, 48, 60, 78, "狂战号令", "战斗骰为 6 时军力 +2。"),
  hero(8, "沼堡女巫", "堡垒", "T2", "女巫", 70, 86, 68, 74, "毒沼秘术", "木材不足时减少一次资源损失。"),
  hero(9, "元素使", "元素城", "T2", "元素使", 76, 94, 80, 78, "元素共鸣", "每拥有两种阵营城镇，魔力 +1。"),
  hero(10, "王国牧师", "城堡", "T2", "牧师", 64, 84, 86, 82, "祝福术", "回合结束时金币 +1。"),
  hero(11, "独角兽使者", "壁垒", "T2", "德鲁伊", 72, 88, 78, 76, "自然庇护", "防守事件中城防 +20。"),
  hero(12, "炼金术士", "塔楼", "T2", "炼金术士", 58, 92, 72, 70, "资源转化", "可将 1 木材转为 2 金币。")
];
