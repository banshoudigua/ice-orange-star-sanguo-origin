require("dotenv").config();

const { createApp } = require("./app");
const { initDatabase } = require("./db/schema");
const { seedDatabase } = require("./db/seed");

const port = Number(process.env.PORT || 3100);

initDatabase({}, (initErr) => {
  if (initErr) {
    console.error(`数据库初始化失败：${initErr.message}`);
    process.exit(1);
    return;
  }
  seedDatabase((seedErr) => {
    if (seedErr) {
      console.error(`基础数据写入失败：${seedErr.message}`);
      process.exit(1);
      return;
    }
    const app = createApp();
    app.listen(port, () => {
      console.log(`林同学的桌游助手后端已启动：http://localhost:${port}`);
    });
  });
});
