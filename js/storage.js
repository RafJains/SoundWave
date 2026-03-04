const KEY = "soundwave_state_v2";
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      library: parsed.library || [],
      playlists: parsed.playlists || {
        "__liked__": {
          id: "__liked__",
          name: "Liked Songs",
          songs: [],
          sort: "title"
        }
      },
      history: parsed.history || [],
      queue: parsed.queue || [],
      current: parsed.current || null
    };
  } catch (err) {
    console.error("State load failed:", err);
    return defaultState();
  }
}
export function saveState(state) {
  try {
    const safe = {
      library: state.library || [],
      playlists: state.playlists || {},
      history: state.history || [],
      queue: state.queue || [],
      current: state.current || null
    };
    localStorage.setItem(KEY, JSON.stringify(safe));
  } catch (err) {
    console.error("State save failed:", err);
  }
}
function defaultState() {
  return {
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
}