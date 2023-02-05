let pg;
let pg2;
let tex
let test;
let canvas;

function loadImageBv(path)
{
  let img = loadImage(path);
  return img
}

let t = 0
let rootStart
let xml
let player

let boundary

let rootDeathImage
let rootStartScreen
let rootLore
let winScreen

function preload() {
  setupAudio()
  xml = loadXML('Data/Level/desert_sparse.xml');

  playerSprite=loadImage("Data/Sprites/Ship.png")
  playerDamagedSprite=loadImage("Data/Sprites/ShipDamaged.png")

  turretOutlineSprite=loadImage("Data/Sprites/TurretOutline.png")

  terrainTileImages = []

  terrainTileImages.push(loadImage("Data/Sprites/Tiles/sand1.png"))
  terrainTileImages.push(loadImage("Data/Sprites/Tiles/sand2.png"))
  terrainTileImages.push(loadImage("Data/Sprites/Tiles/sand3.png"))
  terrainTileImages.push(loadImage("Data/Sprites/Tiles/sand4.png"))

  turret_frame_sprite = loadImage("Data/Sprites/TurretFrame16.png")
  turret_turret_sprite = loadImage("Data/Sprites/TurretTurret16.png")

  rootDeathImage = loadImage("Data/Sprites/RootDeath.png")
  rootStartScreen = loadImage("Data/Sprites/RootStartScreen.png")
  rootLore = loadImage("Data/Sprites/Lore.png")

  energySprites.push(loadImage("Data/Sprites/EnergyItem.png"))

  conduitSprites.push(loadImage("Data/Sprites/conduit0.png"))
  conduitSprites.push(loadImage("Data/Sprites/conduit1.png"))

  portalSprites.push(loadImage("Data/Sprites/portal0.png"))
  portalSprites.push(loadImage("Data/Sprites/portal1.png"))

  winScreen = loadImage("Data/Sprites/WinScreen.png")

  font = loadFont("Data/AcPlus_AST_PremiumExec.ttf")
}

function setup() {
  canvas = createCanvas(1280, 960);
  pg = createGraphics(offscreen_width, offscreen_height);
  pg2 = createGraphics(offscreen_width, offscreen_height,WEBGL)
  test = loadImageBv("Data/Sprites/pixel-64x64.png")
  setupShaders()
  pg.noSmooth()
  noSmooth()
  portalzoom = 0.0
  rootContexts = []
  turrets=[]

  t = 0
  screenshake_amt = 0.0

  wratio = offscreen_width/width
  hratio = offscreen_height/height

  //create terrain tilemap
  makeTerrain()

  camx_at_start = player.body.x
  camy_at_start = player.body.y

  //create quadtree for objects like turrets and the player

  boundary = new Rectangle(BLOCK_SIZE*terrain_w*0.5, 
    BLOCK_SIZE*terrain_h*0.5, 
    BLOCK_SIZE*terrain_w*0.5, 
    BLOCK_SIZE*terrain_h*0.5);

    turret_quadtree = new QuadTree(boundary, 4);
    root_quadtree = new QuadTree(boundary, 4);

  game_state = 0
}

let GAME_STATE_INTRO = 0
let GAME_STATE_GAME = 1
let GAME_STATE_DEATH = 2
let GAME_STATE_LORE = 3
let GAME_STATE_WINRAR = 4

let game_state = 0

function doGameState()
{
    if(game_state != GAME_STATE_GAME)
      song.pause()

    if(game_state == GAME_STATE_INTRO)
    {
      //star screen
        background(0,0,0)
        image(rootStartScreen,280,120)
        
        if(keyIsDown(70))
          game_state = GAME_STATE_LORE

        if(mouseJustClicked)
        {
          playMusic()
          game_state = GAME_STATE_GAME
        }
    }
    else if(game_state == GAME_STATE_LORE)
    {
      //death
      background(0)
      image(rootLore,160,120)

      if(mouseJustClicked)
      {
        setup()
        game_state = GAME_STATE_INTRO
      }
    }
    else if(game_state == GAME_STATE_DEATH)
    {
      //death
      background(0)
      image(rootDeathImage,160,120)

      if(mouseJustClicked)
      {
        setup()
        playMusic()
        game_state = GAME_STATE_GAME
      }
    }
    else if(game_state == GAME_STATE_WINRAR)
    {
      //death
      background(0)
      image(winScreen,160,120)

      if(mouseJustClicked)
      {
        setup()
        game_state = GAME_STATE_INTRO
      }
    }
    else
    {
      print(game_state)

      turret_quadtree = new QuadTree(boundary, 4);
      root_quadtree = new QuadTree(boundary, 4);
    
      pg.clear()
      pg.background(142,84,49)
      doCoolVisuals()
    
      pg.push()
      
      //apply camera translation
      //pg.scale(2.0)

      pg.translate(-int(camx),-int(camy),0)
      pg.translate(random(-4,4)*screenshake_amt, random(-4,4)*screenshake_amt)
      
      pg.stroke(255)
        renderTerrain()
    
      doItems()

      updateRoots()
      doTurrets()
    
      player.update()
      player.draw()
    
      for(let t of turrets)
      {
        turret_quadtree.insert(t)
        t.aimAI()
      }
    
      //root_quadtree.debugRender()
    
      //pg.translate(0,0,8)
      pg.pop()
    
      doUI()
    
      //pg2.clear()
      //pg2.background(255,0,0,10)
      //pg2.shader(cloudShader)
      
      cloudShader.setUniform('resolution', [width, height]);
      cloudShader.setUniform('mouse', map(mouseX, 0, width, 0, 7));
      cloudShader.setUniform('time', frameCount * 0.01);
      //pg2.rect(0,0,offscreen_width,offscreen_height)
      //pg.image(pg2,0,0)
    
      imageMode(CORNER)
      image(pg,0,0,width,height)
    
      doCrispUI()

      global_root_tick++
        
      updateCamera()

      rectMode(CORNER)
      fill(255,255,255,portalzoom*255)
      rect(0,0,1280,1000)

      if(portalzoom >1.0)
        game_state = GAME_STATE_WINRAR
    }
}

function draw() {

  doGameState()
  updateMouse()
}