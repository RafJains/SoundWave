export class TrieNode {
  constructor(){ this.children = {}; this.ids = new Set(); this.end = false; }
}
export class Trie {
  constructor(){ this.root = new TrieNode(); }
  insert(word, id){
    if(!word) return;
    let node = this.root;
    for(const ch of word){
      if(!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
      node.ids.add(id);
    }
    node.end = true;
  }
  search(prefix){
    let node = this.root;
    for(const ch of prefix){
      node = node.children[ch];
      if(!node) return [];
    }
    return Array.from(node.ids);
  }
}
