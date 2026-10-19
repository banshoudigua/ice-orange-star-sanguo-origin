const backgrounds = require("../../utils/backgrounds");
const registry = require("../../themes/registry");

Page({
  data: {
    pageBackgroundStyle: "",
    themes: [],
    currentThemeId: "",
    theme: null,
    mapOptions: [],
    selectedMapIndex: 0,
    selectedMap: null,
    mapViewerVisible: false,
    scale: 1
  },
  onLoad(options) {
    backgrounds.apply(this, "events");
    const themes = registry.getThemeList().map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      mapTitle: item.mapTitle || `${item.title}地图`
    }));
    const theme = registry.getThemeById(options.themeId);
    this.setData({ themes }, () => {
      this.applyMapTheme(theme.id);
    });
  },
  applyMapTheme(themeId) {
    const theme = registry.getThemeById(themeId);
    wx.setNavigationBarTitle({ title: theme.mapTitle || `${theme.title}地图` });
    const mapOptions = this.buildMapOptions(theme);
    this.setData({
      currentThemeId: theme.id,
      theme,
      mapOptions,
      selectedMapIndex: 0,
      selectedMap: mapOptions[0] || null,
      mapViewerVisible: false,
      scale: 1
    });
  },
  buildMapOptions(theme) {
    if (!theme) return [];
    if (Array.isArray(theme.mapDownloadOptions) && theme.mapDownloadOptions.length) {
      return theme.mapDownloadOptions.map((item, index) => Object.assign({}, item, {
        thumb: item.thumb || item.url,
        desc: item.desc || "可查看大图，也可下载后自行打印。",
        selected: index === 0
      }));
    }
    if (!theme.mapImage && !theme.mapDownloadImage) return [];
    return [{
      title: theme.mapTitle || "打印地图",
      desc: "可查看大图，也可下载后自行打印。",
      url: theme.mapDownloadImage || theme.mapImage,
      thumb: theme.mapPreviewImage || theme.mapImage || theme.mapDownloadImage,
      selected: true
    }];
  },
  switchMapTheme(e) {
    const themeId = e.currentTarget.dataset.themeId;
    if (!themeId || themeId === this.data.currentThemeId) return;
    this.applyMapTheme(themeId);
  },
  selectMapOption(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const options = (this.data.mapOptions || []).map((item, itemIndex) => Object.assign({}, item, {
      selected: itemIndex === index
    }));
    this.setData({
      mapOptions: options,
      selectedMapIndex: index,
      selectedMap: options[index] || null,
      scale: 1
    });
  },
  openMapViewer(e) {
    this.selectMapOption(e);
    this.setData({ mapViewerVisible: true });
  },
  closeMapViewer() {
    this.setData({
      mapViewerVisible: false,
      scale: 1
    });
  },
  zoomIn() {
    this.setData({ scale: Math.min(3, Number(this.data.scale || 1) + 0.25) });
  },
  zoomOut() {
    this.setData({ scale: Math.max(1, Number(this.data.scale || 1) - 0.25) });
  },
  resetZoom() {
    this.setData({ scale: 1 });
  },
  noop() {},
  previewMap() {
    const selectedMap = this.data.selectedMap;
    if (!selectedMap || !selectedMap.url) return;
    wx.previewImage({
      current: selectedMap.url,
      urls: (this.data.mapOptions || []).map((item) => item.url)
    });
  },
  previewMapOption(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const item = (this.data.mapOptions || [])[index];
    if (!item || !item.url) return;
    this.selectMapOption(e);
    wx.previewImage({
      current: item.url,
      urls: (this.data.mapOptions || []).map((mapItem) => mapItem.url)
    });
  },
  downloadMap() {
    const selectedMap = this.data.selectedMap;
    if (!selectedMap || !selectedMap.url) return;
    this.downloadMapByUrl(selectedMap.url, selectedMap.title);
  },
  downloadMapOption(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    const item = (this.data.mapOptions || [])[index];
    if (!item || !item.url) return;
    this.selectMapOption(e);
    this.downloadMapByUrl(item.url, item.title);
  },
  downloadMapByUrl(url, title) {
    if (!url) return;
    this.ensureAlbumPermission(() => {
      this.downloadRemoteMap(url, title);
    });
  },
  ensureAlbumPermission(callback) {
    wx.getSetting({
      success: (settingRes) => {
        const permission = settingRes.authSetting["scope.writePhotosAlbum"];
        if (permission === true) {
          callback();
          return;
        }
        if (permission === false) {
          this.openAlbumPermissionSetting(callback);
          return;
        }
        wx.authorize({
          scope: "scope.writePhotosAlbum",
          success: () => {
            callback();
          },
          fail: (err) => {
            console.log("[主题地图] 相册授权被拒绝", err);
            this.openAlbumPermissionSetting(callback);
          }
        });
      },
      fail: (err) => {
        console.log("[主题地图] 读取相册权限失败", err);
        wx.showToast({ title: "无法读取相册权限", icon: "none" });
      }
    });
  },
  openAlbumPermissionSetting(callback) {
    wx.showModal({
      title: "需要相册权限",
      content: "请允许保存图片到相册后，再下载地图用于打印。",
      confirmText: "去设置",
      success: (modalRes) => {
        if (!modalRes.confirm) return;
        wx.openSetting({
          success: (settingRes) => {
            if (settingRes.authSetting["scope.writePhotosAlbum"]) {
              callback();
              return;
            }
            wx.showToast({ title: "未开启相册权限", icon: "none" });
          },
          fail: (err) => {
            console.log("[主题地图] 打开相册权限设置失败", err);
            wx.showToast({ title: "无法打开权限设置", icon: "none" });
          }
        });
      }
    });
  },
  downloadRemoteMap(url, title) {
    wx.showLoading({ title: "下载中" });
    wx.downloadFile({
      url,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode && res.statusCode !== 200) {
          console.log("[主题地图] 下载状态异常", res);
          wx.showToast({ title: `下载失败(${res.statusCode})`, icon: "none" });
          return;
        }
        if (!res.tempFilePath) {
          console.log("[主题地图] 下载未返回临时文件", res);
          wx.showToast({ title: "下载文件无效", icon: "none" });
          return;
        }
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: `${title || "地图"}已保存`, icon: "none" });
          },
          fail: (err) => {
            console.log("[主题地图] 保存失败", err);
            this.openAlbumPermissionSetting(() => {
              wx.showToast({ title: "权限已开启，请再点下载", icon: "none" });
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.log("[主题地图] 下载失败", err);
        if ((err.errMsg || "").indexOf("domain list") >= 0) {
          wx.showModal({
            title: "下载域名未配置",
            content: "请在微信公众平台将 cdn.example.com 配置为 downloadFile 合法域名。",
            showCancel: false
          });
          return;
        }
        wx.showToast({ title: "下载失败，请检查网络", icon: "none" });
      }
    });
  }
});
