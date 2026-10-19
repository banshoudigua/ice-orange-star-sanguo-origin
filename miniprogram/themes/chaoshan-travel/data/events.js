const AUDIO_CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/chaoshan-travel/audio";
const IMAGE_CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/chaoshan-travel/events";

function makeEvent(id, title, eventType, rarity, triggerCondition, effectDesc, hostAction, effectRules) {
  return {
    id,
    title,
    event_type: eventType,
    rarity,
    trigger_condition: triggerCondition,
    effect_desc: effectDesc,
    board_action: hostAction,
    image_path: `${IMAGE_CDN_BASE}/event-${id}.png`,
    sound_path: `${AUDIO_CDN_BASE}/event-${id}.mp3`,
    effect_rules: effectRules || {}
  };
}

module.exports = [
  makeEvent(1, "老店刚开门", "美食事件", "普通", "回合开始", "当前玩家抢到第一锅热食，银两 +1、人气 +1。", "系统结算：银两 +1、人气 +1。", { current: { silver: 1, prestige: 1 } }),
  makeEvent(2, "排队爆满", "游玩事件", "普通", "任意回合", "当前玩家下次移动 -1，最低仍为 1 格。", "系统结算：记录下次移动 -1。", { current: { move_adjust: -1 } }),
  makeEvent(3, "本地人带路", "奇遇事件", "稀有", "经过老街", "当前玩家下次移动 +2，并获得 1 银两。", "系统结算：记录移动修正 +2、银两 +1。", { current: { move_adjust: 2, silver: 1 } }),
  makeEvent(4, "海边晚霞", "风景事件", "普通", "经过海边景点", "当前玩家人气 +1。", "系统结算：人气 +1。", { current: { prestige: 1 } }),
  makeEvent(5, "老店今日限量", "美食事件", "稀有", "抽卡后", "当前玩家抽 1 张 T2 美食卡。", "系统结算：自动抽取一张 T2 美食卡。", { drawCharacter: { tier: "T2" } }),
  makeEvent(6, "赶上庙会巡游", "节庆事件", "重大", "进入景点区", "所有玩家人气 +1。", "系统结算：全员人气 +1。", { all: { prestige: 1 } }),
  makeEvent(7, "误入小巷", "游玩事件", "普通", "移动后", "当前玩家位置 -2，并获得 1 银两作为补偿。", "系统结算：位置后退 2 格，银两 +1。", { current: { position: -2, silver: 1 } }),
  makeEvent(8, "拼桌遇熟客", "奇遇事件", "普通", "在店里停留后", "当前玩家获得 1 次重抽事件机会。", "系统结算：重抽 +1。", { current: { redraw_tokens: 1 } }),
  makeEvent(9, "海鲜刚到港", "市场事件", "稀有", "经过海边线路", "当前玩家体力 +1、银两 +1。", "系统结算：体力 +1、银两 +1。", { current: { grain: 1, silver: 1 } }),
  makeEvent(10, "天气太热", "天气事件", "普通", "移动前", "当前玩家下次移动 -2。", "系统结算：移动修正 -2。", { current: { move_adjust: -2 } }),
  makeEvent(11, "工夫茶待客", "人情事件", "稀有", "到达人文景点", "当前玩家人气 +2；若银两不足 2，则改为人气 +1。", "系统结算：按银两门槛增加人气。", { thresholdChoice: { field: "silver", value: 2, pass: { prestige: 2 }, fail: { prestige: 1 } } }),
  makeEvent(12, "海风顺路", "天气事件", "普通", "移动前", "当前玩家下次移动 +2。", "系统结算：移动修正 +2。", { current: { move_adjust: 2 } }),
  makeEvent(13, "游客推荐榜", "景点评分", "重大", "人气领先后", "当前玩家人气 +1，并获得 1 次免游玩费效果。", "系统结算：人气 +1、免游玩费 +1。", { current: { prestige: 1, toll_free_tokens: 1 } }),
  makeEvent(14, "食材售罄", "美食事件", "普通", "经过餐饮格", "当前玩家银两 -1；若银两不足，则暂停 1 次。", "系统结算：优先扣银两，不足则暂停。", { costOrPause: { silver: 1, paused_turns: 1 } }),
  makeEvent(15, "夜市加场", "美食事件", "稀有", "回合结束", "当前玩家银两 +2；若拥有任意景点，再得人气 +1。", "系统结算：银两 +2，并按景点拥有情况追加人气。", { current: { silver: 2 }, cityOwnerBonus: { changes: { prestige: 1 } } }),
  makeEvent(16, "打卡分享爆红", "社交事件", "重大", "完成景点打卡", "当前玩家人气 +2、银两 +1。", "系统结算：人气 +2、银两 +1。", { current: { prestige: 2, silver: 1 } }),
  makeEvent(17, "顺手带伴手礼", "购物事件", "普通", "经过商圈", "当前玩家银两 -1、人气 +1。", "系统结算：银两 -1、人气 +1。", { current: { silver: -1, prestige: 1 } }),
  makeEvent(18, "雨后凉快", "天气事件", "普通", "移动前", "当前玩家下次移动 +1。", "系统结算：移动修正 +1。", { current: { move_adjust: 1 } }),
  makeEvent(19, "熟客推荐私房店", "奇遇事件", "稀有", "抽到小吃后", "当前玩家抽 1 张 T1 美食卡；若条件不足则抽 T2。", "系统结算：按当前人气自动抽卡。", { drawCharacterByStat: { field: "prestige", value: 3, passTier: "T1", failTier: "T2" } }),
  makeEvent(20, "景区拍照排队", "游玩事件", "普通", "经过热门景点", "当前玩家暂停行动 1 次。", "系统结算：暂停 1 次。", { current: { paused_turns: 1 } }),
  makeEvent(21, "海边公路畅通", "路线事件", "普通", "经过南澳线", "当前玩家下次移动 +3。", "系统结算：移动修正 +3。", { current: { move_adjust: 3 } }),
  makeEvent(22, "老街直播带货", "商圈事件", "重大", "回合结算", "拥有景点的玩家各得 1 银两；当前玩家若无景点，人气 +1。", "系统结算：景点拥有者结算收益，无景点的当前玩家获得人气补偿。", { cityIncome: { silver: 1 }, noCityCurrent: { prestige: 1 } }),
  makeEvent(23, "边走边吃", "美食事件", "普通", "移动后", "当前玩家体力 +1，并获得 1 银两。", "系统结算：体力 +1、银两 +1。", { current: { grain: 1, silver: 1 } }),
  makeEvent(24, "深夜收摊", "时间事件", "普通", "回合结束", "当前玩家人气 -1、银两 +1。", "系统结算：人气最低为 0，并获得 1 银两。", { current: { prestige: -1, silver: 1 } })
];
