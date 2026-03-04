<<<<<<< HEAD
# SoundWave
=======
# SOUNDWAVE — Frontend Music App (HTML/CSS/JS)

A single-page, frontend-only music player demonstrating simple UI and explicit data-structure implementations (Trie, Binary Heap, Merge Sort). All data persists to `localStorage`. No external libs.

## Structure

- `index.html` — main fixed-width UI
- `styles.css` — desktop-only styling
- `demo-data.json` — sample 30 songs metadata
- `js/`:
  - `bootstrap.js` — app bootstrap and wiring
  - `storage.js` — localStorage wrapper & state management
  - `library.js` — library model & merge sort wrapper
  - `playlists.js` — playlists model (includes reserved Liked playlist)
  - `player.js` — audio playback, queue interactions
  - `search.js` — trie indexing & live suggestions
  - `ui.js` — DOM bindings
  - `ds/heap.js` — binary max-heap (priority queue)
  - `ds/trie.js` — trie for prefix suggestions
  - `ds/mergeSort.js` — stable merge sort implementation

## Notes

- Liked Songs is a built-in playlist with id `__liked__` — it cannot be deleted (but you can add/remove songs from it).
- Queue uses a max-heap. Recommendations use a scoring function and heap to pick top 10.
- Demo data loader: call `bootstrap.bootstrapDemo()` in console or UI will prompt first-run.
- Keyboard shortcuts: Space = Play/Pause, N = Next, P = Previous.

## How to run

Open `index.html` in a modern browser (Chrome/Edge/Firefox). Allow audio file selection to use local files.

## Persistence

State saved under `soundwave_state_v1` in `localStorage`. Import/Export functions available.

Enjoy!
>>>>>>> d166b75 (Initial commit)
