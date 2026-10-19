const CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/time-travel-flight";

module.exports = [
  {
    title: "传统飞行棋底板",
    desc: "使用线下实体飞行棋棋盘，每名玩家 4 枚棋子。小程序负责掷骰、语音提示、事件和棋子状态记录。",
    image: `${CDN_BASE}/maps/地图.jpg`
  },
  {
    title: "起飞与连续 6",
    desc: "可选择 6 起飞、6 或 1 起飞、任意点起飞。掷到 6 可再掷，连续三个 6 时，未到终点的己方棋子全部返回机场。",
    image: `${CDN_BASE}/home/rule-takeoff.jpg`
  },
  {
    title: "同色跳跃与虚线飞行",
    desc: "保留传统飞行棋的同色格跳跃和虚线航线。玩家线下移动后，在小程序里确认棋子状态即可。",
    image: `${CDN_BASE}/home/rule-route.jpg`
  },
  {
    title: "景点与历史人物",
    desc: "沿途可打卡全球历史景点，抽取关联历史人物卡，获得旅行人气、景点印章和轻量辅助效果。",
    image: `${CDN_BASE}/home/rule-spots.jpg`
  }
];
