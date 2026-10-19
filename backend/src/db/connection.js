const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

let activeDb = null;
let sqlModule = null;

function resolveDbFile() {
  const configured = process.env.DB_FILE || path.join(__dirname, "../../data/game.sqlite");
  if (path.isAbsolute(configured)) return configured;
  return path.resolve(__dirname, "../..", configured);
}

function getDb() {
  if (!activeDb) throw new Error("SQLite 尚未初始化，请先调用 initSqlite");
  return activeDb;
}

function persistDb(callback) {
  if (!activeDb || !activeDb.raw) {
    callback();
    return;
  }
  const data = activeDb.raw.export();
  fs.mkdir(path.dirname(resolveDbFile()), { recursive: true }, (dirErr) => {
    if (dirErr) {
      callback(dirErr);
      return;
    }
    fs.writeFile(resolveDbFile(), Buffer.from(data), callback);
  });
}

function createWrapper(raw) {
  return {
    raw,
    run(sql, params, callback) {
      const actualParams = Array.isArray(params) ? params : [];
      const actualCallback = typeof params === "function" ? params : callback;
      raw.run(sql, actualParams);
      const idRow = raw.exec("SELECT last_insert_rowid() AS id");
      const lastID = idRow && idRow[0] && idRow[0].values[0] ? idRow[0].values[0][0] : 0;
      persistDb((persistErr) => {
        if (actualCallback) actualCallback.call({ lastID }, persistErr);
      });
    },
    get(sql, params, callback) {
      const actualParams = Array.isArray(params) ? params : [];
      const actualCallback = typeof params === "function" ? params : callback;
      const stmt = raw.prepare(sql);
      stmt.bind(actualParams);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      if (actualCallback) actualCallback(null, row);
    },
    all(sql, params, callback) {
      const actualParams = Array.isArray(params) ? params : [];
      const actualCallback = typeof params === "function" ? params : callback;
      const stmt = raw.prepare(sql);
      stmt.bind(actualParams);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      if (actualCallback) actualCallback(null, rows);
    },
    close(callback) {
      persistDb((persistErr) => {
        raw.close();
        if (callback) callback(persistErr);
      });
    }
  };
}

function initSqlite(callback) {
  if (activeDb) {
    callback(null, activeDb);
    return;
  }
  const open = (SQL) => {
    const file = resolveDbFile();
    fs.readFile(file, (readErr, data) => {
      const raw = readErr ? new SQL.Database() : new SQL.Database(data);
      activeDb = createWrapper(raw);
      activeDb.run("PRAGMA foreign_keys = ON", (pragmaErr) => {
        callback(pragmaErr, activeDb);
      });
    });
  };

  if (sqlModule) {
    open(sqlModule);
    return;
  }

  initSqlJs().then((SQL) => {
    sqlModule = SQL;
    open(SQL);
  }, callback);
}

function closeDb(callback) {
  if (!activeDb) {
    callback();
    return;
  }
  activeDb.close((err) => {
    activeDb = null;
    callback(err);
  });
}

module.exports = {
  initSqlite,
  getDb,
  closeDb,
  resolveDbFile
};
