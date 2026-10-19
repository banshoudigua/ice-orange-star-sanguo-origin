const { getDb } = require("../db/connection");

const ACTION_STEP = "玩家行动";
const FINISHED_STEP = "游戏结束";

function now() {
  return new Date().toISOString();
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function normalizeCreatePlayers(params) {
  const source = Array.isArray(params.players) && params.players.length > 0 ? params.players : null;
  const players = [];
  if (source) {
    const limit = Math.min(source.length, 8);
    for (let i = 0; i < limit; i += 1) {
      const item = source[i] || {};
      const fallbackName = i === 0 ? (params.hostName || "房主") : `玩家${i + 1}`;
      players.push({
        playerName: item.playerName || item.name || fallbackName,
        faction: item.faction || "群雄"
      });
    }
    return players;
  }

  const count = Math.max(1, Math.min(Number(params.playerCount || 1), 8));
  const factions = ["汉室", "群雄", "黄巾", "江东", "诸侯", "中立", "汉室", "群雄"];
  for (let i = 0; i < count; i += 1) {
    players.push({
      playerName: i === 0 ? (params.hostName || params.playerName || "房主") : `玩家${i + 1}`,
      faction: params.faction || factions[i] || "群雄"
    });
  }
  return players;
}

function normalizeMaxRound(value) {
  const maxRound = Number(value || 6);
  if (!Number.isFinite(maxRound)) return 6;
  return Math.max(1, Math.min(Math.floor(maxRound), 99));
}

function insertRoomPlayers(db, roomId, players, timestamp, callback) {
  let index = 0;
  const insertedIds = [];
  const next = (err) => {
    if (err) {
      callback(err);
      return;
    }
    if (index >= players.length) {
      callback(null, insertedIds);
      return;
    }
    const item = players[index];
    const seatNo = index + 1;
    index += 1;
    db.run(
      `INSERT INTO room_players
      (room_id, player_name, faction, seat_no, grain, silver, prestige, battle, position, move_adjust, paused_turns, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [roomId, item.playerName || `玩家${seatNo}`, item.faction || "群雄", seatNo, 3, 5, 0, 0, 0, 0, 0, "ready", timestamp],
      function onPlayerInserted(playerErr) {
        if (!playerErr) insertedIds.push(this.lastID);
        next(playerErr);
      }
    );
  };
  next();
}

function createLog(roomId, playerId, logType, content, data, callback) {
  const db = getDb();
  db.run(
    "INSERT INTO game_logs (room_id, player_id, log_type, content, data_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [roomId, playerId || null, logType, content, JSON.stringify(data || {}), now()],
    callback
  );
}

function getRoomByCode(roomCode, callback) {
  const db = getDb();
  db.get("SELECT * FROM rooms WHERE room_code = ?", [roomCode], (roomErr, room) => {
    if (roomErr || !room) {
      callback(roomErr, room);
      return;
    }
    db.all("SELECT * FROM room_players WHERE room_id = ? ORDER BY seat_no ASC", [room.id], (playerErr, players) => {
      if (playerErr) {
        callback(playerErr);
        return;
      }
      db.all("SELECT * FROM game_logs WHERE room_id = ? ORDER BY id DESC LIMIT 30", [room.id], (logErr, logs) => {
        if (logErr) {
          callback(logErr);
          return;
        }
        callback(null, { room, players, logs });
      });
    });
  });
}

function createRoom(params, callback) {
  const db = getDb();
  const roomCode = makeRoomCode();
  const timestamp = now();
  const players = normalizeCreatePlayers(params || {});
  const maxRound = normalizeMaxRound(params && params.maxRound);
  db.run(
    "INSERT INTO rooms (room_code, status, current_round, max_round, current_step, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [roomCode, "playing", 1, maxRound, ACTION_STEP, timestamp, timestamp],
    function onRoomInserted(roomErr) {
      if (roomErr) {
        callback(roomErr);
        return;
      }
      const roomId = this.lastID;
      insertRoomPlayers(db, roomId, players, timestamp, (playerErr, playerIds) => {
        if (playerErr) {
          callback(playerErr);
          return;
        }
        const firstPlayerId = playerIds[0] || null;
        db.run("UPDATE rooms SET current_player_id = ? WHERE id = ?", [firstPlayerId, roomId], (updateErr) => {
          if (updateErr) {
            callback(updateErr);
            return;
          }
          createLog(roomId, firstPlayerId, "room_create", `房间 ${roomCode} 已创建，${players.length} 名玩家入席，共 ${maxRound} 回合`, { roomCode, playerCount: players.length, maxRound }, (logErr) => {
            if (logErr) {
              callback(logErr);
              return;
            }
            getRoomByCode(roomCode, callback);
          });
        });
      });
    }
  );
}

function joinRoom(params, callback) {
  const db = getDb();
  getRoomByCode(params.roomCode, (roomErr, payload) => {
    if (roomErr || !payload) {
      callback(roomErr, payload);
      return;
    }
    const seatNo = payload.players.length + 1;
    const timestamp = now();
    db.run(
      `INSERT INTO room_players
      (room_id, player_name, faction, seat_no, grain, silver, prestige, battle, position, move_adjust, paused_turns, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payload.room.id, params.playerName || `玩家${seatNo}`, params.faction || "群雄", seatNo, 3, 5, 0, 0, 0, 0, 0, "ready", timestamp],
      function onJoined(joinErr) {
        if (joinErr) {
          callback(joinErr);
          return;
        }
        createLog(payload.room.id, this.lastID, "room_join", `${params.playerName || `玩家${seatNo}`} 加入房间`, { seatNo }, (logErr) => {
          if (logErr) {
            callback(logErr);
            return;
          }
          getRoomByCode(params.roomCode, callback);
        });
      }
    );
  });
}

function nextStep(roomId, callback) {
  const db = getDb();
  db.get("SELECT * FROM rooms WHERE id = ?", [roomId], (roomErr, room) => {
    if (roomErr || !room) {
      callback(roomErr, room);
      return;
    }
    db.all("SELECT * FROM room_players WHERE room_id = ? ORDER BY seat_no ASC", [roomId], (playerErr, players) => {
      if (playerErr) {
        callback(playerErr);
        return;
      }
      if (!players.length) {
        callback(null, { room, players, logs: [] });
        return;
      }
      if (room.status === "finished") {
        db.get("SELECT room_code FROM rooms WHERE id = ?", [roomId], (codeErr, row) => {
          if (codeErr || !row) {
            callback(codeErr, row);
            return;
          }
          getRoomByCode(row.room_code, callback);
        });
        return;
      }
      let round = Number(room.current_round || 1);
      const maxRound = normalizeMaxRound(room.max_round || 6);
      let status = "playing";
      let nextStepName = ACTION_STEP;
      let currentPlayerId = room.current_player_id;
      let logContent = "";
      const playerIndex = Math.max(0, players.findIndex((player) => player.id === room.current_player_id));

      if (playerIndex >= players.length - 1) {
        if (round >= maxRound) {
          status = "finished";
          nextStepName = FINISHED_STEP;
          logContent = `游戏结束：已完成 ${maxRound} 回合`;
        } else {
          round += 1;
          currentPlayerId = players[0].id;
          logContent = `第 ${round} 回合开始：${players[0].player_name} 行动`;
        }
      } else {
        const nextPlayer = players[playerIndex + 1];
        currentPlayerId = nextPlayer.id;
        logContent = `轮到 ${nextPlayer.player_name} 行动`;
      }

      const timestamp = now();
      db.run(
        "UPDATE rooms SET status = ?, current_step = ?, current_round = ?, current_player_id = ?, updated_at = ? WHERE id = ?",
        [status, nextStepName, round, currentPlayerId, timestamp, roomId],
        (updateErr) => {
          if (updateErr) {
            callback(updateErr);
            return;
          }
          createLog(roomId, currentPlayerId, "next_step", logContent, { step: nextStepName, round, maxRound, status }, (logErr) => {
            if (logErr) {
              callback(logErr);
              return;
            }
            db.get("SELECT room_code FROM rooms WHERE id = ?", [roomId], (codeErr, row) => {
              if (codeErr || !row) {
                callback(codeErr, row);
                return;
              }
              getRoomByCode(row.room_code, callback);
            });
          });
        }
      );
    });
  });
}

function setCurrentStep(roomId, step, callback) {
  const db = getDb();
  db.run(
    "UPDATE rooms SET current_step = ?, updated_at = ? WHERE id = ? AND status != ?",
    [step || ACTION_STEP, now(), roomId, "finished"],
    callback
  );
}

module.exports = {
  createRoom,
  joinRoom,
  getRoomByCode,
  nextStep,
  createLog,
  setCurrentStep
};
