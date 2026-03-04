import * as storage from './storage.js';
import * as lib from './library.js';
import * as pls from './playlists.js';
import * as player from './player.js';
import * as search from './search.js';
let state;
let curPlaylist = null;
let curSongs = [];
let popupMenu = null;
let popupTargetSongId = null;
let popupTargetPlaylistId = null;
export function initUI(){
  state = storage.loadState();
  pls.initPlaylists(state);
  search.buildIndex(state.library);
  player.initPlayer(state, { onChange: onPlayerChange });
  console.log("UI Initialized - Library:", state.library.length);
  popupMenu = get('playlistMenu');
  get('btnCreatePlaylist').onclick = () => {
    const name = get('newPlaylistName').value.trim();
    if(!name) return;
    pls.createPlaylist(name);
    storage.saveState(state);
    get('newPlaylistName').value = '';
    renderPlaylists();
  };
  get('plSortSelect').onchange = () => {
    if(curPlaylist){
      pls.setSort(curPlaylist, get('plSortSelect').value);
      renderPlaylistDetail(curPlaylist);
    }
  };
  get('searchInput').oninput = (e)=> handleSearch(e.target.value);
  document.addEventListener('click', ()=> popupMenu.classList.add('hidden'));
  get('clearHistory').onclick = () => {
    state.history = [];
    storage.saveState(state);
    renderHistory();
  };
  get('playlistBack').onclick = () => closePlaylistPage();
  get('playBtn').onclick = () => {
  player.togglePlay();
  updateNowPlayingUI();
  };
  get('nextBtn').onclick = () => player.next();
  get('prevBtn').onclick = () => player.prev();
  get('seek').oninput = (e)=> player.setSeek(+e.target.value);
  renderAll();
}
function renderAll(){
  renderLibrary();
  renderPlaylists();
  renderQueue();
  renderHistory();
  renderRecommendations();
  updateNowPlayingUI();
}
function handleSearch(q){
  const box=get('suggestions');
  box.innerHTML='';
  if(!q) return;
  search.suggestions(q).forEach(id=>{
    const s=lib.getSong(id);
    if(!s) return;
    const li=document.createElement('li');
    li.className='song-row';
    li.innerHTML=`<div>
      <div class="song-title">${s.title}</div>
      <div class="song-sub">${s.artist}</div>
    </div>
    <button class="more-btn">⋮</button>`;
    li.onclick = ()=> player.startPlayback(s.id);
    li.querySelector('.more-btn').onclick = (ev)=>{
      ev.stopPropagation();
      openSongMenu(ev, s.id);
    };
    box.append(li);
  });
}
export function renderLibrary() {
  const list = document.getElementById("libraryList");
  if (!list) return;
  list.innerHTML = "";
  const songs = lib.getAllSongs();
  console.log("Rendering Library – total songs:", songs.length);
  if (!songs.length) {
    const empty = document.createElement('p');
    empty.textContent = "No songs in library yet.";
    empty.style.color = "#aaa";
    empty.style.padding = "10px";
    list.appendChild(empty);
    return;
  }
  songs.forEach(song => {
    const li = songRow(song, true);
    list.appendChild(li);
  });
}
function renderPlaylists(){
  const ul = get('playlistsList');
  ul.innerHTML='';
  pls.listPlaylists().forEach(p=>{
    const li=document.createElement('li');
    li.className='song-row';
    li.innerHTML = `
      <div class="song-title">${p.name}</div>
      <div class="playlist-actions-inline">
        <button class="more-btn" data-pl="${p.id}">⋮</button>
        ${p.id !== "__liked__" ? `<button class="del-btn" data-id="${p.id}">❌</button>` : ""}
      </div>`;
    li.onclick = () => showPlaylistPage(p.id);
    li.querySelector('.more-btn').onclick = (ev)=>{
      ev.stopPropagation();
      openPlaylistMenu(ev, p.id);
    };
    const del = li.querySelector('.del-btn');
    if(del) del.onclick = (ev)=>{
      ev.stopPropagation();
      if(confirm("Delete playlist?")){
        pls.deletePlaylist(p.id);
        storage.saveState(state);
        renderPlaylists();
      }
    };
    ul.append(li);
  });
}
function showPlaylistPage(id){
  curPlaylist=id;
  get('playlistPage').classList.remove('hidden');
  get('mainCenter').classList.add('hidden');
  renderPlaylistDetail(id);
}
function closePlaylistPage(){
  curPlaylist = null;
  get('playlistPage').classList.add('hidden');
  get('mainCenter').classList.remove('hidden');
}
function renderPlaylistDetail(id){
  const p = state.playlists[id];
  const ul = get('playlistSongList');
  get('plTitle').textContent = p.name;
  get('plSortSelect').value = p.sort || 'title';
  curSongs = pls.getSortedSongs(id, state.library);
  ul.innerHTML='';
  curSongs.forEach(s=>{
    ul.append(songRow(s, false, id));
  });
}
function songRow(song, allowQueue=true, plID=null){
  const li=document.createElement('li');
  li.className='song-row';
  li.innerHTML=`
    <div>
      <div class="song-title">${song.title}</div>
      <div class="song-sub">${song.artist||''}</div>
    </div>
    <button class="more-btn">⋮</button>`;
  li.onclick = ()=> player.startPlayback(song.id);
  li.querySelector('.more-btn').onclick = (ev)=>{
    ev.stopPropagation();
    openSongMenu(ev, song.id, plID, allowQueue);
  };
  return li;
}
function openSongMenu(e, id, plID=null, allowQueue=true){
  popupMenu.innerHTML='';
  popupMenu.classList.remove('hidden');
  popupMenu.style.left=e.clientX+'px';
  popupMenu.style.top=e.clientY+'px';
  popupTargetSongId=id;
  if(allowQueue)
    addPopup('Add to Queue', ()=> player.pushToQueue(id));
  addPopup('❤️ Add to Liked', ()=>{
    pls.addToLiked(id);
    storage.saveState(state);
    renderPlaylists();
  });
  if(plID && plID !== "__liked__")
    addPopup('Remove from Playlist', ()=>{
      state.playlists[plID].songs =
        state.playlists[plID].songs.filter(x=> x!== id);
      storage.saveState(state);
      renderPlaylistDetail(plID);
    });
  if(player.getQueueItems().some(x=>x.songId===id))
    addPopup('Remove from Queue', ()=>{
      player.removeFromQueue(id);
      renderQueue();
    });
}
function openPlaylistMenu(e, plId){
  popupMenu.innerHTML='';
  popupMenu.classList.remove('hidden');
  popupMenu.style.left=e.clientX+'px';
  popupMenu.style.top=e.clientY+'px';
  popupTargetPlaylistId=plId;
  addPopup('✏️ Rename Playlist', ()=>{
    const name = prompt("New name:");
    if(name){
      pls.renamePlaylist(plId, name);
      storage.saveState(state);
      renderPlaylists();
      renderPlaylistDetail(plId);
    }
  });
}
function addPopup(txt,fn){
  const b=document.createElement('button');
  b.textContent=txt;
  b.onclick=(ev)=>{
    ev.stopPropagation();
    popupMenu.classList.add('hidden');
    fn();
  };
  popupMenu.append(b);
}
function renderQueue(){
  const ul=get('queueList');
  ul.innerHTML='';
  player.getQueueItems().forEach(x=>{
    const s=lib.getSong(x.songId);
    if(s) ul.append(songRow(s,true));
  });
}
function renderHistory(){
  const ul = get('historyList');
ul.innerHTML='';
if (!state.history || !Array.isArray(state.history)) {
  state.history = [];
  storage.saveState(state);
  return; 
}
const history = state.history || [];
history.slice(0,50).forEach(h=>{
  const s = lib.getSong(h.songId);
  if(!s) return;
  const li = document.createElement('li');
  li.className = 'song-row';
  li.innerHTML = `
    <div class="song-title">${s.title}</div>
    <div class="song-sub">${h.at.slice(0,16)}</div>
  `;
  li.onclick = () => player.startPlayback(s.id);
  ul.append(li);
});
}
function renderRecommendations(){
  const ul=get('recsList');
  ul.innerHTML='';
  const recs=search.recommend(state.library,state.history,5);
  recs.forEach(id=>{
    const s=lib.getSong(id);
    if(s) ul.append(songRow(s,true));
  });
}
function updateNowPlayingUI(){
  const st = player.getPlayback();
  const song = lib.getSong(st.songId);
  get('curTime').textContent = st.formattedTime || '0:00';
  get('durTime').textContent = st.formattedDur || '0:00';
  get('seek').value = st.duration ? (st.currentTime/st.duration)*100 : 0;
  get('playBtn').textContent = st.playing ? 'Pause' : 'Play';
  get('nowTitle').textContent = song?.title || 'No track';
  get('nowArtist').textContent = song?.artist || '';
  get('nowAlbum').textContent = song?.album || '';
}
function onPlayerChange(type){
  if(type==='queue') renderQueue();
  if(type==='history') renderHistory();
  renderRecommendations();
  updateNowPlayingUI();
  storage.saveState(state);
}
function get(id){ return document.getElementById(id); }
