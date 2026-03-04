import * as storage from './storage.js';
let state = null;
export function initPlaylists(appState) {
  state = appState;
  state.playlists ||= {
    "__liked__": { id: "__liked__", name: "Liked Songs", songs: [], sort: "title" }
  };
  state.liked ||= [];
}
export function createPlaylist(name) {
  const id = "pl" + Date.now().toString(36);
  state.playlists[id] = { id, name, songs: [], sort: "title" };
  storage.saveState(state);
  return state.playlists[id];
}
export function listPlaylists() {
  return Object.values(state.playlists);
}
export function addSongToPlaylist(plId, songId) {
  const pl = state.playlists[plId];
  if (!pl) return;
  if (!pl.songs.includes(songId)) pl.songs.push(songId);
  storage.saveState(state);
}
export function renamePlaylist(plId, name) {
  const pl = state.playlists[plId];
  if (!pl) return;
  pl.name = name.trim();
  storage.saveState(state);
}
export function deletePlaylist(plId) {
  if (!state.playlists[plId]) return;
  if (plId === "__liked__") return;
  delete state.playlists[plId];
  storage.saveState(state);
}
export function setSort(plId, type) {
  const pl = state.playlists[plId];
  if (!pl) return;
  pl.sort = type;
  storage.saveState(state);
}
export function getSortedSongs(plId, library) {
  const pl = state.playlists[plId];
  if (!pl) return [];
  let arr = pl.songs.map(id => library.find(x => x.id === id)).filter(Boolean);
  switch (pl.sort) {
    case "artist":
      return arr.sort((a, b) => (a.artist || "").localeCompare(b.artist || ""));
    case "recent":
      return arr.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    default:
      return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }
}
export function addToLiked(songId) {
  const liked = state.playlists["__liked__"];
  if (!liked.songs.includes(songId)) liked.songs.push(songId);
  storage.saveState(state);
}
export function removeFromLiked(songId) {
  const liked = state.playlists["__liked__"];
  liked.songs = liked.songs.filter(x => x !== songId);
  storage.saveState(state);
}
