const storage = {};
global.wx = {
  getStorageSync(key) { return storage[key] || null; },
  setStorageSync(key, value) { storage[key] = value; },
  removeStorageSync(key) { delete storage[key]; }
};

const gameStore = require("../../miniprogram/utils/gameStore");
const theme = require("../../miniprogram/themes/heroes3-kingdoms/theme");

const players = theme.data.characters.slice(0, 3).map((hero) => ({
  playerName: hero.name,
  faction: hero.faction,
  allies: [hero]
}));
const game = gameStore.createGame({
  themeId: theme.id,
  players,
  playerCount: players.length,
  maxRound: 6,
  victoryType: "city",
  victoryTarget: 3
});

if (game.theme_id !== theme.id) throw new Error("主题 ID 未正确写入存档");
if (game.players.length !== 3) throw new Error("玩家数量异常");
if (game.cities.length !== 9) throw new Error("城镇数量异常");
if (game.players[0].faction !== "城堡") throw new Error("英雄阵营未正确写入玩家");

const dice = gameStore.rollDice(1, 5);
if (!dice || dice.total !== 5 || dice.position !== 5) throw new Error("固定点数移动异常");
const event = gameStore.drawEvent();
if (!event || !event.title || !event.sound_path) throw new Error("魔法事件抽取异常");

console.log(JSON.stringify({
  themeId: game.theme_id,
  players: game.players.length,
  towns: game.cities.length,
  dicePosition: dice.position,
  event: event.title
}, null, 2));
