import * as lib from './library.js';
import * as storage from './storage.js';
let state = null;
let audio = null;
let queue = [];
let current = null;
let playing = false;
let callbacks = null;
let tick = null;
function format(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function simTime() {
  if (!audio.__sim) return 0;
  if (!playing) return audio.__sim.offset || 0;
  const elapsed = (Date.now() - audio.__sim.start) / 1000;
  return Math.min(audio.__sim.duration, (audio.__sim.offset || 0) + elapsed);
}
export function initPlayer(appState, opts={}) {
  state = appState;
  callbacks = opts;
  audio = document.getElementById('audio');
  queue = state.queue || [];
  current = state.current || null;
  playing = false;
  if (tick) clearInterval(tick);
  tick = setInterval(() => {
    if (playing && callbacks?.onChange) callbacks.onChange('time');
    const st = getPlayback();
    if (st.currentTime >= st.duration && st.duration > 0) {
      next();
    }
  }, 500);
}
export function getPlayback() {
  const s = lib.getSong(current);
  if (!s) return { songId:null, playing:false, currentTime:0, duration:0 };
  const dur = s.duration || 0;
  const cur = simTime();
  return {
    songId: current,
    playing,
    currentTime: cur,
    duration: dur,
    formattedTime: format(cur),
    formattedDur: format(dur)
  };
}
export function startPlayback(id) {
  const s = lib.getSong(id);
  if (!s) return;
  current = id;
  state.current = id;
  playing = true;
  audio.__sim = {
    offset: 0,
    duration: s.duration || 0,
    start: Date.now()
  };
  pushHistory(id);
  saveState('play');
  callbacks?.onChange('meta');
}
export function togglePlay() {
  if (!current) {
    const list = lib.listSongs();
    if (list.length) startPlayback(list[0].id);
    return;
  }
  if (!audio.__sim) return;
  if (playing) {
    audio.__sim.offset = simTime();
    playing = false;
  } else {
    playing = true;
    audio.__sim.start = Date.now() - audio.__sim.offset * 1000;
  }
  saveState('play');
}
export function setSeek(percent) {
  if (!current) return;
  const s = lib.getSong(current);
  const dur = s.duration || 0;
  const t = Math.round((percent / 100) * dur);
  if (!audio.__sim) {
    audio.__sim = { offset:0, duration:dur, start:Date.now()-(t*1000) };
  }
  audio.__sim.offset = t;
  audio.__sim.start = Date.now() - (t * 1000);
  saveState('time');
}
export function next() {
  if (queue.length) {
    const item = queue.shift();
    state.queue = queue;
    startPlayback(item.songId);
    saveState('queue');
    return;
  }
  const all = lib.listSongs();
  if (!all.length) return;
  let idx = all.findIndex(s => s.id === current);
  idx = (idx + 1) % all.length;
  startPlayback(all[idx].id);
}
export function prev() {
  const all = lib.listSongs();
  if (!all.length) return;
  let idx = all.findIndex(s => s.id === current);
  idx = idx > 0 ? idx - 1 : all.length - 1;
  startPlayback(all[idx].id);
}
export function pushToQueue(id) {
  queue.push({songId:id});
  state.queue = queue;
  saveState('queue');
}
export function removeFromQueue(id) {
  queue = queue.filter(q => q.songId !== id);
  state.queue = queue;
  saveState('queue');
}
export function getQueueItems() {
  return queue.slice();
}
function pushHistory(id) {
  state.history ||= [];
  state.history.unshift({songId:id, at:new Date().toISOString()});
  if (state.history.length > 200) state.history.length = 200;
  saveState('history');
}
function saveState(t) {
  storage.saveState(state);
  callbacks?.onChange(t);
}