bgParticles = []

let font

class BgParticle
{
  constructor(x ,y)
  {
    this.x=x
    this.y=y
    this.vx = random(0.0,0.2)
    this.vy = random(0.2,1.0)
  }
  
  draw()
  {
    pg.noStroke()
    pg.fill(70,80,100,255)
    pg.rect(this.x,this.y,2,2)
  }
  
  update()
  {
    this.y += this.vy
    this.x -= this.vx
  }
}

let camx_at_start = 0
let camy_at_start = 0

let time_last_particle_added = -1000

let randseq1 = []

let energyUiGlow = 0.0

function doStarLayer(amt,sz,offs)
{
  
  if(randseq1.length == 0)
  {
    for(let i = 0; i<4092; i++)
    {
      let a = random(0.0,1.0)
      randseq1.push(a)
      
    }
  }
  
  let paralx = (camx - camx_at_start)*amt
  let paraly = (camy - camx_at_start)*amt
  
  pg.push()
  pg.translate(-paralx, -paraly)
  pg.noStroke()
  for(let i = 0; i<1024; i++)
  {
    pg.strokeWeight(sz)
    pg.rect(randseq1[i + offs]*offscreen_width*3 - offscreen_width*1.5, 
            randseq1[i+1024 + offs]*offscreen_height*3- offscreen_height*1.5,
           sz*2,sz*2)
    //pg.point(abs(cos(i*24.0 + i*123))*offscreen_width,
    //         abs(sin(i*16.0))*offscreen_height)
    
  }
  pg.pop()
}

let uiFrameSprite = null

let maxEnergy = 1.0

function doEnergyMeter()
{
    let energyheight = 50
    let energyamt = player.energy*50

    pg.rectMode(CENTER)
    pg.fill(lerp(10,255,energyUiGlow),lerp(120,255,energyUiGlow),lerp(10,255,energyUiGlow))
    pg.noStroke()
    pg.rect(291,35 + energyheight/2 - energyamt/2, 4 + energyUiGlow, energyamt);
}

function doUI()
{
    energyUiGlow -= 0.01
    energyUiGlow = max(energyUiGlow,0)

    if(uiFrameSprite==null)
    uiFrameSprite=loadImage("Data/Sprites/UIFrame.png")

    pg.image(uiFrameSprite,0,0,offscreen_width,offscreen_height)

    doEnergyMeter()
}

function doCrispUI()
{
  fill(251,254,207)
  textSize(50)
  textFont(font)

  let nconduits_remaining = 0
  
  for(let c of conduits)
  {
      if(c.power<1.0)
          nconduits_remaining++
  }

  if(nconduits_remaining > 0)
    text("Conduits Remaining: " + nconduits_remaining,700,42)
  else
    text("Portal charging! Return to it to escape!",400,42)
}

function doCoolVisuals()
{

  pg.fill(180,180,200)
  doStarLayer(0.08,2,0)
  doStarLayer(0.01,1,552)

  if(millis()*0.001 - time_last_particle_added > 0.01)
  {
    //let p = new BgParticle(random(0,width*4.0),-height/2)
    //bgParticles.push(p)
    //time_last_particle_added = millis()*0.001
  }
  
  for(var i = bgParticles.length - 1; i >= 0; i--){
    
     bgParticles[i].update()
     bgParticles[i].draw()
    
    if(bgParticles[i].y>height){
        bgParticles.splice(i, 1);
    }
  }
}