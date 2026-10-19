const registry = require("../themes/registry");
const themeManager = require("../themes/themeManager");

function getTheme(themeId) {
  return registry.getThemeById(themeId || themeManager.getSelectedThemeId());
}

function getThemeData(themeId) {
  return getTheme(themeId).data || {};
}

function getThemeLabels(themeId) {
  return getTheme(themeId).labels || {};
}

function getThemeGuide(themeId) {
  return getTheme(themeId).guide || [];
}

function getThemeDockItems(themeId) {
  return getTheme(themeId).dockItems || [];
}

function getThemeIntroLines(themeId) {
  return getThemeData(themeId).introLines || [];
}

module.exports = {
  getTheme,
  getThemeData,
  getThemeLabels,
  getThemeGuide,
  getThemeDockItems,
  getThemeIntroLines,
  get characters() {
    return getThemeData().characters || [];
  },
  get events() {
    return getThemeData().events || [];
  },
  get cities() {
    return getThemeData().cities || [];
  },
  get characterSlots() {
    return getThemeData().characterSlots || [];
  }
};
