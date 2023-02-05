let playerSprite
let playerDamagedSprite

puffs=[]

class Puff
{

  constructor(x,y)
  {
    this.x = x
    this.y = y
    this.scale = 1
  }
  
  do()
  {
    this.scale-=0.03
    
    pg.fill(255)
    pg.noStroke()
    pg.circle(this.x,this.y,this.scale*7.0)
  }
}

let turretOutlineSprite = null

let lastChargeTextX
let lastChargeTextY
let chargeTextScroll = 1.0

class Player
{
    constructor(x, y) {
      this.body = new Body(x,y,20,20,0.0,0.0)

      this.last_walkable_x = x
      this.last_walkable_y = y
      this.health = 10
      this.energy = 1.0

      this.last_damaged = -1000.0
      this.time_alive = 0.0
      this.restartCountdown = 0

      this.died = false
    }
    
    draw()
    {

        //draw lines to each inactive conduit
        for(let c of conduits)
        {
           if(c.powered == false)
           {
                pg.stroke(0,0,0,50)
                let pv = p5.Vector.sub(createVector(c.body.x,c.body.y), createVector(this.body.x, this.body.y))
                pv.normalize()

                pv.mult(16)
                pg.line(this.body.x + pv.x*0.75, this.body.y + pv.y*0.75, this.body.x + pv.x, this.body.y + pv.y)
           }
        }

        this.time_alive += dt
        let underblock = queryBlockUnderWorldPos(this.body.x,this.body.y)

        if(underblock != null)
        {
          this.last_walkable_x = this.body.x
          this.last_walkable_y = this.body.y
        }
        else
        {
          let vx = this.last_walkable_x - this.body.x
          let vy = this.last_walkable_y - this.body.y

          this.body.vx +=vx*0.01
          this.body.vy +=vy*0.01
        }
          
        //should be 32x32 oops
        pg.imageMode(CENTER)
      
        for(var i = puffs.length - 1; i >= 0; i--)
        {
            puffs[i].do()
            if(puffs[i].scale<0.0)
               puffs.splice(i, 1);
        }
      
        if(this.health>0)
        {
          pg.push()
          pg.translate(this.body.x,this.body.y)
          pg.rotate(atan2(this.body.vx,-this.body.vy))
          pg.image(
             this.time_alive - this.last_damaged < 10 ? playerDamagedSprite : playerSprite,
             0,
             0,
             BLOCK_SIZE,
             BLOCK_SIZE)
          pg.pop()
        }
    }
  
    update()
    {

      chargeTextScroll+=0.02
      
      if(chargeTextScroll<1.0)
        pg.image(noEnergyText, lastChargeTextX,lastChargeTextY-chargeTextScroll*32)

      if(this.health<=0)
      {
        this.restartCountdown+=dt

        if(this.restartCountdown>50)
          game_state = GAME_STATE_DEATH

        return
      }

      let usingEnergy = false

      if(keyIsDown(68))
      {
        this.body.vx += 0.04 + 0.1*this.energy
        usingEnergy = true
      }

      if(keyIsDown(65))
      {
        this.body.vx -= 0.04 + 0.1*this.energy
        usingEnergy = true
      }
      
      if(keyIsDown(87))
      {
        this.body.vy -= 0.04 + 0.1*this.energy
        usingEnergy = true
      }

      if(keyIsDown(83))
      {
        this.body.vy += 0.04 + 0.1*this.energy
        usingEnergy = true
      }

      if(usingEnergy)
      {
        this.energy -= 0.0008*dt
      }
      
      
      this.body.updatePhysics()
      
      if(abs(this.body.vx)>0.5 || abs(this.body.vy)>0.5)
      {
          let pf = new Puff(this.body.x, this.body.y)
          puffs.push(pf)
      }      

      let wx = screenToWorldX(mouseX)
      let wy = screenToWorldY(mouseY)

      let qb = queryBlockUnderWorldPos(wx,wy)

      if(qb != null && qb.has_turret == false)
      { 
        let qx = round(wx/BLOCK_SIZE)*BLOCK_SIZE
        let qy = round(wy/BLOCK_SIZE)*BLOCK_SIZE
        
        if(smooth_turret_outline_qx == smooth_turret_outline_qy == 0.0)
        {
          //smooth_turret_outline_qx = qx
          //smooth_turret_outline_qy = qy
        }


        smooth_turret_outline_qx = lerp(smooth_turret_outline_qx,qx,0.4)
        smooth_turret_outline_qy = lerp(smooth_turret_outline_qy,qy,0.4)

        let energyPerTurret = 0.2

        if(player.energy > energyPerTurret)
        {
          pg.image(turretOutlineSprite,smooth_turret_outline_qx,smooth_turret_outline_qy,BLOCK_SIZE,BLOCK_SIZE)

          if(mouseJustClicked)
          {
            let nTurret = new Turret(qx, qy)
            turrets.push(nTurret)
            qb.has_turret=true
            energyUiGlow = 1.0
            player.energy -= energyPerTurret
          }
        }
        else{

          if(mouseJustClicked)
          {
            lastChargeTextX = wx
            lastChargeTextY = wy
            chargeTextScroll=0.0
            noChargeSfx.play()
          }
        }
      }

      //take damage from root
      let bnd = new Rectangle(this.body.x,this.body.y,8,8);
      let results = root_quadtree.query(bnd)
      if(results!=null)
      {
          for(let r of results)
          {
              //being damaged!
              if(this.time_alive - this.last_damaged >20.0)
              {
                  damagesfx.play()
                  this.last_damaged = this.time_alive
                  this.health--
                  screenshake_amt = 1.0
              }        

              break
          }
      }

      this.energy=max(this.energy,0)
      this.energy=min(this.energy,1.0)

      if(this.health<=0.0 && !this.died)
      {
        explosfx.play()
        this.died=true
      }
    }
}


let smooth_turret_outline_qx = 0.0
let smooth_turret_outline_qy = 0.0