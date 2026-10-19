module.exports = {
  pieceCount: 4,
  routeSize: 52,
  finalRunwaySize: 6,
  colors: [
    { key: "red", name: "红队", color: "#c9302c" },
    { key: "yellow", name: "黄队", color: "#d49b18" },
    { key: "blue", name: "蓝队", color: "#1c84b7" },
    { key: "green", name: "绿队", color: "#2f9b4f" }
  ],
  startModes: [
    { value: "six", label: "6 起飞", desc: "传统规则，掷到 6 才能从机场起飞。" },
    { value: "six_or_one", label: "6 或 1 起飞", desc: "更宽松，掷到 6 或 1 都可以起飞。" },
    { value: "any", label: "任意点起飞", desc: "新手模式，任意点数都能起飞，掷到 6 仍可再掷。" }
  ],
  collisionModes: [
    { value: "off", label: "不撞机", desc: "轻松模式，同格不把对方送回机场。" },
    { value: "on", label: "撞机", desc: "经典模式，落到对方棋子所在格时，对方棋子返回机场。" }
  ],
  spotModes: [
    { value: "mixed", label: "混合景点", desc: "固定景点格和随机景点事件都会出现。" },
    { value: "fixed", label: "固定景点", desc: "只按棋盘上的固定景点格打卡。" },
    { value: "random", label: "随机景点", desc: "景点只通过事件出现，不要求精确落点。" }
  ],
  introLines: [
    "时空机场已经开放。",
    "每位玩家拥有四架时空飞行器，从自己的机场出发。",
    "掷骰决定起飞和移动，落到同色格可以跳跃，遇到虚线航线可以飞行。",
    "接近终点时必须刚好到达，如果点数超过，就从终点往回倒着走。",
    "沿途会遇到世界历史景点、历史人物卡和飞行棋随机事件。",
    "请把实体棋子放好，由小程序帮你掷骰、提示规则和记录状态。"
  ],
  characterSlots: [
    { id: 1, name: "时空讲堂", position: 8, tier: "T3", desc: "抽取一张历史人物卡，加入当前玩家旅行队。" },
    { id: 2, name: "文明档案馆", position: 21, tier: "T2", desc: "抽取一张历史人物卡，获得一次旅行辅助能力。" },
    { id: 3, name: "世界博物馆", position: 34, tier: "T2", desc: "抽取一张历史人物卡，了解景点背后的文明故事。" },
    { id: 4, name: "时空名人堂", position: 47, tier: "T1", desc: "抽取一张高阶历史人物卡。" }
  ]
};
