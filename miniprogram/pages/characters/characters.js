const backgrounds = require("../../utils/backgrounds");
const gameData = require("../../utils/gameData");
const shareUtil = require("../../utils/share");
const registry = require("../../themes/registry");
const gameStore = require("../../utils/gameStore");
const audioUtil = require("../../utils/audio");

const CHARACTER_INTROS = {
  "刘备": "汉室宗亲，以仁义聚拢人心。适合声望与结盟路线，能让团队在事件结算中获得更稳定的协作空间。",
  "关羽": "忠义名将，武力突出。适合承担攻城、战斗判定与高风险事件，是队伍中最可靠的正面战力。",
  "张飞": "勇猛善战，爆发力强。适合处理战斗事件和压低事件难度，能帮玩家在乱局中强行打开局面。",
  "曹操": "乱世枭雄，智谋与统率极高。适合重抽、择机与资源转换路线，能把不利事件变成新的机会。",
  "孙坚": "江东猛虎，行军与破阵能力均衡。适合快速推进、抢占城池，也能在渡口和关隘类事件中放大收益。",
  "董卓": "权臣入京，威势强横。适合朝堂与控制类事件，但名望较低，使用时要留意声望路线的代价。",
  "吕布": "飞将无双，武力冠绝群雄。适合攻城和战斗爆发，骰子点数越高越容易打出压倒性的战力。",
  "袁绍": "诸侯盟主，名望高、统率稳。适合多人协作与会盟事件，能帮助玩家扩充随从并稳步积累声望。",
  "张角": "太平道首领，擅长民心与术法。适合粮草、民心、黄巾相关事件，能把民间动荡转化为资源优势。",
  "袁术": "淮南豪强，善于经营资源。适合粮草和银两转换路线，能帮助玩家在物资紧张时保持节奏。",
  "公孙瓒": "幽州骑将，白马义从闻名。适合移动加成与快速巡原，能让玩家更容易经过关键城池和事件点。",
  "何进": "外戚大将军，掌握朝堂兵权。适合朝堂事件和声望判定，能给玩家提供一次较稳的辅助修正。",
  "王允": "汉室谋臣，擅长连环布局。适合董卓、朝堂、谋略事件，能用智谋降低难度或改变事件走向。",
  "貂蝉": "闭月之姿，暗藏离间之计。适合控制对手节奏，在战斗前削弱关键角色，属于偏谋略的强力人物。",
  "华雄": "董卓军猛将，关隘叫阵威势极强。适合关隘战斗与防守压制，能让相关事件更有压迫感。",
  "T2级门将": "中立守门武将，负责关隘盘查。适合作为防守型随从，能让经过关隘的判定更有存在感。",
  "黄巾力士": "黄巾军中的基层战力，人数众多。适合黄巾事件与早期战斗压力，能让民变路线更有威胁。",
  "洛阳守卫": "守卫洛阳城门的汉室兵卒。适合主城、城门与防守事件，能为洛阳相关判定提供额外支撑。"
};

function buildCharacterIntro(character) {
  if (character.detail_desc) return character.detail_desc;
  if (character.skill_desc && character.quote_text && (!CHARACTER_INTROS[character.name] || (character.faction && character.faction !== "汉室" && character.faction !== "群雄" && character.faction !== "黄巾" && character.faction !== "江东" && character.faction !== "诸侯" && character.faction !== "董卓军" && character.faction !== "并州"))) {
    return `${character.name} 属于${character.faction}分类，在主题中主要通过${character.skill_name}参与收益、移动或景点经营结算。`;
  }
  return CHARACTER_INTROS[character.name] || `${character.faction}${character.role_type}，在桌游中主要参与${character.skill_name}相关结算。`;
}

Page({
  data: {
    pageBackgroundStyle: "",
    theme: null,
    labels: {},
    activeTier: "全部",
    allCharacters: [],
    characters: [],
    selectedCharacter: null
  },
  onLoad() {
    shareUtil.enableShareMenu();
    backgrounds.apply(this, "characters");
    this.voiceAudio = audioUtil.createAudioPlayer("主题卡片详情");
    this.loadTheme();
    this.loadCharacters();
  },
  onUnload() {
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
      this.voiceAudio = null;
    }
  },
  onShareAppMessage() {
    const theme = this.data.theme || {};
    return shareUtil.buildAppMessage({
      title: `林同学的桌游助手 · 查看${this.data.labels.character || '人物卡'}`,
      path: "/pages/characters/characters"
    });
  },
  onShareTimeline() {
    const theme = this.data.theme || {};
    return shareUtil.buildTimeline({
      title: `林同学的桌游助手 · ${theme.title || ''}${this.data.labels.character || '人物卡'}图鉴`
    });
  },
  loadTheme() {
    const savedGame = gameStore.getGame();
    const theme = registry.getThemeById(savedGame && savedGame.theme_id);
    wx.setNavigationBarTitle({ title: theme.labels.characterPlural || theme.labels.character || "人物卡" });
    this.setData({ theme, labels: theme.labels || {} });
  },
  loadCharacters() {
    const theme = this.data.theme || registry.getThemeById();
    const characters = (gameData.getThemeData(theme.id).characters || []).map((item) => {
      const next = Object.assign({}, item);
      next.preview = next.image_path;
      next.intro_text = buildCharacterIntro(next);
      return next;
    });
    this.setData({ allCharacters: characters }, () => {
      this.applyTierFilter();
    });
  },
  onTierTap(e) {
    const tier = e.currentTarget.dataset.tier || "全部";
    this.setData({ activeTier: tier }, () => {
      this.applyTierFilter();
    });
  },
  applyTierFilter() {
    const tier = this.data.activeTier;
    const allCharacters = this.data.allCharacters || [];
    const characters = tier === "全部"
      ? allCharacters
      : allCharacters.filter((item) => item.tier === tier);
    this.setData({ characters });
  },
  openCharacterDetail(e) {
    const characterId = Number(e.currentTarget.dataset.id || 0);
    const characters = this.data.allCharacters || [];
    const selectedCharacter = characters.find((item) => item.id === characterId);
    if (!selectedCharacter) {
      console.log("[人物卡] 未找到人物详情", { characterId });
      return;
    }
    this.setData({ selectedCharacter });
  },
  closeCharacterDetail() {
    if (this.voiceAudio) this.voiceAudio.stop();
    this.setData({ selectedCharacter: null });
  },
  playCharacterVoice() {
    const selectedCharacter = this.data.selectedCharacter;
    if (!selectedCharacter || !selectedCharacter.sound_path) {
      wx.showToast({ title: `当前${this.data.labels.character || "卡片"}暂无语音`, icon: "none" });
      return;
    }
    this.voiceAudio.play(selectedCharacter.sound_path, `${selectedCharacter.name}详细介绍`);
  },
  pauseCharacterVoice() {
    if (!this.voiceAudio) return;
    this.voiceAudio.pause();
  },
  previewCharacterImage() {
    const selectedCharacter = this.data.selectedCharacter;
    if (!selectedCharacter || !selectedCharacter.image_path) return;
    wx.previewImage({
      current: selectedCharacter.image_path,
      urls: [selectedCharacter.image_path]
    });
  },
  noop() {
  }
});
