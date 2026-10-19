const AUDIO_CDN_BASE = "https://cdn.example.com/cdn-upload-final";

function resolveAudioSrc(src) {
  if (!src) return "";
  if (/^https?:\/\//.test(src)) return src;
  if (/^\/assets\/chaoshan\/audio\//.test(src)) {
    const path = String(src).replace(/^\/assets\/chaoshan\/audio\//, "");
    return `${AUDIO_CDN_BASE}/themes/chaoshan-travel/audio/${path}`;
  }
  if (/^\/assets\//.test(src) && !/^\/assets\/audio\//.test(src)) return src;
  if (!AUDIO_CDN_BASE) return src;
  const base = AUDIO_CDN_BASE.replace(/\/$/, "");
  const path = String(src).replace(/^\/assets\/audio\/?/, "").replace(/^\//, "");
  return `${base}/${path}`;
}

function createAudioPlayer(scopeName) {
  const audio = wx.createInnerAudioContext();
  const state = {
    pending: false,
    label: "",
    originalSrc: "",
    fallbackTried: false,
    onEnded: null,
    onError: null,
    completed: true
  };

  function finish(reason, err) {
    const onEnded = state.onEnded;
    const onError = state.onError;
    if (state.completed) return;
    state.completed = true;
    state.pending = false;
    state.onEnded = null;
    state.onError = null;
    if (reason === "error" && onError) onError(err);
    if (onEnded) onEnded(err);
  }

  audio.obeyMuteSwitch = false;
  audio.autoplay = false;

  audio.onCanplay(() => {
    if (!state.pending) return;
    setTimeout(() => {
      audio.play();
    }, 80);
  });

  audio.onPlay(() => {
    state.pending = false;
    console.log(`[${scopeName}] 音频开始播放`, state.label);
  });

  audio.onError((err) => {
    state.pending = false;
    console.log(`[${scopeName}] 音频播放失败`, state.label, err);
    wx.showToast({ title: "音频播放失败", icon: "none" });
    finish("error", err);
  });

  audio.onEnded(() => {
    console.log(`[${scopeName}] 音频播放结束`, state.label);
    finish("ended");
  });

  return {
    play(src, label, options) {
      const opts = options || {};
      if (state.paused && src && src === state.originalSrc) {
        state.pending = false;
        state.completed = false;
        state.paused = false;
        state.label = label || state.label;
        audio.play();
        return;
      }
      if (!state.completed) {
        finish("ended");
      }
      if (!src) {
        state.pending = false;
        state.completed = false;
        state.onEnded = opts.onEnded || null;
        state.onError = opts.onError || null;
        audio.stop();
        console.log(`[${scopeName}] 无可播放音频`, label || "");
        finish("ended");
        return;
      }
      state.pending = true;
      state.label = label || "";
      state.originalSrc = src;
      state.fallbackTried = false;
      state.onEnded = opts.onEnded || null;
      state.onError = opts.onError || null;
      state.completed = false;
      state.paused = false;
      audio.stop();
      audio.src = resolveAudioSrc(src);
      console.log(`[${scopeName}] 准备播放音频`, state.label, audio.src);
      setTimeout(() => {
        if (state.pending) audio.play();
      }, 120);
    },
    stop() {
      state.pending = false;
      state.completed = true;
      state.paused = false;
      state.onEnded = null;
      state.onError = null;
      audio.stop();
      console.log(`[${scopeName}] 主动停止音频`, state.label || "");
    },
    pause() {
      state.pending = false;
      state.paused = true;
      audio.pause();
      console.log(`[${scopeName}] 主动暂停音频`, state.label || "");
    },
    destroy() {
      state.pending = false;
      state.completed = true;
      state.paused = false;
      state.onEnded = null;
      state.onError = null;
      audio.stop();
      audio.destroy();
    }
  };
}

module.exports = {
  createAudioPlayer,
  resolveAudioSrc
};

