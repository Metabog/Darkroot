let energies =[]
let conduits =[]
let portal

let energySprites = []
let conduitSprites = []
let portalSprites = []

let energy_per_particle = 0.15

function doItems()
{
    for(var i = energies.length - 1; i >= 0; i--)
    {
        energies[i].do()
        if(energies[i].alive == false)
        {
            energies.splice(i, 1);
        }
    }

    for(let c of conduits)
    {
        c.do()
    }

    portal.do()
}

class ItemRenderer
{
    constructor(parent, spritesheet)
    {
        this.frame = 0
        this.parent = parent
        this.spritesheet= spritesheet
        this.angle = 0.0
        this.angvel = random(0.03,0.08)

        if(random(0.0,1.0)<0.5)
            this.angvel *= -1
    }

    do()
    {   pg.push()
        pg.translate(this.parent.body.x,this.parent.body.y,30)
        pg.rotate(this.angle)
        pg.image(this.spritesheet[this.frame], 0,0)
        pg.pop()
    }
}

class Energy
{
    constructor(x,y)
    {
        this.body = new Body(x,y,0,0,0.0,0.0)
        this.alive = true
        this.renderer = new ItemRenderer(this,energySprites)
        this.collected = false
    }

    do()
    {
        if(this.alive==false)
            return

        let dx = player.body.x - this.body.x
        let dy = player.body.y - this.body.y

        let d = dist(0.0,0.0,dx,dy)

        if(!this.collected)
        {
            if(d<64 && (1.0 - player.energy) > energy_per_particle)
            {    
                player.energy += energy_per_particle
                this.collected = true


                pickupsounds[(int)(random(0,3))].play()
            }
        }

        if(this.collected)
        {
            this.renderer.angle+=this.renderer.angvel*dt

            dx/=d
            dy/=d

            this.body.vx += dx*0.6*dt
            this.body.vy += dy*0.6*dt

            if(d<16.0)
             this.alive = false;
        }

        this.body.updatePhysics()
        this.renderer.do()
    }
}



class Conduit
{
    constructor(x,y)
    {
        this.body = new Body(x,y,0,0,0.0,0.0)

        this.renderer = new ItemRenderer(this,conduitSprites)
        this.power = 0.0
        this.powered = false
    }

    do()
    {
        this.renderer.do()

        let dx = player.body.x - (this.body.x)
        let dy = player.body.y - (this.body.y - 20)

        let d = dist(0.0,0.0,dx,dy)

        if(this.power>0.0 && this.power<1.0)
        {
            pg.noFill()
            pg.stroke(0)
            pg.rect(this.body.x,this.body.y+42,32,5)

            let pw_w = this.power * 32
            pg.noStroke()
            pg.fill(10,200,20)
            pg.rect(this.body.x-16 + pw_w/2, this.body.y+42,pw_w,4)
        }

        if(d<42)
        {
            if(this.power<1.0)
            {
                pg.stroke(255,255,200)
                pg.strokeWeight(2.0)
                pg.line(
                    player.body.x,player.body.y,
                    this.body.x,this.body.y-20)


                    
                for(let i =0;i<8;i++)
                {
                    let lerpt = (millis()*0.001  + i/8)%1.0

                    let cx = lerp(player.body.x, this.body.x, lerpt)
                    let cy = lerp(player.body.y, this.body.y-20, lerpt)
                    pg.noStroke()
                    pg.fill(255,255,200)
                    pg.circle(cx,cy,3)
                }
            }

            //power up the conduit
            this.power+=0.002
        }

        this.power = min(this.power,1.0)

        if(this.power==1.0)
        {
            pg.stroke(100,255,100)
            pg.strokeWeight(2.0)
            pg.line(
                portal.body.x, portal.body.y,
                this.body.x,this.body.y-20)

            this.renderer.frame = 1

            if(!this.powered)
            {
                powerupsfx.play()
                this.powered = true

                screenshake_amt = 1.0

                player.energy += 0.5
                player.energy = min(player.energy,1.0)
            }
        }
    }
}



class Portal
{
    constructor(x,y)
    {
        this.body = new Body(x,y,0,0,0.0,0.0)

        this.renderer = new ItemRenderer(this,portalSprites)
        this.power = 0.0
        this.win=false
    }

    do()
    {
        this.renderer.do()

        let dx = player.body.x - this.body.x
        let dy = player.body.y - this.body.y

        let d = dist(0.0,0.0,dx,dy)

        if(d<64 && this.power>=1.0)
        {
            if(!this.win)
                winsound.play()
            this.win=true
        }

        //if all the conduits are on, time to power up the portal

        let nconduits_remaining = 0
  
        for(let c of conduits)
        {
            if(c.power<1.0)
                nconduits_remaining++
        }

        if(nconduits_remaining==0)
        {
            this.power += 0.001
        }

        if(this.power>0.0 && this.power<1.0)
        {
            pg.noFill()
            pg.stroke(0)
            pg.rect(this.body.x,this.body.y+42,32,5)

            let pw_w = this.power * 32
            pg.noStroke()
            pg.fill(10,200,20)
            pg.rect(this.body.x-16 + pw_w/2, this.body.y+42,pw_w,4)
        }

        this.power = min(this.power,1.0)

        if(this.power>=1.0)
            this.renderer.frame = 1

        if(this.win)
        {
            portalzoom += 0.01
            screenshake_amt=1.0

            if(random(0.0,1.0)<portalzoom)
            {
                pg.stroke(200,255,200)
                pg.strokeWeight(1.0 + portalzoom*64.0)
                pg.line(this.body.x, this.body.y, this.body.x + random(-64,64), this.body.y + random(-64,64))
            }
        }
    }
}