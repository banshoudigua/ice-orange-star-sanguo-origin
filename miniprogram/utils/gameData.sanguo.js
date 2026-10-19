const characters = [
  { id: 1, name: "刘备", tier: "T1", faction: "汉室", role_type: "仁主", force_value: 72, strategy_value: 82, fame_value: 95, command_value: 78, skill_name: "仁德聚义", skill_desc: "完成事件后，可让一名玩家获得一次重掷机会。", quote_text: "备愿与诸君同扶汉室。", image_path: "https://cdn.example.com/cdn-upload-final/liu-bei.png" },
  { id: 2, name: "关羽", tier: "T1", faction: "汉室", role_type: "武将", force_value: 96, strategy_value: 72, fame_value: 88, command_value: 84, skill_name: "青龙威震", skill_desc: "战斗判定时，若骰子为 5 或 6，可额外获得 1 点战功。", quote_text: "关某在此，何人敢战。", image_path: "https://cdn.example.com/cdn-upload-final/guan-yu.png" },
  { id: 3, name: "张飞", tier: "T1", faction: "汉室", role_type: "猛将", force_value: 94, strategy_value: 55, fame_value: 80, command_value: 76, skill_name: "燕人怒吼", skill_desc: "触发战斗事件时，可迫使事件难度降低 1。", quote_text: "燕人张翼德在此。", image_path: "https://cdn.example.com/cdn-upload-final/zhang-fei.png" },
  { id: 4, name: "曹操", tier: "T1", faction: "群雄", role_type: "枭雄", force_value: 82, strategy_value: 96, fame_value: 90, command_value: 95, skill_name: "乱世机变", skill_desc: "抽到负面事件后，可再抽一张并二选一。", quote_text: "乱世之中，先机最重。", image_path: "https://cdn.example.com/cdn-upload-final/cao-cao.png" },
  { id: 5, name: "孙坚", tier: "T1", faction: "江东", role_type: "武将", force_value: 88, strategy_value: 70, fame_value: 82, command_value: 86, skill_name: "猛虎破阵", skill_desc: "移动到关隘格时，可额外推进 1 步。", quote_text: "江东猛虎，破阵先行。", image_path: "https://cdn.example.com/cdn-upload-final/sun-jian.png" },
  { id: 6, name: "董卓", tier: "T1", faction: "董卓军", role_type: "权臣", force_value: 84, strategy_value: 68, fame_value: 40, command_value: 88, skill_name: "挟天子令", skill_desc: "触发朝堂事件时，可改变一次结算目标。", quote_text: "天下权柄，尽在吾手。", image_path: "https://cdn.example.com/cdn-upload-final/dong-zhuo.png" },
  { id: 7, name: "吕布", tier: "T1", faction: "并州", role_type: "猛将", force_value: 100, strategy_value: 45, fame_value: 78, command_value: 82, skill_name: "飞将无双", skill_desc: "战斗骰为 6 时，直接获得一次额外行动。", quote_text: "吾乃天下飞将。", image_path: "https://cdn.example.com/cdn-upload-final/lv-bu.png" },
  { id: 8, name: "袁绍", tier: "T1", faction: "诸侯", role_type: "盟主", force_value: 75, strategy_value: 80, fame_value: 90, command_value: 84, skill_name: "盟主号令", skill_desc: "多人协作事件中，可让一名玩家追加一次骰子。", quote_text: "诸侯既集，当共讨国贼。", image_path: "https://cdn.example.com/cdn-upload-final/yuan-shao.png" },
  { id: 9, name: "张角", tier: "T1", faction: "黄巾", role_type: "术士", force_value: 62, strategy_value: 90, fame_value: 86, command_value: 80, skill_name: "太平道术", skill_desc: "抽到民心事件时，可将结果向有利方向调整 1。", quote_text: "苍天已死，黄天当立。", image_path: "https://cdn.example.com/cdn-upload-final/zhang-jiao.png" },
  { id: 10, name: "袁术", tier: "T2", faction: "诸侯", role_type: "豪强", force_value: 68, strategy_value: 72, fame_value: 64, command_value: 78, skill_name: "淮南称雄", skill_desc: "资源结算时，可将 1 点粮草转为 1 点声望。", quote_text: "吾据淮南，亦可问鼎天下。", image_path: "https://cdn.example.com/cdn-upload-final/yuan-shu.png" },
  { id: 11, name: "公孙瓒", tier: "T2", faction: "幽州", role_type: "骑将", force_value: 82, strategy_value: 60, fame_value: 70, command_value: 76, skill_name: "白马义从", skill_desc: "移动阶段可获得下次移动 +1。", quote_text: "白马义从，随我破阵。", image_path: "https://cdn.example.com/cdn-upload-final/gongsun-zan.png" },
  { id: 12, name: "何进", tier: "T2", faction: "汉室", role_type: "外戚", force_value: 62, strategy_value: 58, fame_value: 66, command_value: 72, skill_name: "大将军令", skill_desc: "朝堂事件中，可让一名玩家重掷一次声望判定。", quote_text: "奉诏整兵，以清内患。", image_path: "https://cdn.example.com/cdn-upload-final/he-jin.png" },
  { id: 13, name: "王允", tier: "T2", faction: "汉室", role_type: "谋臣", force_value: 36, strategy_value: 92, fame_value: 82, command_value: 60, skill_name: "连环谋", skill_desc: "抽到董卓相关事件时，可降低 1 点事件难度。", quote_text: "除贼之机，当藏于无声处。", image_path: "https://cdn.example.com/cdn-upload-final/wang-yun.png" },
  { id: 14, name: "貂蝉", tier: "T2", faction: "汉室", role_type: "奇谋", force_value: 34, strategy_value: 88, fame_value: 84, command_value: 55, skill_name: "闭月离间", skill_desc: "战斗事件前，可令一名敌方角色本次能力失效。", quote_text: "一曲入夜，乱局自分。", image_path: "https://cdn.example.com/cdn-upload-final/diao-chan.png" },
  { id: 15, name: "华雄", tier: "T2", faction: "董卓军", role_type: "猛将", force_value: 86, strategy_value: 42, fame_value: 58, command_value: 66, skill_name: "汜水逞威", skill_desc: "关隘战斗中，若骰子为 5 或 6，额外增加 1 点难度。", quote_text: "谁敢来战。", image_path: "https://cdn.example.com/cdn-upload-final/hua-xiong.png" },
  { id: 16, name: "朱儁", tier: "T2", faction: "汉室", role_type: "名将", force_value: 82, strategy_value: 76, fame_value: 78, command_value: 88, skill_name: "平乱督军", skill_desc: "黄巾或民心事件中，可额外获得 1 点战功。", quote_text: "讨贼安民，军纪为先。", image_path: "https://cdn.example.com/cdn-upload-final/zhu-jun.png" },
  { id: 17, name: "黄巾力士", tier: "T3", faction: "黄巾", role_type: "士兵", force_value: 68, strategy_value: 30, fame_value: 35, command_value: 48, skill_name: "人多势众", skill_desc: "黄巾事件出现时，事件难度增加 1。", quote_text: "太平道在此。", image_path: "https://cdn.example.com/cdn-upload-final/huangjin-lishi.png" },
  { id: 18, name: "洛阳守卫", tier: "T3", faction: "汉室", role_type: "守卫", force_value: 58, strategy_value: 42, fame_value: 50, command_value: 55, skill_name: "城门守备", skill_desc: "洛阳相关事件中，为守方提供 1 点防守值。", quote_text: "洛阳城门，不可轻开。", image_path: "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png" },
  { id: 19, name: "皇甫嵩", tier: "T1", faction: "汉室", role_type: "名将", force_value: 88, strategy_value: 84, fame_value: 86, command_value: 92, skill_name: "平黄名将", skill_desc: "黄巾或民心事件中，可额外获得 1 点战功。", quote_text: "平乱安民，军令如山。", image_path: "https://cdn.example.com/cdn-upload-final/huangfu-song.png" },
  { id: 20, name: "卢植", tier: "T2", faction: "汉室", role_type: "儒将", force_value: 66, strategy_value: 88, fame_value: 84, command_value: 82, skill_name: "名师军略", skill_desc: "诏令或朝堂事件中，可额外获得 1 点声望。", quote_text: "治军先正其心。", image_path: "https://cdn.example.com/cdn-upload-final/lu-zhi.png" },
  { id: 21, name: "张让", tier: "T2", faction: "宦官", role_type: "权宦", force_value: 28, strategy_value: 86, fame_value: 38, command_value: 50, skill_name: "宫门密诏", skill_desc: "宦官相关事件中，可获得 1 次重抽事件机会。", quote_text: "宫门深处，自有消息。", image_path: "https://cdn.example.com/cdn-upload-final/zhang-rang.png" },
  { id: 22, name: "丁原", tier: "T2", faction: "并州", role_type: "刺史", force_value: 74, strategy_value: 66, fame_value: 70, command_value: 82, skill_name: "并州兵权", skill_desc: "董卓入京相关事件中，可额外获得 1 点战功。", quote_text: "并州兵马，不可轻夺。", image_path: "https://cdn.example.com/cdn-upload-final/ding-yuan.png" }
];

const EVENT_CDN_BASE = "https://cdn.example.com/cdn-upload-final";

function makeEvent(id, title, eventType, rarity, triggerCondition, effectDesc, hostAction, imagePath, soundPath, effectRules) {
  // 事件卡使用独立场景图与统一编号音频，避免继续复用人物头像资源。
  const eventImagePath = `${EVENT_CDN_BASE}/event-${id}.png`;
  const eventSoundPath = `${EVENT_CDN_BASE}/event-${id}.mp3`;
  return {
    id,
    title,
    event_type: eventType,
    rarity,
    trigger_condition: triggerCondition,
    effect_desc: effectDesc,
    board_action: hostAction,
    image_path: eventImagePath || imagePath,
    sound_path: eventSoundPath || soundPath || "",
    effect_rules: effectRules || {}
  };
}

const events = [
  makeEvent(1, "黄巾流民四起", "民心事件", "普通", "回合开始", "当前玩家安抚流民，粮草 -1、声望 +1。若粮草不足，则改为银两 -1；若随从里有皇甫嵩，额外战功 +1。", "系统结算：扣当前玩家 1 粮草并增加 1 声望；粮草为 0 时扣 1 银两，并自动检查皇甫嵩平乱加成。", "https://cdn.example.com/cdn-upload-final/huangjin-lishi.png", "https://cdn.example.com/cdn-upload-final/event-1.mp3", { current: { grain: -1, prestige: 1 }, fallbackCost: { from: "grain", to: "silver", amount: 1 }, namedAllyBonus: { name: "皇甫嵩", changes: { battle: 1 } } }),
  makeEvent(2, "桃园结义", "历史事件", "史诗", "抽到汉室人物", "当前玩家获得 1 点声望，并抽 1 张汉室人物卡加入随从。", "系统结算：声望 +1，并自动抽取一名汉室人物作为随从记录。", "https://cdn.example.com/cdn-upload-final/liu-bei.png", "https://cdn.example.com/cdn-upload-final/event-taoyuan-jieyi.mp3", { current: { prestige: 1 }, drawCharacter: { faction: "汉室" } }),
  makeEvent(3, "董卓入京", "历史事件", "重大", "朝堂阶段", "董卓率西凉军入洛阳，所有玩家声望 -1；当前玩家若银两不少于 2，可用 2 银两换 1 战功；若随从里有丁原，额外战功 +1。", "系统结算：全员声望 -1，当前玩家银两足够时自动扣 2 银两并加 1 战功，并自动检查丁原并州兵权加成。", "https://cdn.example.com/cdn-upload-final/dong-zhuo.png", "https://cdn.example.com/cdn-upload-final/event-3.mp3", { all: { prestige: -1 }, currentIfEnough: { silver: -2, battle: 1 }, namedAllyBonus: { name: "丁原", changes: { battle: 1 } } }),
  makeEvent(4, "虎牢关战鼓", "战斗事件", "重大", "进入关隘", "当前玩家战功 +1；若随从里有武力 90 以上人物，额外银两 +1。", "系统结算：战功 +1，并按随从武力自动判断是否额外获得 1 银两。", "https://cdn.example.com/cdn-upload-final/hua-xiong.png", "https://cdn.example.com/cdn-upload-final/event-hulaoguan-zhangu.mp3", { current: { battle: 1 }, allyThresholdBonus: { field: "force_value", value: 90, changes: { silver: 1 } } }),
  makeEvent(5, "粮草告急", "粮草事件", "普通", "任意回合", "当前玩家粮草 -1。若拥有内政型随从，可减少 1 银两损耗并补记粮道调整。", "系统结算：粮草 -1；系统保留随从记录，用于之后资源事件判定。", "https://cdn.example.com/cdn-upload-final/yuan-shu.png", "https://cdn.example.com/cdn-upload-final/event-liangcao-gaoji.mp3", { current: { grain: -1 } }),
  makeEvent(6, "大雨阻军", "天气事件", "稀有", "移动前", "当前玩家下次摇骰移动 -1，最低移动 1 格。", "系统结算：给当前玩家记录下次移动 -1，下一次摇骰后自动清除。", "https://cdn.example.com/cdn-upload-final/gongsun-zan.png", "https://cdn.example.com/cdn-upload-final/event-dayu-zujun.mp3", { current: { move_adjust: -1 } }),
  makeEvent(7, "义士投奔", "奇遇事件", "稀有", "完成任务后", "当前玩家抽 1 张 T2 人物卡作为随从；随从最高属性会影响后续事件奖励。", "系统结算：自动抽取一名 T2 人物并记录到当前玩家随从列表。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-yishi-touben.mp3", { drawCharacter: { tier: "T2" } }),
  makeEvent(8, "夜袭营寨", "战斗事件", "普通", "回合结束", "当前玩家战功 -1、银两 +1，代表撤营后保全辎重。", "系统结算：战功 -1，银两 +1，战功最低为 0。", "https://cdn.example.com/cdn-upload-final/zhang-fei.png", "https://cdn.example.com/cdn-upload-final/event-yexi-yingzhai.mp3", { current: { battle: -1, silver: 1 } }),
  makeEvent(9, "民心归附", "民心事件", "普通", "帮助村落后", "当前玩家声望 +1，银两 +1。", "系统结算：当前玩家声望 +1、银两 +1。", "https://cdn.example.com/cdn-upload-final/zhang-jiao.png", "https://cdn.example.com/cdn-upload-final/event-minxin-guifu.mp3", { current: { prestige: 1, silver: 1 } }),
  makeEvent(10, "白马义从巡原", "行军事件", "稀有", "移动后", "当前玩家下次移动 +2；若随从中有公孙瓒，额外声望 +1。", "系统结算：记录下次移动 +2，并自动检查随从加成。", "https://cdn.example.com/cdn-upload-final/gongsun-zan.png", "https://cdn.example.com/cdn-upload-final/event-10.mp3", { current: { move_adjust: 2 }, namedAllyBonus: { name: "公孙瓒", changes: { prestige: 1 } } }),
  makeEvent(11, "洛阳城门夜开", "朝堂事件", "重大", "到达洛阳", "当前玩家声望 +1、银两 -1；若银两不足，下回合暂停行动一次。", "系统结算：优先扣 1 银两并加 1 声望；银两不足时记录暂停 1 次。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-11.mp3", { current: { prestige: 1 }, costOrPause: { silver: 1, paused_turns: 1 } }),
  makeEvent(12, "青龙刀光", "战斗事件", "史诗", "战斗骰出现 6", "当前玩家战功 +2；若随从里有关羽，额外声望 +1。", "系统结算：战功 +2，并自动检查关羽随从加成。", "https://cdn.example.com/cdn-upload-final/guan-yu.png", "https://cdn.example.com/cdn-upload-final/event-12.mp3", { current: { battle: 2 }, namedAllyBonus: { name: "关羽", changes: { prestige: 1 } } }),
  makeEvent(13, "猛虎渡江", "行军事件", "稀有", "经过水路或渡口", "当前玩家下次移动 +1、战功 +1；若随从里有孙坚，再得 1 银两。", "系统结算：记录移动 +1、战功 +1，并检查孙坚随从加成。", "https://cdn.example.com/cdn-upload-final/sun-jian.png", "https://cdn.example.com/cdn-upload-final/event-13.mp3", { current: { move_adjust: 1, battle: 1 }, namedAllyBonus: { name: "孙坚", changes: { silver: 1 } } }),
  makeEvent(14, "连环密计", "谋略事件", "稀有", "朝堂阶段后", "当前玩家银两 +1；若谋略随从最高智谋 90 以上，声望再 +1。", "系统结算：银两 +1，并按随从智谋自动追加声望。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-14.mp3", { current: { silver: 1 }, allyThresholdBonus: { field: "strategy_value", value: 90, changes: { prestige: 1 } } }),
  makeEvent(15, "闭月离间", "谋略事件", "史诗", "领先玩家触发", "当前玩家指定领先者暂停行动 1 次；系统先记录到当前玩家的离间次数。", "系统结算：当前玩家声望 +1，并记录一次可对线下领先者使用的暂停效果。", "https://cdn.example.com/cdn-upload-final/diao-chan.png", "https://cdn.example.com/cdn-upload-final/event-15.mp3", { current: { prestige: 1, tactic_tokens: 1 } }),
  makeEvent(16, "太平符水", "民心事件", "稀有", "村落或集市", "当前玩家粮草 +1、声望 +1；若随从里有张角，银两 +1。", "系统结算：粮草 +1、声望 +1，并检查张角随从加成。", "https://cdn.example.com/cdn-upload-final/zhang-jiao.png", "https://cdn.example.com/cdn-upload-final/event-16.mp3", { current: { grain: 1, prestige: 1 }, namedAllyBonus: { name: "张角", changes: { silver: 1 } } }),
  makeEvent(17, "诸侯会盟", "历史事件", "重大", "任意两名玩家会合", "所有玩家声望 +1；当前玩家若有袁绍随从，额外抽 1 张 T2 人物卡。", "系统结算：全员声望 +1，并自动检查袁绍随从奖励。", "https://cdn.example.com/cdn-upload-final/yuan-shao.png", "https://cdn.example.com/cdn-upload-final/event-17.mp3", { all: { prestige: 1 }, namedAllyDraw: { name: "袁绍", tier: "T2" } }),
  makeEvent(18, "淮南粮市", "粮草事件", "普通", "经过集市", "当前玩家可用 1 银两换 2 粮草；若随从里有袁术，额外粮草 +1。", "系统结算：银两足够时自动扣 1 银两、粮草 +2，并检查袁术随从加成。", "https://cdn.example.com/cdn-upload-final/yuan-shu.png", "https://cdn.example.com/cdn-upload-final/event-18.mp3", { currentIfEnough: { silver: -1, grain: 2 }, namedAllyBonus: { name: "袁术", changes: { grain: 1 } } }),
  makeEvent(19, "飞将突阵", "战斗事件", "史诗", "战功落后时", "当前玩家战功 +2；若随从里有吕布，下次移动 +1。", "系统结算：战功 +2，并检查吕布随从加成。", "https://cdn.example.com/cdn-upload-final/lv-bu.png", "https://cdn.example.com/cdn-upload-final/event-19.mp3", { current: { battle: 2 }, namedAllyBonus: { name: "吕布", changes: { move_adjust: 1 } } }),
  makeEvent(20, "大将军急令", "朝堂事件", "普通", "回合开始", "当前玩家下次移动 +1；若随从里有何进，声望 +1。", "系统结算：记录移动 +1，并检查何进随从加成。", "https://cdn.example.com/cdn-upload-final/he-jin.png", "https://cdn.example.com/cdn-upload-final/event-20.mp3", { current: { move_adjust: 1 }, namedAllyBonus: { name: "何进", changes: { prestige: 1 } } }),
  makeEvent(21, "涿郡据桥", "防守事件", "稀有", "被追击时", "当前玩家在涿郡桥道据守，避免本次负面追击，战功 +1；若随从里有张飞，银两 +1。", "系统结算：战功 +1，并检查张飞随从加成；这是起兵初期的桥道据守事件，不再引用后期长坂桥情节。", "https://cdn.example.com/cdn-upload-final/zhang-fei.png", "https://cdn.example.com/cdn-upload-final/event-21.mp3", { current: { battle: 1 }, namedAllyBonus: { name: "张飞", changes: { silver: 1 } } }),
  makeEvent(22, "乱世机变", "谋略事件", "重大", "抽到负面事件", "当前玩家银两 +1，并获得 1 次重抽事件机会。", "系统结算：银两 +1、重抽机会 +1。", "https://cdn.example.com/cdn-upload-final/cao-cao.png", "https://cdn.example.com/cdn-upload-final/event-22.mp3", { current: { silver: 1, redraw_tokens: 1 } }),
  makeEvent(23, "汜水叫阵", "战斗事件", "普通", "进入汜水关", "当前玩家战功 +1、粮草 -1；若随从里有华雄，战功额外 +1。", "系统结算：战功 +1、粮草 -1，并检查华雄随从加成。", "https://cdn.example.com/cdn-upload-final/hua-xiong.png", "https://cdn.example.com/cdn-upload-final/event-23.mp3", { current: { battle: 1, grain: -1 }, namedAllyBonus: { name: "华雄", changes: { battle: 1 } } }),
  makeEvent(24, "城门盘查", "防守事件", "普通", "经过关隘", "当前玩家银两 -1；若银两不足，本次移动停止并记录暂停 1 次。", "系统结算：优先扣 1 银两；银两不足时暂停 1 次。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-24.mp3", { costOrPause: { silver: 1, paused_turns: 1 } }),
  makeEvent(25, "丰收小集", "粮草事件", "普通", "帮助村落后", "当前玩家粮草 +2；若声望达到 3，银两再 +1。", "系统结算：粮草 +2，并按声望自动追加银两。", "https://cdn.example.com/cdn-upload-final/liu-bei.png", "https://cdn.example.com/cdn-upload-final/event-25.mp3", { current: { grain: 2 }, statThresholdBonus: { field: "prestige", value: 3, changes: { silver: 1 } } }),
  makeEvent(26, "晴风开路", "天气事件", "普通", "移动前", "当前玩家下次移动 +1。", "系统结算：记录下次移动 +1，下一次摇骰后自动清除。", "https://cdn.example.com/cdn-upload-final/sun-jian.png", "https://cdn.example.com/cdn-upload-final/event-26.mp3", { current: { move_adjust: 1 } }),
  makeEvent(27, "黄天再起", "民心事件", "重大", "黄巾威胁升高", "所有玩家粮草 -1；当前玩家若有张角或黄巾随从，声望 +1。", "系统结算：全员粮草 -1，并检查当前玩家黄巾相关随从。", "https://cdn.example.com/cdn-upload-final/huangjin-lishi.png", "https://cdn.example.com/cdn-upload-final/event-27.mp3", { all: { grain: -1 }, allyFactionBonus: { faction: "黄巾", changes: { prestige: 1 } } }),
  makeEvent(28, "乡勇归队", "民心事件", "普通", "声望提升后", "当前玩家声望 +1、战功 +1。", "系统结算：当前玩家声望 +1、战功 +1。", "https://cdn.example.com/cdn-upload-final/liu-bei.png", "https://cdn.example.com/cdn-upload-final/event-28.mp3", { current: { prestige: 1, battle: 1 } }),
  makeEvent(29, "民怨暗涌", "民心事件", "普通", "连续征收后", "当前玩家银两 +2、声望 -1。", "系统结算：当前玩家银两 +2、声望 -1。", "https://cdn.example.com/cdn-upload-final/dong-zhuo.png", "https://cdn.example.com/cdn-upload-final/event-29.mp3", { current: { silver: 2, prestige: -1 } }),
  makeEvent(30, "诏书传檄", "历史事件", "稀有", "朝堂消息传来", "朝廷诏书传至州郡，当前玩家声望 +2；若银两不足 2，则声望只 +1；若随从里有卢植，额外声望 +1。", "系统结算：银两达到 2 时声望 +2，否则声望 +1，并自动检查卢植名师声望加成。", "https://cdn.example.com/cdn-upload-final/he-jin.png", "https://cdn.example.com/cdn-upload-final/event-30.mp3", { thresholdChoice: { field: "silver", value: 2, pass: { prestige: 2 }, fail: { prestige: 1 } }, namedAllyBonus: { name: "卢植", changes: { prestige: 1 } } }),
  makeEvent(31, "讨董檄文", "历史事件", "重大", "群雄响应", "所有玩家战功 +1；当前玩家声望 +1。", "系统结算：全员战功 +1，当前玩家声望 +1。", "https://cdn.example.com/cdn-upload-final/cao-cao.png", "https://cdn.example.com/cdn-upload-final/event-31.mp3", { all: { battle: 1 }, current: { prestige: 1 } }),
  makeEvent(32, "校场比武", "战斗事件", "普通", "进入兵营", "当前玩家战功 +1；若武力随从最高达到 90，战功再 +1。", "系统结算：战功 +1，并按随从武力自动追加。", "https://cdn.example.com/cdn-upload-final/lv-bu.png", "https://cdn.example.com/cdn-upload-final/event-32.mp3", { current: { battle: 1 }, allyThresholdBonus: { field: "force_value", value: 90, changes: { battle: 1 } } }),
  makeEvent(33, "军械售卖", "战斗事件", "稀有", "经过集市", "当前玩家银两 -2、战功 +2；银两不足则只获得战功 +1。", "系统结算：银两足够扣 2 加 2 战功，否则加 1 战功。", "https://cdn.example.com/cdn-upload-final/guan-yu.png", "https://cdn.example.com/cdn-upload-final/event-33.mp3", { thresholdChoice: { field: "silver", value: 2, pass: { silver: -2, battle: 2 }, fail: { battle: 1 } } }),
  makeEvent(34, "军粮转运", "粮草事件", "普通", "道路补给", "当前玩家粮草 +1、银两 +1。", "系统结算：当前玩家粮草 +1、银两 +1。", "https://cdn.example.com/cdn-upload-final/yuan-shu.png", "https://cdn.example.com/cdn-upload-final/event-34.mp3", { current: { grain: 1, silver: 1 } }),
  makeEvent(35, "粮价飞涨", "粮草事件", "稀有", "集市结算", "当前玩家可出售 1 粮草换 3 银两；粮草不足则银两不变。", "系统结算：粮草足够时扣 1 粮草、银两 +3。", "https://cdn.example.com/cdn-upload-final/yuan-shu.png", "https://cdn.example.com/cdn-upload-final/event-35.mp3", { currentIfEnough: { grain: -1, silver: 3 } }),
  makeEvent(36, "暴雨成泥", "天气事件", "普通", "移动前", "当前玩家下次移动 -2，最低移动 1 格。", "系统结算：记录下次移动 -2，下一次摇骰后自动清除。", "https://cdn.example.com/cdn-upload-final/gongsun-zan.png", "https://cdn.example.com/cdn-upload-final/event-36.mp3", { current: { move_adjust: -2 } }),
  makeEvent(37, "顺风急行", "天气事件", "普通", "移动前", "当前玩家下次移动 +2。", "系统结算：记录下次移动 +2，下一次摇骰后自动清除。", "https://cdn.example.com/cdn-upload-final/sun-jian.png", "https://cdn.example.com/cdn-upload-final/event-37.mp3", { current: { move_adjust: 2 } }),
  makeEvent(38, "市井传闻", "奇遇事件", "普通", "经过市集", "当前玩家银两 +1，并获得 1 次重抽事件机会。", "系统结算：银两 +1、重抽机会 +1。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-38.mp3", { current: { silver: 1, redraw_tokens: 1 } }),
  makeEvent(39, "名士举荐", "奇遇事件", "稀有", "声望达到 3", "当前玩家抽 1 张 T1 人物卡；若声望不足 3，改抽 T2 人物卡。", "系统结算：根据声望自动抽取 T1 或 T2 人物随从。", "https://cdn.example.com/cdn-upload-final/yuan-shao.png", "https://cdn.example.com/cdn-upload-final/event-39.mp3", { drawCharacterByStat: { field: "prestige", value: 3, passTier: "T1", failTier: "T2" } }),
  makeEvent(40, "旧部来投", "奇遇事件", "普通", "战功提升后", "当前玩家抽 1 张 T3 人物卡，并获得银两 +1。", "系统结算：自动抽取 T3 随从，当前玩家银两 +1。", "https://cdn.example.com/cdn-upload-final/huangjin-lishi.png", "https://cdn.example.com/cdn-upload-final/event-40.mp3", { current: { silver: 1 }, drawCharacter: { tier: "T3" } }),
  makeEvent(41, "门客献策", "谋略事件", "普通", "抽到谋臣随从后", "当前玩家声望 +1；若智谋随从最高达到 90，银两 +1。", "系统结算：声望 +1，并按随从智谋追加银两。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-41.mp3", { current: { prestige: 1 }, allyThresholdBonus: { field: "strategy_value", value: 90, changes: { silver: 1 } } }),
  makeEvent(42, "疑兵惑敌", "谋略事件", "普通", "被追击前", "当前玩家下次移动 +1，并记录 1 次防守令。", "系统结算：移动修正 +1、防守令 +1。", "https://cdn.example.com/cdn-upload-final/cao-cao.png", "https://cdn.example.com/cdn-upload-final/event-42.mp3", { current: { move_adjust: 1, guard_tokens: 1 } }),
  makeEvent(43, "城防修缮", "防守事件", "普通", "经过己方城池", "当前玩家银两 -1、声望 +1；若银两不足，声望不变。", "系统结算：银两足够时扣 1 银两、声望 +1。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-43.mp3", { currentIfEnough: { silver: -1, prestige: 1 } }),
  makeEvent(44, "关隘免税", "防守事件", "稀有", "经过关隘", "当前玩家本次不支付城池通行费，并获得银两 +1。", "系统结算：银两 +1，并提示本次线下通行费免收。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-44.mp3", { current: { silver: 1, toll_free_tokens: 1 } }),
  makeEvent(45, "商旅入城", "势力事件", "普通", "经过城池", "当前玩家银两 +2；若拥有任意城池，额外声望 +1。", "系统结算：银两 +2，并按城池归属自动追加声望。", "https://cdn.example.com/cdn-upload-final/yuan-shu.png", "https://cdn.example.com/cdn-upload-final/event-45.mp3", { current: { silver: 2 }, cityOwnerBonus: { changes: { prestige: 1 } } }),
  makeEvent(46, "豪强纳贡", "势力事件", "稀有", "势力扩张", "当前玩家银两 +3、声望 -1。", "系统结算：当前玩家银两 +3、声望 -1。", "https://cdn.example.com/cdn-upload-final/yuan-shao.png", "https://cdn.example.com/cdn-upload-final/event-46.mp3", { current: { silver: 3, prestige: -1 } }),
  makeEvent(47, "商路通行", "势力事件", "重大", "回合结算", "拥有城池的玩家各得 1 银两；当前玩家若无城池，获得声望 +1。", "系统结算：城主获得商路收益 1 银两；当前玩家无城池时声望 +1。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-47.mp3", { cityIncome: { silver: 1 }, noCityCurrent: { prestige: 1 } }),
  makeEvent(48, "轻骑探路", "行军事件", "普通", "移动前", "当前玩家下次移动 +1，并获得 1 银两。", "系统结算：移动修正 +1、银两 +1。", "https://cdn.example.com/cdn-upload-final/gongsun-zan.png", "https://cdn.example.com/cdn-upload-final/event-48.mp3", { current: { move_adjust: 1, silver: 1 } }),
  makeEvent(49, "迷路折返", "行军事件", "普通", "移动后", "当前玩家位置 -2，最低为 0；银两 +1。", "系统结算：当前位置回退 2 格，最低 0，同时银两 +1。", "https://cdn.example.com/cdn-upload-final/zhang-fei.png", "https://cdn.example.com/cdn-upload-final/event-49.mp3", { current: { position: -2, silver: 1 } }),
  makeEvent(50, "驿站换马", "行军事件", "稀有", "经过驿站", "当前玩家银两 -1、下次移动 +3；银两不足则只移动 +1。", "系统结算：银两足够扣 1 并移动修正 +3，否则移动修正 +1。", "https://cdn.example.com/cdn-upload-final/sun-jian.png", "https://cdn.example.com/cdn-upload-final/event-50.mp3", { thresholdChoice: { field: "silver", value: 1, pass: { silver: -1, move_adjust: 3 }, fail: { move_adjust: 1 } } }),
  makeEvent(51, "张让余党", "朝堂事件", "普通", "朝堂纷争", "十常侍余党在宫门暗中活动，当前玩家银两 -1、声望 +1；若银两不足，改为暂停行动 1 次；若随从里有张让，获得 1 次重抽事件机会。", "系统结算：优先扣 1 银两并加 1 声望；银两不足时暂停 1 次，并自动检查张让宫门消息加成。", "https://cdn.example.com/cdn-upload-final/he-jin.png", "https://cdn.example.com/cdn-upload-final/event-51.mp3", { current: { prestige: 1 }, costOrPause: { silver: 1, paused_turns: 1 }, namedAllyBonus: { name: "张让", changes: { redraw_tokens: 1 } } }),
  makeEvent(52, "诏狱密奏", "朝堂事件", "稀有", "声望领先", "当前玩家声望 +1，并获得 1 次防守令；若智谋随从达到 90，银两 +1。", "系统结算：声望 +1、防守令 +1，并按随从智谋追加银两。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-52.mp3", { current: { prestige: 1, guard_tokens: 1 }, allyThresholdBonus: { field: "strategy_value", value: 90, changes: { silver: 1 } } }),
  makeEvent(53, "羽林护驾", "朝堂事件", "重大", "进入主城", "当前玩家战功 +1、声望 +1；若拥有洛阳，银两 +2。", "系统结算：战功 +1、声望 +1；洛阳城主额外银两 +2。", "https://cdn.example.com/cdn-upload-final/luoyang-shouwei.png", "https://cdn.example.com/cdn-upload-final/event-53.mp3", { current: { battle: 1, prestige: 1 }, cityOwnerBonus: { changes: { silver: 2 } } }),
  makeEvent(54, "瞒天过海", "三十六计", "稀有", "经过敌方城池", "当前玩家获得 1 次免税效果，并可额外移动 +1。", "系统结算：免税 +1、移动修正 +1。", "https://cdn.example.com/cdn-upload-final/cao-cao.png", "https://cdn.example.com/cdn-upload-final/event-54.mp3", { current: { toll_free_tokens: 1, move_adjust: 1 } }),
  makeEvent(55, "围魏救赵", "三十六计", "重大", "城池争夺", "当前玩家声望 +1，并让自己下次攻城战力 +40。", "系统结算：声望 +1、攻城令 +40。", "https://cdn.example.com/cdn-upload-final/yuan-shao.png", "https://cdn.example.com/cdn-upload-final/event-55.mp3", { current: { prestige: 1, siege_tokens: 40 } }),
  makeEvent(56, "借刀杀人", "三十六计", "稀有", "抽到武将后", "当前玩家抽 1 张 T2 人物卡；若已拥有 3 名随从，银两 +2。", "系统结算：抽 T2 随从，并按随从数量追加银两。", "https://cdn.example.com/cdn-upload-final/wang-yun.png", "https://cdn.example.com/cdn-upload-final/event-56.mp3", { drawCharacter: { tier: "T2" }, allyCountBonus: { value: 3, changes: { silver: 2 } } }),
  makeEvent(57, "声东击西", "三十六计", "普通", "移动前", "当前玩家下次移动 +2；若本回合选择攻城，战力额外 +40。", "系统结算：移动修正 +2、攻城令 +40。", "https://cdn.example.com/cdn-upload-final/gongsun-zan.png", "https://cdn.example.com/cdn-upload-final/event-57.mp3", { current: { move_adjust: 2, siege_tokens: 40 } }),
  makeEvent(58, "趁火打劫", "三十六计", "稀有", "其他玩家银两领先", "当前玩家银两 +2；若拥有武力 90 以上随从，战功 +1。", "系统结算：银两 +2，并按随从武力追加战功。", "https://cdn.example.com/cdn-upload-final/lv-bu.png", "https://cdn.example.com/cdn-upload-final/event-58.mp3", { current: { silver: 2 }, allyThresholdBonus: { field: "force_value", value: 90, changes: { battle: 1 } } }),
  makeEvent(59, "以逸待劳", "三十六计", "普通", "回合结束", "当前玩家粮草 +1，并获得 1 次防守令。", "系统结算：粮草 +1、防守令 +1。", "https://cdn.example.com/cdn-upload-final/liu-bei.png", "https://cdn.example.com/cdn-upload-final/event-59.mp3", { current: { grain: 1, guard_tokens: 1 } })
];

const cities = [
  {
    id: 1,
    name: "洛阳",
    position: 6,
    price: 8,
    toll: 2,
    defense: 180,
    level: 1,
    upgrade_cost: 5,
    owner_id: null,
    owner_name: "",
    desc: "朝堂重地，他人经过时需向城主支付过路费。",
    history_desc: "东汉旧都，朝堂与宫阙所在。三国起源阶段，十常侍乱政、董卓入京与迁都风云都围绕洛阳展开，是天下诸侯争夺正统与声望的核心。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-1-luoyang.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-1-luoyang-voice.mp3"
  },
  {
    id: 2,
    name: "陈留",
    position: 10,
    price: 5,
    toll: 1,
    defense: 110,
    level: 1,
    upgrade_cost: 3,
    owner_id: null,
    owner_name: "",
    desc: "交通要道，适合早期积累银两。",
    history_desc: "中原交通要道，商旅与兵粮往来频繁。曹操起兵讨董时，陈留是聚兵号召的重要据点，适合早期积累银两与声望。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-2-chenliu.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-2-chenliu-voice.mp3"
  },
  {
    id: 3,
    name: "汜水关",
    position: 14,
    price: 6,
    toll: 2,
    defense: 150,
    level: 1,
    upgrade_cost: 4,
    owner_id: null,
    owner_name: "",
    desc: "关隘城池，过路收费更稳定。",
    history_desc: "洛阳外围关隘之一，控扼诸侯西进道路。群雄讨董时，汜水关战鼓初响，华雄逞威，使这里成为早期战事的重要关口。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-3-sishuiguan.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-3-sishuiguan-voice.mp3"
  },
  {
    id: 4,
    name: "虎牢关",
    position: 18,
    price: 7,
    toll: 2,
    defense: 170,
    level: 1,
    upgrade_cost: 5,
    owner_id: null,
    owner_name: "",
    desc: "战事核心，适合战功路线玩家。",
    history_desc: "天下雄关，洛阳东面屏障。群雄讨董、虎牢鏖战的声势在此汇聚，吕布飞将之名也让这座关隘成为战功路线的关键节点。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-4-hulaoguan.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-4-hulaoguan-voice.mp3"
  },
  {
    id: 5,
    name: "邺城",
    position: 23,
    price: 6,
    toll: 1,
    defense: 130,
    level: 1,
    upgrade_cost: 4,
    owner_id: null,
    owner_name: "",
    desc: "粮道充足，他人经过时需向城主支付过路费。",
    history_desc: "河北重镇，粮道充足、城防稳健。三国起源阶段，河北诸侯经营根基，邺城代表北方粮草与兵员的长期支撑。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-5-yecheng.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-5-yecheng-voice.mp3"
  },
  {
    id: 6,
    name: "许昌",
    position: 28,
    price: 7,
    toll: 2,
    defense: 160,
    level: 1,
    upgrade_cost: 5,
    owner_id: null,
    owner_name: "",
    desc: "中原要冲，后期争夺价值高。",
    history_desc: "中原要冲，连接兖豫之地。早期虽未正式成为都城，但其地势居中、便于调兵理政，在本项目中代表后期争夺价值很高的战略城池。",
    image_path: "https://cdn.example.com/cdn-upload-final/city-6-xuchang.png",
    sound_path: "https://cdn.example.com/cdn-upload-final/city-6-xuchang-voice.mp3"
  }
];

const characterSlots = [
  { id: 1, name: "义士馆", position: 4, tier: "T3", desc: "落到此格时，操作台自动为当前玩家抽取一张基础人物卡。" },
  { id: 2, name: "名士亭", position: 12, tier: "T2", desc: "落到此格时，操作台自动为当前玩家抽取一张精英人物卡。" },
  { id: 3, name: "军议台", position: 20, tier: "T2", desc: "落到此格时，操作台自动为当前玩家抽取一张精英人物卡。" },
  { id: 4, name: "群英阁", position: 26, tier: "T1", desc: "落到此格时，操作台自动为当前玩家抽取一张核心人物卡。" }
];

module.exports = {
  characters,
  events,
  cities,
  characterSlots
};



