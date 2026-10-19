const express = require("express");
const { getDb } = require("../db/connection");
const { ok, fail, readPositiveInt } = require("../utils/http");
const roomService = require("../services/roomService");
const diceService = require("../services/diceService");
const imageService = require("../services/imageService");

const router = express.Router();

function normalizeEventRow(row) {
  if (!row) return row;
  const next = Object.assign({}, row);
  next.effect_rules = row.effect_json ? JSON.parse(row.effect_json) : {};
  return next;
}

router.get("/health", (req, res) => {
  ok(res, {
    name: "林同学的桌游助手",
    status: "ok",
    time: new Date().toISOString()
  });
});

router.post("/rooms", (req, res) => {
  roomService.createRoom(req.body || {}, (err, payload) => {
    if (err) {
      fail(res, 500, 1001, `创建房间失败：${err.message}`);
      return;
    }
    ok(res, payload, "房间创建成功");
  });
});

router.post("/rooms/join", (req, res) => {
  if (!req.body || !req.body.roomCode) {
    fail(res, 400, 1002, "缺少 roomCode");
    return;
  }
  roomService.joinRoom(req.body, (err, payload) => {
    if (err) {
      fail(res, 500, 1003, `加入房间失败：${err.message}`);
      return;
    }
    if (!payload) {
      fail(res, 404, 1004, "房间不存在");
      return;
    }
    ok(res, payload, "加入房间成功");
  });
});

router.post("/rooms/:roomId/next-step", (req, res) => {
  roomService.nextStep(Number(req.params.roomId), (err, payload) => {
    if (err) {
      fail(res, 500, 1005, `推进流程失败：${err.message}`);
      return;
    }
    if (!payload) {
      fail(res, 404, 1006, "房间不存在");
      return;
    }
    ok(res, payload, "流程已推进");
  });
});

router.get("/rooms/:roomCode", (req, res) => {
  roomService.getRoomByCode(req.params.roomCode, (err, payload) => {
    if (err) {
      fail(res, 500, 1007, `读取房间失败：${err.message}`);
      return;
    }
    if (!payload) {
      fail(res, 404, 1008, "房间不存在");
      return;
    }
    ok(res, payload);
  });
});

router.post("/dice/roll", (req, res) => {
  diceService.rollDice(req.body || {}, (err, result) => {
    if (err) {
      fail(res, 500, 2001, `摇骰失败：${err.message}`);
      return;
    }
    ok(res, result, "摇骰完成");
  });
});

router.get("/characters", (req, res) => {
  const db = getDb();
  db.all("SELECT * FROM characters ORDER BY tier ASC, id ASC", (err, rows) => {
    if (err) {
      fail(res, 500, 3001, `读取人物卡失败：${err.message}`);
      return;
    }
    ok(res, rows);
  });
});

router.get("/characters/:id", (req, res) => {
  const db = getDb();
  db.get("SELECT * FROM characters WHERE id = ?", [Number(req.params.id)], (err, row) => {
    if (err) {
      fail(res, 500, 3002, `读取人物详情失败：${err.message}`);
      return;
    }
    if (!row) {
      fail(res, 404, 3003, "人物卡不存在");
      return;
    }
    ok(res, row);
  });
});

router.get("/events", (req, res) => {
  const db = getDb();
  db.all("SELECT * FROM event_cards ORDER BY id ASC", (err, rows) => {
    if (err) {
      fail(res, 500, 4001, `读取事件卡失败：${err.message}`);
      return;
    }
    ok(res, (rows || []).map((row) => normalizeEventRow(row)));
  });
});

router.post("/events/random", (req, res) => {
  const db = getDb();
  db.get("SELECT * FROM event_cards ORDER BY RANDOM() LIMIT 1", (err, row) => {
    if (err) {
      fail(res, 500, 4002, `抽取随机事件失败：${err.message}`);
      return;
    }
    const eventRow = normalizeEventRow(row);
    if (req.body && req.body.roomId && eventRow) {
      roomService.createLog(req.body.roomId, req.body.playerId || null, "random_event", `抽到事件：${eventRow.title}`, eventRow, (logErr) => {
        if (logErr) {
          fail(res, 500, 4003, `记录事件日志失败：${logErr.message}`);
          return;
        }
        roomService.setCurrentStep(req.body.roomId, "抽取事件", (stepErr) => {
          if (stepErr) {
            fail(res, 500, 4004, `更新房间阶段失败：${stepErr.message}`);
            return;
          }
          ok(res, eventRow, "随机事件已抽取");
        });
      });
      return;
    }
    ok(res, eventRow, "随机事件已抽取");
  });
});

router.post("/images/generate", (req, res) => {
  if (!req.body || !req.body.prompt) {
    fail(res, 400, 5001, "缺少 prompt");
    return;
  }
  imageService.createBatch(req.body, (err, detail) => {
    if (err) {
      fail(res, 500, 5002, `创建图片生成任务失败：${err.message}`);
      return;
    }
    ok(res, detail, "图片生成任务已创建");
  });
});

router.post("/images/batch", (req, res) => {
  if (!req.body || !Array.isArray(req.body.jobs) || req.body.jobs.length === 0) {
    fail(res, 400, 5003, "缺少 jobs 批量任务");
    return;
  }
  const invalid = req.body.jobs.find((job) => !job.prompt);
  if (invalid) {
    fail(res, 400, 5004, "每个图片任务都必须包含 prompt");
    return;
  }
  imageService.createBatch(req.body, (err, detail) => {
    if (err) {
      fail(res, 500, 5005, `创建批量图片任务失败：${err.message}`);
      return;
    }
    ok(res, detail, "批量图片任务已创建");
  });
});

router.get("/images/batches", (req, res) => {
  imageService.getBatchList((err, rows) => {
    if (err) {
      fail(res, 500, 5006, `读取图片批次失败：${err.message}`);
      return;
    }
    ok(res, rows);
  });
});

router.get("/images/batches/:batchId", (req, res) => {
  imageService.getBatchDetail(readPositiveInt(req.params.batchId, 0), (err, detail) => {
    if (err) {
      fail(res, 500, 5007, `读取图片批次详情失败：${err.message}`);
      return;
    }
    if (!detail) {
      fail(res, 404, 5008, "图片批次不存在");
      return;
    }
    ok(res, detail);
  });
});

router.get("/images/batches/:batchId/jobs", (req, res) => {
  imageService.getBatchDetail(readPositiveInt(req.params.batchId, 0), (err, detail) => {
    if (err) {
      fail(res, 500, 5009, `读取图片任务失败：${err.message}`);
      return;
    }
    if (!detail) {
      fail(res, 404, 5010, "图片批次不存在");
      return;
    }
    ok(res, detail.jobs);
  });
});

router.post("/images/jobs/:jobId/retry", (req, res) => {
  imageService.retryJob(readPositiveInt(req.params.jobId, 0), (err, job) => {
    if (err) {
      fail(res, 500, 5011, `重试图片任务失败：${err.message}`);
      return;
    }
    if (!job) {
      fail(res, 404, 5012, "图片任务不存在");
      return;
    }
    ok(res, job, "图片任务已重试");
  });
});

router.post("/images/batches/:batchId/retry-failed", (req, res) => {
  imageService.retryFailed(readPositiveInt(req.params.batchId, 0), (err, detail) => {
    if (err) {
      fail(res, 500, 5013, `重试失败任务失败：${err.message}`);
      return;
    }
    ok(res, detail, "失败任务已重新提交");
  });
});

router.get("/images", (req, res) => {
  imageService.getGeneratedImages((err, rows) => {
    if (err) {
      fail(res, 500, 5014, `读取生成图片记录失败：${err.message}`);
      return;
    }
    ok(res, rows);
  });
});

router.get("/images/backgrounds", (req, res) => {
  imageService.getPageBackgrounds((err, rows) => {
    if (err) {
      fail(res, 500, 5015, `读取页面背景图失败：${err.message}`);
      return;
    }
    ok(res, rows);
  });
});

module.exports = router;
