import * as storage from './storage.js';
import * as ui from './ui.js';
import * as lib from './library.js';
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Booting app…");
  let state = storage.loadState();
  if (!state || !state.library) {
    state = {
      library: [],
      playlists: {
        "__liked__": {
          id: "__liked__",
          name: "Liked Songs",
          songs: [],
          sort: "title"
        }
      },
      history: [],
      queue: [],
      current: null
    };
    storage.saveState(state);
  }
  if (!state.library.length || state.library.length < 50) {
    console.log("Importing demo-data.json…");
    const r = await fetch("./demo-data.json");
    if (r.ok) {
      const j = await r.json();
      state.library = j.library || state.library;
      state.playlists = state.playlists || {};
      state.history = state.history || [];
      state.queue = state.queue || [];
      state.current = null;
      storage.saveState(state);
      console.log("Demo data imported. Songs:", state.library.length);
    }
  }
  state = storage.loadState();
  console.log("Final State Library:", state.library?.length ?? 0);
  lib.initLibrary(state);
  ui.initUI();
});