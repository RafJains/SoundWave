export default class MaxHeap {
  constructor(cmp=(a,b)=>a-b){
    this.cmp = cmp;
    this.data = [];
  }
  size(){ return this.data.length; }
  push(v){ this.data.push(v); this._siftUp(this.data.length-1); }
  pop(){
    if(this.data.length===0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if(this.data.length>0){ this.data[0]=last; this._siftDown(0); }
    return top;
  }
  _siftUp(i){
    while(i>0){
      const p = Math.floor((i-1)/2);
      if(this.cmp(this.data[i], this.data[p]) <= 0) break;
      [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
      i = p;
    }
  }
  _siftDown(i){
    const n = this.data.length;
    while(true){
      let l = 2*i+1, r = 2*i+2, largest = i;
      if(l<n && this.cmp(this.data[l], this.data[largest]) > 0) largest = l;
      if(r<n && this.cmp(this.data[r], this.data[largest]) > 0) largest = r;
      if(largest===i) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}
