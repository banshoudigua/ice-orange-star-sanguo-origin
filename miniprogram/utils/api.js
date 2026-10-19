function request(options) {
  console.log("[本地模式] 已禁用网络调用", options && options.url ? options.url : "");
  if (options && !options.silent) {
    wx.showToast({ title: "当前为纯前端本地模式", icon: "none" });
  }
  if (options && options.fail) options.fail("当前为纯前端本地模式");
}

function imageUrl(path) {
  if (!path) return "";
  if (path.indexOf("http") === 0) return path;
  if (path.indexOf("/uploads/") === 0) {
    console.log("[本地模式] 非本地资源不可用，请改用 /assets 本地资源", path);
    return "";
  }
  return path;
}

module.exports = {
  request,
  imageUrl
};
