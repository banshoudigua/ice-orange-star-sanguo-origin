const BASE = "https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/towns";
function town(id, name, faction, position, price, toll, defense, cost, desc) {
  return { id, name, faction, position, price, toll, defense, level: 1, upgrade_cost: cost, owner_id: null, owner_name: "", desc, history_desc: `${name}是${faction}阵营的核心城镇，拥有独特的建筑与兵团传统。`, image_path: `${BASE}/town-${id}.png`, sound_path: `https://cdn.example.com/cdn-upload-final/themes/heroes3-kingdoms/audio/town-${id}.mp3` };
}
module.exports = [
  town(1, "圣堂城", "城堡", 5, 8, 2, 180, 5, "秩序与信仰的王国城镇。"),
  town(2, "林冠城", "壁垒", 8, 6, 1, 140, 4, "森林守护者聚集的绿色要塞。"),
  town(3, "银塔城", "塔楼", 11, 7, 2, 150, 5, "研究魔法与星辰的高塔城镇。"),
  town(4, "焚炎城", "地狱", 14, 7, 2, 160, 5, "火焰军团驻守的熔岩堡垒。"),
  town(5, "亡者墓城", "墓园", 17, 6, 2, 170, 4, "亡灵巫师操控黑暗军势的墓城。"),
  town(6, "深渊城", "地下城", 20, 8, 2, 180, 6, "地下洞窟通向深渊的隐秘城镇。"),
  town(7, "雷霆要塞", "要塞", 23, 6, 1, 150, 4, "野蛮军团以力量守护的山地要塞。"),
  town(8, "沼堡", "堡垒", 26, 5, 1, 130, 3, "沼泽与蜥蜴人共同守卫的堡垒。"),
  town(9, "元素圣殿", "元素城", 29, 9, 3, 200, 6, "四种元素力量交汇的圣殿。")
];
