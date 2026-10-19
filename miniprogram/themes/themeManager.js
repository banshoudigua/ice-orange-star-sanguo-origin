const STORAGE_KEY = "sanguo_origin_selected_theme";
const DEFAULT_THEME_ID = "sanguo-origin";

function getSelectedThemeId() {
  return wx.getStorageSync(STORAGE_KEY) || DEFAULT_THEME_ID;
}

function setSelectedThemeId(themeId) {
  const safeThemeId = themeId || DEFAULT_THEME_ID;
  wx.setStorageSync(STORAGE_KEY, safeThemeId);
  return safeThemeId;
}

module.exports = {
  STORAGE_KEY,
  DEFAULT_THEME_ID,
  getSelectedThemeId,
  setSelectedThemeId
};
