let tiles = [];
let cellSize = 40;
let noiseScale = .005;
let thresh = .5;

let r3  = Math.sqrt(3);

let dirs = [
  [0    , -.50],
  [ r3/4, -.25],
  [ r3/4,  .25],
  [0    ,  .50],
  [-r3/4,  .25],
  [-r3/4, -.25],
];

let verts = [
  [    0, -.50 ],
  [ r3/8, -(.25 + .125)],

  [ r3/4, -.25 ],
  [ r3/4, 0.00 ],
  
  [ r3/4,  .25 ],
  [ r3/8,  .25 + .125],

  [    0,  .50 ],
  [-r3/8,  .25 + .125],

  [-r3/4,  .25 ],
  [-r3/4, 0.00 ],

  [-r3/4, -.25 ],
  [-r3/8, -(.25 + .125)],
];

//           0
//      11        1
// 10                  2
//           1          
//       32     2       
// 9                   3
//       16     4       
//           8          
// 8                   4
//      7         5
//           6

let patterns = {
  "000000" : [],
  "100000" : [0, 1, 11],
  "110000" : [0, 2, 3, 11],
  "101000" : [0, 1, 3, 4, 5, 11],
  "111000" : [0, 2, 4, 5, 11],
  "100100" : [0, 1, 5, 6, 7, 11],
  "101100" : [0, 1, 3, 4, 6, 7, 11],
  "110100" : [0, 1, 5, 6, 8, 9, 11],
  "111100" : [0, 2, 4, 6, 7, 11],
  "101010" : [0, 1, 3, 4, 5, 7, 8, 9, 11],
  "101110" : [0, 1, 3, 4, 6, 8, 9, 11],
  "110110" : [0, 2, 3, 5, 6, 8, 9, 11],
  "111110" : [0, 2, 4, 6, 8, 9, 11],
  "111111" : [0, 2, 4, 6, 8, 10],
}

let shapes = [];

for (let i = 0; i < 64; i++){
  let bits = (i).toString(2);
  bits = bits.split("").reverse().join("");
  bits = bits.padEnd(6, "0");
  for (let j = 0; j < 6; j++){
    let str = [...bits];
    str = str.concat(str.splice(0,j));
    str = str.join("");
    let pat = patterns[str];
    if (pat != undefined){
      let pat2 = [...pat];
      pat2 = pat2.map(v => (v+j*2)%12);
      // shapes[bits] = pat2;
      shapes.push(pat2);
      break;
    }
  }
}

console.log(shapes);

class Tile{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.shape = shapes[0];
    this.n = 0;
  }
  update(){
    let idx = 0;
    for (let i = 0; i < dirs.length; i++){
      let d = dirs[i];
      let x = (d[0]*cellSize+this.x)*noiseScale;
      let y = (d[1]*cellSize+this.y)*noiseScale;
      let n = noise(x, y, frameCount/200);
      if (n < thresh){
        idx |= (1<<i);
      }
    }
    
    this.n = noise(this.x*noiseScale, this.y*noiseScale, frameCount/200)
    
    this.shape = shapes[idx];
  }
  render(){
    push();
    translate(this.x, this.y);
    scale(cellSize);
    fill(this.n*2);
    stroke(this.n*2);
    strokeWeight(1/cellSize);
    beginShape();
    for (let idx of this.shape){
      let v = verts[idx];
      vertex(v[0], v[1]);
    }
    // fill(this.n)
    // for (let i = 0; i < 6; i++){
    //   let v = dirs[i];
    //   vertex(v[0], v[1]);
    // }
    endShape(CLOSE);
    pop();
  }
}

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  strokeJoin(BEVEL);
  windowResized();
}

function init(){
  tiles = [];
  let w = ceil(width/(cellSize*(r3/2)) + 1);
  let h = ceil(height/(cellSize*.75) + 1);
  for (let i = 0; i < w; i++){
    for (let j = 0; j < h; j++){
      let x = (i + (j%2)/2)*cellSize*(r3/2);
      let y = j*cellSize*.75;
      let tile = new Tile(x, y); 
      tiles.push(tile);
    }
  }
}

function draw(){
  background(0);
  tiles.map(t => {
    t.update();
    t.render();
  })
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight); 
  init();
}