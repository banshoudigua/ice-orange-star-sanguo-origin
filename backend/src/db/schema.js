const fs = require("fs");
const path = require("path");
const { getDb, initSqlite, resolveDbFile } = require("./connection");

const schemaSql = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT,
    nickname TEXT,
    avatar_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT NOT NULL UNIQUE,
    host_user_id INTEGER,
    status TEXT,
    current_round INTEGER DEFAULT 1,
    max_round INTEGER DEFAULT 6,
    current_player_id INTEGER,
    current_step TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS room_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    user_id INTEGER,
    player_name TEXT,
    faction TEXT,
    seat_no INTEGER,
    grain INTEGER DEFAULT 3,
    silver INTEGER DEFAULT 5,
    prestige INTEGER DEFAULT 0,
    battle INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    move_adjust INTEGER DEFAULT 0,
    paused_turns INTEGER DEFAULT 0,
    status TEXT,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tier TEXT,
    faction TEXT,
    role_type TEXT,
    force_value INTEGER,
    strategy_value INTEGER,
    fame_value INTEGER,
    command_value INTEGER,
    skill_name TEXT,
    skill_desc TEXT,
    quote_text TEXT,
    image_path TEXT,
    voice_path TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS event_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    event_type TEXT,
    rarity TEXT,
    trigger_condition TEXT,
    effect_desc TEXT,
    board_action TEXT,
    effect_json TEXT,
    image_path TEXT,
    sound_path TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS game_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    player_id INTEGER,
    log_type TEXT,
    content TEXT,
    data_json TEXT,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS generated_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER,
    job_id INTEGER,
    asset_type TEXT,
    ref_id INTEGER,
    title TEXT,
    prompt TEXT,
    model TEXT,
    size TEXT,
    quality TEXT,
    file_path TEXT,
    response_json_path TEXT,
    status TEXT,
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TEXT,
    updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS image_generation_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_name TEXT,
    total_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    submitted_count INTEGER DEFAULT 0,
    generating_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    status TEXT,
    created_at TEXT,
    updated_at TEXT,
    finished_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS image_generation_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    asset_type TEXT,
    ref_id INTEGER,
    title TEXT,
    prompt TEXT NOT NULL,
    model TEXT,
    size TEXT,
    quality TEXT,
    status TEXT,
    progress INTEGER DEFAULT 0,
    submit_order INTEGER,
    submitted_at TEXT,
    completed_at TEXT,
    image_path TEXT,
    response_json_path TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`
];

function runStatements(db, statements, callback) {
  let index = 0;
  const next = (err) => {
    if (err) {
      callback(err);
      return;
    }
    if (index >= statements.length) {
      callback();
      return;
    }
    const sql = statements[index];
    index += 1;
    db.run(sql, next);
  };
  next();
}

function ensureRoomsColumns(db, callback) {
  db.all("PRAGMA table_info(rooms)", (infoErr, columns) => {
    if (infoErr) {
      callback(infoErr);
      return;
    }
    const names = (columns || []).map((column) => column.name);
    const statements = [];
    if (names.indexOf("max_round") === -1) {
      statements.push("ALTER TABLE rooms ADD COLUMN max_round INTEGER DEFAULT 6");
    }
    runStatements(db, statements, callback);
  });
}

function ensureRoomPlayersColumns(db, callback) {
  db.all("PRAGMA table_info(room_players)", (infoErr, columns) => {
    if (infoErr) {
      callback(infoErr);
      return;
    }
    const names = (columns || []).map((column) => column.name);
    const statements = [];
    const required = [
      { name: "grain", sql: "ALTER TABLE room_players ADD COLUMN grain INTEGER DEFAULT 3" },
      { name: "silver", sql: "ALTER TABLE room_players ADD COLUMN silver INTEGER DEFAULT 5" },
      { name: "prestige", sql: "ALTER TABLE room_players ADD COLUMN prestige INTEGER DEFAULT 0" },
      { name: "battle", sql: "ALTER TABLE room_players ADD COLUMN battle INTEGER DEFAULT 0" },
      { name: "position", sql: "ALTER TABLE room_players ADD COLUMN position INTEGER DEFAULT 0" },
      { name: "move_adjust", sql: "ALTER TABLE room_players ADD COLUMN move_adjust INTEGER DEFAULT 0" },
      { name: "paused_turns", sql: "ALTER TABLE room_players ADD COLUMN paused_turns INTEGER DEFAULT 0" }
    ];
    required.forEach((item) => {
      if (names.indexOf(item.name) === -1) statements.push(item.sql);
    });
    runStatements(db, statements, callback);
  });
}

function ensureEventColumns(db, callback) {
  db.all("PRAGMA table_info(event_cards)", (infoErr, columns) => {
    if (infoErr) {
      callback(infoErr);
      return;
    }
    const names = (columns || []).map((column) => column.name);
    const statements = [];
    if (names.indexOf("effect_json") === -1) {
      statements.push("ALTER TABLE event_cards ADD COLUMN effect_json TEXT");
    }
    runStatements(db, statements, callback);
  });
}

function resetDatabase(db, callback) {
  const drops = [
    "DROP TABLE IF EXISTS generated_images",
    "DROP TABLE IF EXISTS image_generation_jobs",
    "DROP TABLE IF EXISTS image_generation_batches",
    "DROP TABLE IF EXISTS game_logs",
    "DROP TABLE IF EXISTS event_cards",
    "DROP TABLE IF EXISTS characters",
    "DROP TABLE IF EXISTS room_players",
    "DROP TABLE IF EXISTS rooms",
    "DROP TABLE IF EXISTS users"
  ];
  runStatements(db, drops, callback);
}

function ensureDataDir(callback) {
  const dbFile = resolveDbFile();
  fs.mkdir(path.dirname(dbFile), { recursive: true }, callback);
}

function initDatabase(options, callback) {
  ensureDataDir((dirErr) => {
    if (dirErr) {
      callback(dirErr);
      return;
    }
    initSqlite((sqliteErr) => {
      if (sqliteErr) {
        callback(sqliteErr);
        return;
      }
      const db = getDb();
      const create = () => runStatements(db, schemaSql, (createErr) => {
        if (createErr) {
          callback(createErr);
          return;
        }
        ensureRoomsColumns(db, (roomColumnErr) => {
          if (roomColumnErr) {
            callback(roomColumnErr);
            return;
          }
          ensureRoomPlayersColumns(db, (playerColumnErr) => {
            if (playerColumnErr) {
              callback(playerColumnErr);
              return;
            }
            ensureEventColumns(db, callback);
          });
        });
      });
      if (options && options.reset) {
        resetDatabase(db, (dropErr) => {
          if (dropErr) {
            callback(dropErr);
            return;
          }
          create();
        });
        return;
      }
      create();
    });
  });
}

module.exports = {
  initDatabase
};
