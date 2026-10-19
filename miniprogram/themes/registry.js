const sanguoTheme = require("./sanguo-origin/theme");
const chaoshanTheme = require("./chaoshan-travel/theme");
const timeTravelFlightTheme = require("./time-travel-flight/theme");
const diceScoreTheme = require("./dice-score/theme");
const heroes3Theme = require("./heroes3-kingdoms/theme");
const themeManager = require("./themeManager");

const themeList = [sanguoTheme, chaoshanTheme, timeTravelFlightTheme, heroes3Theme, diceScoreTheme];
// 暂时隐藏旧主题入口，但保留主题注册，确保已有时空旅行飞行棋存档仍可恢复。
const HIDDEN_THEME_IDS = ["time-travel-flight"];

function getThemeById(themeId) {
  const currentThemeId = themeId || themeManager.getSelectedThemeId();
  return themeList.find((item) => item.id === currentThemeId) || sanguoTheme;
}

function getThemeList() {
  return themeList.filter((item) => HIDDEN_THEME_IDS.indexOf(item.id) === -1);
}

function getCurrentTheme() {
  return getThemeById(themeManager.getSelectedThemeId());
}

module.exports = {
  getThemeById,
  getThemeList,
  getCurrentTheme
};
