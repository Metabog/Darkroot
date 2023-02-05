let BLOCK_TYPE_NONE = 0
let BLOCK_TYPE_TERRAIN = 1
let BLOCK_SIZE = 16

function clamp(a,b,c)
{
  return max(min(a,c-1),b)
}

class Block
{
  constructor(type)
  {
     this.type = type
  }
}

terrain = []

let terrain_w = 64
let terrain_h = 64

let terrainTileImages

let noiseTexture

//check if a block exists at this position
function queryBlockUnderWorldPos(x,y)
{
   let bx = round(x/BLOCK_SIZE)
   let by = round(y/BLOCK_SIZE)

   return queryBlock(bx,by)
}

function makeTerrain()
{
  energies =[]
  conduits =[]
  portal = null

  //init terrain grid
  terrain = new Array(10);

  for (var i = 0; i < terrain_h; i++) {
    terrain[i] = new Array(terrain_h);
  }
    
  let layers = xml.getChildren('layer');
  let tiles =layers[0].getChildren('tile')
  
  for(let t of tiles)
  {
      let x = t.getNum('x')
      let y = t.getNum('y')
      
      if(x<0 || x>=terrain_w)
        continue;
        
      if(y<0 || y>=terrain_h)
        continue;
   
      let type = t.getNum('tile')

      if(type == 1)
        player = new Player(x*BLOCK_SIZE,y*BLOCK_SIZE)

      if(type == 2)
      {
        let e = new Energy(x*BLOCK_SIZE,y*BLOCK_SIZE)
        energies.push(e)
      }

      if(type == 3)
        createRootContext(x*BLOCK_SIZE,y*BLOCK_SIZE)
        
      if(type == 4)
      {
        let c = new Conduit(x*BLOCK_SIZE,y*BLOCK_SIZE)
        conduits.push(c)
      }
      
      if(type == 5)
      {
        portal = new Portal(x*BLOCK_SIZE,y*BLOCK_SIZE)
      }


      terrain[x][y] = new Block(BLOCK_TYPE_TERRAIN);
  }
}

function queryBlock(x,y)
{
  if(x<0 || x>=terrain_w)
        return null;
        
  if(y<0 || y>=terrain_h)
        return null;
  
  return terrain[x][y]
}

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

function renderTerrain()
{
   let startx = (int)(camx/BLOCK_SIZE)
   let starty = (int)(camy/BLOCK_SIZE)
   
   let endx = clamp(startx + 22,0, terrain_w)
   let endy = clamp(starty + 17,0, terrain_h)
   
   startx = clamp(startx,0,terrain_w)
   starty = clamp(starty,0,terrain_h)
   
   pg.noStroke()
   pg.rectMode(CENTER)
   pg.fill(221,182,135)

   for(let x = startx; x < endx; x++)
   for(let y = starty; y < endy; y++)
   {
      if(terrain[x] != null && terrain[x][y]!=null)
      {
        //pg.rect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE)
        pg.imageMode(CENTER)
        pg.image(terrainTileImages[((int)(randseq1[(y*128 + x)%4096] * 4))%terrainTileImages.length],
        x*BLOCK_SIZE,
        y*BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE)

        pg.push()
        pg.translate(0,0,-2)
        pg.noFill()
        pg.stroke(195,118,72)
        pg.strokeWeight(2)
        
        if(queryBlock(x+1,y) == null)
          pg.line(x*BLOCK_SIZE + BLOCK_SIZE/2, y*BLOCK_SIZE - BLOCK_SIZE/2, 
               x*BLOCK_SIZE + BLOCK_SIZE/2, y*BLOCK_SIZE + BLOCK_SIZE/2)
        
        if(queryBlock(x-1,y) == null)
          pg.line(x*BLOCK_SIZE - BLOCK_SIZE/2, y*BLOCK_SIZE - BLOCK_SIZE/2, 
               x*BLOCK_SIZE - BLOCK_SIZE/2, y*BLOCK_SIZE + BLOCK_SIZE/2)
        
        if(queryBlock(x,y-1) == null)
          pg.line(x*BLOCK_SIZE - BLOCK_SIZE/2, y*BLOCK_SIZE - BLOCK_SIZE/2, 
               x*BLOCK_SIZE + BLOCK_SIZE/2, y*BLOCK_SIZE - BLOCK_SIZE/2)
        
        if(queryBlock(x,y+1) == null)
          pg.line(x*BLOCK_SIZE - BLOCK_SIZE/2, y*BLOCK_SIZE + BLOCK_SIZE/2, 
               x*BLOCK_SIZE + BLOCK_SIZE/2, y*BLOCK_SIZE + BLOCK_SIZE/2)
        pg.pop()
        
      }
   }
   
}