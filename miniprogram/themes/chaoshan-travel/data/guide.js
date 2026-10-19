const IMAGE_CDN_BASE = "https://cdn.example.com/cdn-upload-final/themes/chaoshan-travel/home";

module.exports = [
  {
    title: "1. 选择主题开局",
    desc: "首页先切到潮汕游玩记，再设置玩家人数、回合数和胜利目标。每名玩家开局选择一张美食卡作为初始招牌收藏。",
    image: `${IMAGE_CDN_BASE}/guide-theme-start.png`
  },
  {
    title: "2. 沿地图打卡",
    desc: "掷点后沿 30 格棋盘前进，经过起点可获得银两。落到景点格时，可购买、升级或支付游玩费用。",
    image: `${IMAGE_CDN_BASE}/guide-theme-map.png`
  },
  {
    title: "3. 收集美食卡",
    desc: "落到美食卡区域或触发游玩事件时，可抽到不同等级的潮汕美食卡，累计更多收藏与收益能力。",
    image: `${IMAGE_CDN_BASE}/guide-food-card.png`
  },
  {
    title: "4. 景点经营",
    desc: "景点可升级，提高收益和排队热度。其他玩家经过时需要支付游玩费用，也可以选择比拼谁吃得多。",
    image: `${IMAGE_CDN_BASE}/guide-scenic-spot.png`
  }
];
