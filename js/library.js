let _state = null;
export function initLibrary(state) {
  _state = state;
  if (!_state.library) {
  _state.library = [];
   }
  console.log("Library initialized:", _state.library.length, "songs");
}
export function getAllSongs() {
  if (!_state || !_state.library) return [];
  return _state.library;
}
export function getSong(id) {
  if (!_state || !_state.library) return null;
  return _state.library.find(s => s.id === id) || null;
}
export function addSong(song) {
  if (!_state.library) _state.library = [];
  _state.library.push(song);
}
