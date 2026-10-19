const SHARE_IMAGE_URL = "https://cdn.example.com/cdn-upload-final/sanguo-origin-home-hero-v2.png";
const HOME_PATH = "/pages/home/home";
const DEFAULT_TITLE = "林同学的桌游助手 · 主题桌游助手";

function enableShareMenu() {
  if (!wx.showShareMenu) return;
  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"]
  });
}

function buildAppMessage(options) {
  const config = options || {};
  return {
    title: config.title || DEFAULT_TITLE,
    path: config.path || HOME_PATH,
    imageUrl: config.imageUrl || SHARE_IMAGE_URL
  };
}

function buildTimeline(options) {
  const config = options || {};
  return {
    title: config.title || DEFAULT_TITLE,
    query: config.query || "",
    imageUrl: config.imageUrl || SHARE_IMAGE_URL
  };
}

module.exports = {
  HOME_PATH,
  DEFAULT_TITLE,
  SHARE_IMAGE_URL,
  enableShareMenu,
  buildAppMessage,
  buildTimeline
};
