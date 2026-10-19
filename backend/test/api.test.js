const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { createApp } = require("../src/app");
const { initDatabase } = require("../src/db/schema");
const { seedDatabase } = require("../src/db/seed");
const { closeDb } = require("../src/db/connection");

process.env.DB_FILE = path.resolve(__dirname, "../data/test.sqlite");
process.env.IMAGE_GENERATION_MODE = "mock";
process.env.IMAGE_SUBMIT_INTERVAL_MS = "20";

function request(base, url, options) {
  return fetch(`${base}${url}`, Object.assign({
    headers: { "Content-Type": "application/json" }
  }, options || {})).then((res) => res.json());
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let server;
let baseUrl;

function initDbForTest() {
  return new Promise((resolve, reject) => {
    fs.rm(process.env.DB_FILE, { force: true }, (rmErr) => {
      if (rmErr) {
        reject(rmErr);
        return;
      }
      initDatabase({ reset: true }, (initErr) => {
        if (initErr) {
          reject(initErr);
          return;
        }
        seedDatabase((seedErr) => {
          if (seedErr) {
            reject(seedErr);
            return;
          }
          resolve();
        });
      });
    });
  });
}

function listen(app) {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}/api`;
      resolve();
    });
  });
}

test.before(async () => {
  await initDbForTest();
  await listen(createApp());
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(() => {
      closeDb(() => resolve());
    });
  });
});

test("健康检查、房间、骰子、事件与卡牌接口可用", async () => {
  const health = await request(baseUrl, "/health");
  assert.equal(health.code, 0);

  const roomCreated = await request(baseUrl, "/rooms", {
    method: "POST",
    body: JSON.stringify({ hostName: "测试房主" })
  });
  assert.equal(roomCreated.code, 0);
  assert.ok(roomCreated.data.room.room_code);

  const localRoom = await request(baseUrl, "/rooms", {
    method: "POST",
    body: JSON.stringify({
      hostName: "同屏房主",
      maxRound: 3,
      players: [
        { playerName: "刘备队", faction: "汉室" },
        { playerName: "曹操队", faction: "群雄" },
        { playerName: "黄巾队", faction: "黄巾" }
      ]
    })
  });
  assert.equal(localRoom.code, 0);
  assert.equal(localRoom.data.players.length, 3);
  assert.equal(localRoom.data.room.max_round, 3);
  assert.equal(localRoom.data.players[0].player_name, "刘备队");
  assert.equal(localRoom.data.room.current_player_id, localRoom.data.players[0].id);

  const joined = await request(baseUrl, "/rooms/join", {
    method: "POST",
    body: JSON.stringify({ roomCode: roomCreated.data.room.room_code, playerName: "测试玩家二" })
  });
  assert.equal(joined.code, 0);
  assert.equal(joined.data.players.length, 2);

  const next = await request(baseUrl, `/rooms/${roomCreated.data.room.id}/next-step`, { method: "POST" });
  assert.equal(next.code, 0);
  assert.equal(next.data.room.current_step, "玩家行动");
  assert.equal(next.data.room.current_player_id, joined.data.players[1].id);

  const fallbackRoom = await request(baseUrl, "/rooms", {
    method: "POST",
    body: JSON.stringify({ hostName: "只选人数", playerCount: 4, maxRound: 2 })
  });
  assert.equal(fallbackRoom.code, 0);
  assert.equal(fallbackRoom.data.players.length, 4);
  assert.equal(fallbackRoom.data.room.max_round, 2);

  const dice = await request(baseUrl, "/dice/roll", {
    method: "POST",
    body: JSON.stringify({ roomId: roomCreated.data.room.id, diceCount: 2 })
  });
  assert.equal(dice.code, 0);
  assert.equal(dice.data.rolls.length, 2);

  const characters = await request(baseUrl, "/characters");
  assert.equal(characters.code, 0);
  assert.ok(characters.data.length >= 10);

  const randomEvent = await request(baseUrl, "/events/random", { method: "POST", body: JSON.stringify({}) });
  assert.equal(randomEvent.code, 0);
  assert.ok(randomEvent.data.title);
});

test("图片批量生成队列可创建、监控并保存结果", async () => {
  const created = await request(baseUrl, "/images/batch", {
    method: "POST",
    body: JSON.stringify({
      batchName: "测试图片批次",
      jobs: [
        { title: "测试头像", prompt: "三国人物头像，不要文字，不要水印", assetType: "character_avatar" },
        { title: "测试事件", prompt: "三国事件卡插画，不要文字，不要水印", assetType: "event_card" }
      ]
    })
  });
  assert.equal(created.code, 0);
  const batchId = created.data.batch.id;

  await wait(900);
  const detail = await request(baseUrl, `/images/batches/${batchId}`);
  assert.equal(detail.code, 0);
  assert.equal(detail.data.batch.success_count, 2);
  assert.equal(detail.data.batch.progress, 100);
  assert.equal(detail.data.jobs.every((job) => job.status === "success"), true);

  const images = await request(baseUrl, "/images");
  assert.equal(images.code, 0);
  assert.ok(images.data.length >= 2);
});

test("页面背景图可由图片生成队列产出并供小程序读取", async () => {
  const created = await request(baseUrl, "/images/batch", {
    method: "POST",
    body: JSON.stringify({
      batchName: "页面背景图",
      jobs: [
        { title: "bg-home", prompt: "三国起源首页背景，不要文字，不要水印", assetType: "page_background" },
        { title: "bg-room", prompt: "三国主持控制台背景，不要文字，不要水印", assetType: "page_background" }
      ]
    })
  });
  assert.equal(created.code, 0);

  await wait(900);
  const backgrounds = await request(baseUrl, "/images/backgrounds");
  assert.equal(backgrounds.code, 0);
  assert.ok(backgrounds.data.some((item) => item.title === "bg-home" && item.image_path));
  assert.ok(backgrounds.data.some((item) => item.title === "bg-room" && item.image_path));
});
