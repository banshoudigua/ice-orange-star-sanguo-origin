const path = require("path");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 静态暴露生成图片，供小程序预览生成结果。
  app.use("/uploads", express.static(path.resolve(__dirname, "../public/uploads")));
  app.use("/api", apiRoutes);

  app.use((req, res) => {
    res.status(404).json({
      code: 404,
      message: "接口不存在",
      data: null
    });
  });

  app.use((err, req, res, next) => {
    console.error("服务异常：", err.message);
    res.status(500).json({
      code: 500,
      message: "服务内部异常",
      data: null
    });
  });

  return app;
}

module.exports = {
  createApp
};
