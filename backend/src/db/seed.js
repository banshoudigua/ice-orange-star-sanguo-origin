const { getDb } = require("./connection");
const gameData = require("../../../miniprogram/utils/gameData");

const now = () => new Date().toISOString();

const characters = [
  ["刘备", "T1", "汉室", "仁主", 72, 82, 95, 78, "仁德聚义", "完成事件后，可让一名玩家获得一次重掷机会。", "备愿与诸君同扶汉室。"],
  ["关羽", "T1", "汉室", "武将", 96, 72, 88, 84, "青龙威震", "战斗判定时，若骰子为 5 或 6，可额外获得 1 点战功。", "关某在此，何人敢战。"],
  ["张飞", "T1", "汉室", "猛将", 94, 55, 80, 76, "燕人怒吼", "触发战斗事件时，可迫使事件难度降低 1。", "燕人张翼德在此。"],
  ["曹操", "T1", "群雄", "枭雄", 82, 96, 90, 95, "乱世机变", "抽到负面事件后，可再抽一张并二选一。", "乱世之中，先机最重。"],
  ["孙坚", "T1", "江东", "武将", 88, 70, 82, 86, "猛虎破阵", "移动到关隘格时，可额外推进 1 步。", "江东猛虎，破阵先行。"],
  ["董卓", "T1", "董卓军", "权臣", 84, 68, 40, 88, "挟天子令", "触发朝堂事件时，可改变一次结算目标。", "天下权柄，尽在吾手。"],
  ["吕布", "T1", "并州", "猛将", 100, 45, 78, 82, "飞将无双", "战斗骰为 6 时，直接获得一次额外行动。", "吾乃天下飞将。"],
  ["袁绍", "T1", "诸侯", "盟主", 75, 80, 90, 84, "盟主号令", "多人协作事件中，可让一名玩家追加一次骰子。", "诸侯既集，当共讨国贼。"],
  ["张角", "T1", "黄巾", "术士", 62, 90, 86, 80, "太平道术", "抽到民心事件时，可将结果向有利方向调整 1。", "苍天已死，黄天当立。"],
  ["袁术", "T2", "诸侯", "豪强", 68, 72, 64, 78, "淮南称雄", "资源结算时，可将 1 点粮草转为 1 点声望。", "吾据淮南，亦可问鼎天下。"],
  ["公孙瓒", "T2", "幽州", "骑将", 82, 60, 70, 76, "白马义从", "移动阶段若经过平原，可额外移动 1 步。", "白马义从，随我破阵。"],
  ["何进", "T2", "汉室", "外戚", 62, 58, 66, 72, "大将军令", "朝堂事件中，可让一名玩家重掷一次声望判定。", "奉诏整兵，以清内患。"],
  ["王允", "T2", "汉室", "谋臣", 36, 92, 82, 60, "连环谋", "抽到董卓相关事件时，可降低 1 点事件难度。", "除贼之机，当藏于无声处。"],
  ["貂蝉", "T2", "汉室", "奇谋", 34, 88, 84, 55, "闭月离间", "战斗事件前，可令一名敌方角色本次能力失效。", "一曲入夜，乱局自分。"],
  ["华雄", "T2", "董卓军", "猛将", 86, 42, 58, 66, "汜水逞威", "关隘战斗中，若骰子为 5 或 6，额外增加 1 点难度。", "谁敢来战。"],
  ["T2级门将", "T2", "中立", "门将", 70, 48, 42, 60, "守门盘查", "经过关隘时，玩家需要额外掷 1 枚骰子，4 点以上通过。", "来者止步，报上名来。"],
  ["黄巾力士", "T3", "黄巾", "士兵", 68, 30, 35, 48, "人多势众", "黄巾事件出现时，事件难度增加 1。", "太平道在此。"],
  ["洛阳守卫", "T3", "汉室", "守卫", 58, 42, 50, 55, "城门守备", "洛阳相关事件中，为守方提供 1 点防守值。", "洛阳城门，不可轻开。"]
];

const events = (gameData.events || []).map((item) => [
  item.title,
  item.event_type,
  item.rarity,
  item.trigger_condition,
  item.effect_desc,
  item.board_action,
  JSON.stringify(item.effect_rules || {})
]);

const characterImagePaths = {
  刘备: "/uploads/images/liu-bei.png",
  关羽: "/uploads/images/guan-yu.png",
  张飞: "/uploads/images/zhang-fei.png",
  曹操: "/uploads/images/cao-cao.png",
  孙坚: "/uploads/images/sun-jian.png",
  董卓: "/uploads/images/dong-zhuo.png",
  吕布: "/uploads/images/lv-bu.png",
  袁绍: "/uploads/images/yuan-shao.png",
  张角: "/uploads/images/zhang-jiao.png",
  袁术: "/uploads/images/yuan-shu.png",
  公孙瓒: "/uploads/images/gongsun-zan.png",
  何进: "/uploads/images/he-jin.png",
  王允: "/uploads/images/wang-yun.png",
  貂蝉: "/uploads/images/diao-chan.png",
  华雄: "/uploads/images/hua-xiong.png",
  T2级门将: "/uploads/images/t2-menjiang.png",
  黄巾力士: "/uploads/images/huangjin-lishi.png",
  洛阳守卫: "/uploads/images/luoyang-shouwei.png"
};

const eventAssets = {
  黄巾流民四起: { image: "/uploads/images/event-huangjin-liumin.png", sound: "/uploads/audio/event-huangjin-liumin.mp3" },
  桃园结义: { image: "/uploads/images/event-taoyuan-jieyi.png", sound: "/uploads/audio/event-taoyuan-jieyi.mp3" },
  董卓入京: { image: "/uploads/images/event-dongzhuo-rujing.png", sound: "/uploads/audio/event-dongzhuo-rujing.mp3" },
  虎牢关战鼓: { image: "/uploads/images/event-hulaoguan-zhangu.png", sound: "/uploads/audio/event-hulaoguan-zhangu.mp3" },
  粮草告急: { image: "/uploads/images/event-liangcao-gaoji.png", sound: "/uploads/audio/event-liangcao-gaoji.mp3" },
  大雨阻军: { image: "/uploads/images/event-dayu-zujun.png", sound: "/uploads/audio/event-dayu-zujun.mp3" },
  义士投奔: { image: "/uploads/images/event-yishi-touben.png", sound: "/uploads/audio/event-yishi-touben.mp3" },
  夜袭营寨: { image: "/uploads/images/event-yexi-yingzhai.png", sound: "/uploads/audio/event-yexi-yingzhai.mp3" },
  民心归附: { image: "/uploads/images/event-minxin-guifu.png", sound: "/uploads/audio/event-minxin-guifu.mp3" }
};

function insertMany(db, sql, rows, callback) {
  let index = 0;
  const next = (err) => {
    if (err) {
      callback(err);
      return;
    }
    if (index >= rows.length) {
      callback();
      return;
    }
    const row = rows[index];
    index += 1;
    db.run(sql, row, next);
  };
  next();
}

function runMany(db, statements, callback) {
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
    const item = statements[index];
    index += 1;
    db.run(item.sql, item.params, next);
  };
  next();
}

function syncAssetPaths(db, callback) {
  const timestamp = now();
  const statements = [];
  Object.keys(characterImagePaths).forEach((name) => {
    statements.push({
      sql: "UPDATE characters SET image_path = ?, updated_at = ? WHERE name = ?",
      params: [characterImagePaths[name], timestamp, name]
    });
  });
  Object.keys(eventAssets).forEach((title) => {
    statements.push({
      sql: "UPDATE event_cards SET image_path = ?, sound_path = ?, updated_at = ? WHERE title = ?",
      params: [eventAssets[title].image, eventAssets[title].sound, timestamp, title]
    });
  });
  runMany(db, statements, callback);
}

function buildCharacterRows(source, timestamp) {
  return source.map((item) => item.concat([characterImagePaths[item[0]] || "", "", timestamp, timestamp]));
}

function buildEventRows(source, timestamp) {
  return source.map((item) => {
    const asset = eventAssets[item[0]] || {};
    return item.concat([asset.image || "", asset.sound || "", timestamp, timestamp]);
  });
}

function syncEventDefinitions(db, callback) {
  const timestamp = now();
  const statements = events.map((item) => {
    const asset = eventAssets[item[0]] || {};
    return {
      sql: `UPDATE event_cards
        SET event_type = ?, rarity = ?, trigger_condition = ?, effect_desc = ?, board_action = ?, effect_json = ?, image_path = COALESCE(NULLIF(?, ''), image_path), sound_path = COALESCE(NULLIF(?, ''), sound_path), updated_at = ?
        WHERE title = ?`,
      params: [item[1], item[2], item[3], item[4], item[5], item[6], asset.image || "", asset.sound || "", timestamp, item[0]]
    };
  });
  runMany(db, statements, callback);
}

function ensureMissingData(db, callback) {
  const timestamp = now();
  db.all("SELECT name FROM characters", (charListErr, charRows) => {
    if (charListErr) {
      callback(charListErr);
      return;
    }
    const existingCharacters = {};
    for (let i = 0; i < charRows.length; i += 1) {
      existingCharacters[charRows[i].name] = true;
    }
    const missingCharacters = [];
    for (let i = 0; i < characters.length; i += 1) {
      if (!existingCharacters[characters[i][0]]) missingCharacters.push(characters[i]);
    }

    db.all("SELECT title FROM event_cards", (eventListErr, eventRows) => {
      if (eventListErr) {
        callback(eventListErr);
        return;
      }
      const existingEvents = {};
      for (let i = 0; i < eventRows.length; i += 1) {
        existingEvents[eventRows[i].title] = true;
      }
      const missingEvents = [];
      for (let i = 0; i < events.length; i += 1) {
        if (!existingEvents[events[i][0]]) missingEvents.push(events[i]);
      }

      insertMany(
        db,
        `INSERT INTO characters
        (name, tier, faction, role_type, force_value, strategy_value, fame_value, command_value, skill_name, skill_desc, quote_text, image_path, voice_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        buildCharacterRows(missingCharacters, timestamp),
        (insertCharErr) => {
          if (insertCharErr) {
            callback(insertCharErr);
            return;
          }
          insertMany(
            db,
            `INSERT INTO event_cards
            (title, event_type, rarity, trigger_condition, effect_desc, board_action, effect_json, image_path, sound_path, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            buildEventRows(missingEvents, timestamp),
            (insertEventErr) => {
              if (insertEventErr) {
                callback(insertEventErr);
                return;
              }
              syncEventDefinitions(db, (syncEventErr) => {
                if (syncEventErr) {
                  callback(syncEventErr);
                  return;
                }
                syncAssetPaths(db, callback);
              });
            }
          );
        }
      );
    });
  });
}

function seedDatabase(callback) {
  const db = getDb();
  db.get("SELECT COUNT(*) AS total FROM characters", (charErr, charRow) => {
    if (charErr) {
      callback(charErr);
      return;
    }
    db.get("SELECT COUNT(*) AS total FROM event_cards", (eventErr, eventRow) => {
      if (eventErr) {
        callback(eventErr);
        return;
      }
      console.log(`基础数据检查：人物 ${charRow.total} 条，事件 ${eventRow.total} 条`);
      ensureMissingData(db, callback);
    });
  });
}

module.exports = {
  seedDatabase
};
