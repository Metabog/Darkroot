let turret_frame_sprite
let turret_turret_sprite

let turrets = []

function doTurrets()
{
    for(let t of turrets)
    {
        t.update()
        t.render()
    }
}

class Turret
{
    constructor(x,y)
    {
        this.body = new Body(x,y)
        this.aim_ang = 0.0
        this.health = 100

        this.target_root = null
        this.energy = 0.0

        this.aim_valid = false

        this.shoot_anim = -1.0
        this.shoot_anim_x = 0.0
        this.shoot_anim_y = 0.0

        this.rendery = 240

        wooshes[(int)(random(0,3))].play()

        this.landed = false
    }

    aimAI()
    {
        if(this.rendery>0)
            return

        let bnd = new Rectangle(this.body.x,this.body.y,48,48);
        let results = root_quadtree.query(bnd)
        
        let mindist = 1000.0
        let minthingy = null

        this.target_root = null
        
        if(results!=null)
        {
            for(let r of results)
            {
                let d = dist(this.body.x,this.body.y, r.body.x, r.body.y)
                if(d < mindist)
                {
                    mindist = d
                    this.target_root = r
                }
            }
        }        

        this.aim_valid = false

        if(this.target_root != null)
        {
            //pg.noFill()
            //pg.stroke(255,0,0)
            //pg.strokeWeight(1)
            //pg.rect(this.target_root.body.x, this.target_root.body.y, 16, 16)

            
            //turn turret to aim
            let cx = cos(this.aim_ang);
            let cy = sin(this.aim_ang);
            
            let myposvec = createVector(this.body.x, this.body.y)
            let myvec = createVector(cx,cy)
            let enemyposvec = createVector(this.target_root.body.x, this.target_root.body.y)

            let targetingvec = p5.Vector.sub(enemyposvec,myposvec)

            targetingvec.normalize()
            myvec.normalize()

            this.aim_valid = p5.Vector.dot(targetingvec, myvec)>0.99

            let torque = p5.Vector.cross(myvec,targetingvec)

            this.aim_ang += torque.z*0.15

            //shooting!
            if(this.energy >=1.0 && this.aim_valid)
            {
                this.energy = 0.0

                this.shoot_anim = 1.0
                this.shoot_anim_x = this.target_root.body.x
                this.shoot_anim_y = this.target_root.body.y

                //damage the root node it's targeting instantly I guess
                //this.target_root.life-=0.6

                playSoundSpatial(shootsfx, this.body.x, this.body.y)

                //also push the node away
                if(this.target_root.isrootroot == false && this.target_root != null)
                {
                    //this.target_root.body.vx += targetingvec.x*16.0
                    //this.target_root.body.vy += targetingvec.y*16.0
                        
                    this.target_root.recurseDamageVectorParents(targetingvec.x*3.5,targetingvec.y*3.5,1)
                    this.target_root.recurseDamageVectorChildren(targetingvec.x*3.5,targetingvec.y*3.5,1)
                }
            }

        }
    }

    update()
    {
        this.energy += 0.05*dt
        this.energy = min(this.energy,1.0)

        this.rendery -= 3

        this.rendery = max(this.rendery,0)

        if(!this.landed && this.rendery==0)
        {
            screenshake_amt = 0.7
            lands[(int)(random(0,3))].play()
            this.landed =true
        }
    }

    render()
    {
        pg.image(turret_frame_sprite, this.body.x,this.body.y - this.rendery,BLOCK_SIZE,BLOCK_SIZE)

        let cx = cos(this.aim_ang);
        let cy = sin(this.aim_ang);

        //pg.strokeWeight(4)
        //pg.stroke(90,90,130)
        //pg.line(this.body.x,this.body.y, this.body.x + cx * 10.0, this.body.y + cy * 10.0)

        pg.push()
        pg.translate(this.body.x,this.body.y - this.rendery)
        pg.rotate(this.aim_ang)
        pg.image(turret_turret_sprite, 0,0)
        pg.pop()

        if(this.rendery>0)
        {
            pg.noStroke()
            pg.fill(0,0,0,this.rendery)
            pg.circle(this.body.x,this.body.y,(240-this.rendery)/16)
        }

        if(this.shoot_anim>0.0)
        {
             //draw a line to show we are shooting!
             let lerpanim = 1.0 - this.shoot_anim
             pg.stroke(255,255,90)
             pg.strokeWeight(1)
             pg.line(
             lerp(this.body.x + cx*8, this.shoot_anim_x, lerpanim), 
             lerp(this.body.y + cy*8, this.shoot_anim_y, lerpanim), 
             this.shoot_anim_x, 
             this.shoot_anim_y)
             this.shoot_anim -= 0.2*dt
        }
    }
}