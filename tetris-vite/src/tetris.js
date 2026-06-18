const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const SHAPES = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};
const COLORS = { I:'#00f0f0', J:'#0000f0', L:'#f0a000', O:'#f0f000', S:'#00f000', T:'#a000f0', Z:'#f00000' };

function rnd(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

class Piece {
  constructor(shape) {
    this.shape = shape;
    this.matrix = SHAPES[shape].map(r=>r.slice());
    this.x = Math.floor((COLS - this.matrix[0].length)/2);
    this.y = 0;
  }
  rotate(dir=1) {
    // transpose + reverse
    const m = this.matrix;
    const N = m.length;
    const res = Array.from({length: N}, ()=>Array(N).fill(0));
    for (let r=0;r<N;r++) for (let c=0;c<N;c++) res[c][N-1-r]=m[r][c];
    if (dir===-1) return this.matrix = res.reverse();
    this.matrix = res;
  }
}

export default class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = COLS*BLOCK;
    this.canvas.height = ROWS*BLOCK;
    this.ctx = this.canvas.getContext('2d');
    this.board = Array.from({length: ROWS}, ()=>Array(COLS).fill(0));
    this.score = 0;
    this.dropInterval = 500;
    this.dropTimer = 0;
    this.lastTime = 0;
    this.gameOver = false;
    this.spawn();
  }
  spawn() {
    this.piece = new Piece(rnd(Object.keys(SHAPES)));
  }
  valid(posX=this.piece.x, posY=this.piece.y, matrix=this.piece.matrix) {
    for (let r=0;r<matrix.length;r++){
      for (let c=0;c<matrix[r].length;c++){
        if (!matrix[r][c]) continue;
        let x = posX+c, y = posY+r;
        if (x<0||x>=COLS||y>=ROWS) return false;
        if (y>=0 && this.board[y][x]) return false;
      }
    }
    return true;
  }
  merge() {
    const m = this.piece.matrix;
    for (let r=0;r<m.length;r++) for (let c=0;c<m[r].length;c++) if (m[r][c]) {
      let x = this.piece.x+c, y=this.piece.y+r;
      if (y>=0) this.board[y][x]=this.piece.shape;
    }
  }
  clearLines() {
    let lines=0;
    for (let r=ROWS-1;r>=0;r--){
      if (this.board[r].every(v=>v!==0)){
        this.board.splice(r,1);
        this.board.unshift(Array(COLS).fill(0));
        lines++; r++; // recheck same row
      }
    }
    if (lines) this.score += lines*100;
  }
  move(dir){
    if (this.valid(this.piece.x+dir,this.piece.y)) this.piece.x+=dir;
  }
  rotate(dir){
    const old = this.piece.matrix.map(r=>r.slice());
    this.piece.rotate(dir);
    if (!this.valid()) this.piece.matrix = old;
  }
  drop(){
    if (this.valid(this.piece.x,this.piece.y+1)) this.piece.y++;
    else { this.lock(); }
  }
  hardDrop(){
    while(this.valid(this.piece.x,this.piece.y+1)) this.piece.y++;
    this.lock();
  }
  lock(){
    this.merge();
    this.clearLines();
    this.spawn();
    if (!this.valid()) this.gameOver=true;
  }
  start(){
    this.lastTime = performance.now();
    requestAnimationFrame(this.update.bind(this));
  }
  update(time){
    const delta = time - this.lastTime; this.lastTime = time;
    this.dropTimer += delta;
    if (this.dropTimer > this.dropInterval) { this.drop(); this.dropTimer=0; }
    this.draw();
    if (!this.gameOver) requestAnimationFrame(this.update.bind(this));
  }
  draw(){
    this.ctx.fillStyle='#000'; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    // board
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        const v=this.board[r][c];
        if (v){
          this.ctx.fillStyle = COLORS[v];
          this.ctx.fillRect(c*BLOCK,r*BLOCK,BLOCK-1,BLOCK-1);
        }
      }
    }
    // piece
    const m=this.piece.matrix;
    for (let r=0;r<m.length;r++) for (let c=0;c<m[r].length;c++) if (m[r][c]){
      const x=(this.piece.x+c)*BLOCK;
      const y=(this.piece.y+r)*BLOCK;
      this.ctx.fillStyle = COLORS[this.piece.shape];
      this.ctx.fillRect(x,y,BLOCK-1,BLOCK-1);
    }
    // score
    this.ctx.fillStyle='#fff'; this.ctx.font='18px Arial';
    this.ctx.fillText('Score: '+this.score,10,20);
    if (this.gameOver){
      this.ctx.fillStyle='rgba(0,0,0,0.7)'; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      this.ctx.fillStyle='#fff'; this.ctx.font='36px Arial'; this.ctx.textAlign='center';
      this.ctx.fillText('Game Over', this.canvas.width/2, this.canvas.height/2);
    }
  }
}
