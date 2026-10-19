require("dotenv").config();

const { initDatabase } = require("../src/db/schema");
const { seedDatabase } = require("../src/db/seed");
const { closeDb, resolveDbFile } = require("../src/db/connection");

initDatabase({ reset: process.argv.includes("--reset") }, (initErr) => {
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
    closeDb((closeErr) => {
      if (closeErr) {
        console.error(`数据库关闭失败：${closeErr.message}`);
        process.exit(1);
        return;
      }
      console.log(`数据库初始化完成：${resolveDbFile()}`);
    });
  });
});
