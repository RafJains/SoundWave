import { Trie } from './ds/trie.js';
import MaxHeap from './ds/heap.js';
let trie = new Trie();
export function buildIndex(library){
  trie = new Trie();
  (library || []).forEach(s => {
    if(s.title) trie.insert(s.title.toLowerCase(), s.id);
    if(s.artist) trie.insert(s.artist.toLowerCase(), s.id);
    if(s.album) trie.insert(s.album.toLowerCase(), s.id);
  });
}
export function suggestions(prefix){
  if(!prefix) return [];
  return trie.search(prefix.toLowerCase()).slice(0, 20);
}
export function recommend(library, history, limit = 5){
  if(!history || !history.length) return [];
  const heap = new MaxHeap((a,b)=> a.score - b.score);
  const recent = history.slice(0, 20);
  const scored = {};
  recent.forEach(h => {
    const s = library.find(x => x.id === h.songId);
    if(!s) return;
    library.forEach(o => {
      if(o.id === s.id) return;
      let score = 0;
      if(o.artist && s.artist && o.artist === s.artist) score += 5;
      if(o.album && s.album && o.album === s.album) score += 3;
      if(o.tags && s.tags){
        const common = o.tags.filter(t => s.tags.includes(t));
        score += common.length;
      }
      scored[o.id] = (scored[o.id] || 0) + score;
    });
  });
  Object.entries(scored).forEach(([id, score])=>{
    heap.push({ id, score });
  });
  const res = [];
  while(res.length < limit && heap.size() > 0){
    res.push(heap.pop().id);
  }
  return res;
}
