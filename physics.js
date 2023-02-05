let dt = 1.0
let G = 0.05

function getQtreeRectFromWorldRect(x,y,w,h)
{
    return new Rect(x/chunk_size,y/chunk_size, w/chunk_size,h/chunk_size)
}

class Body
{
    //todo: verlet?
    constructor(x,y,w,h,vx,vy)
    {
        this.x=x
        this.y=y
        this.w=w
        this.h=h

        this.vx = vx
        this.vy = vy
        
        this.collidable = true
        this.gravity=true
        this.bounciness = 0.4
        this.damping = 0.9
    }

    setCollidable(collidable)
    {
        this.collidable = collidable
    }

    updatePhysics()
    {
        
        //if(this.gravity)
        //    this.vy += 9.8 * dt * G
        
        this.vy *= pow(this.damping,dt)
        this.vx *= pow(this.damping,dt)

        this.x += this.vx*dt
        this.y += this.vy*dt

        //let collision = this.updatePhysicsCollisions()

        //I should clamp the position so they can't leave the world
        //this.x = constrain(this.x,-world_width*1.5,world_width*1.5)
        //this.y = min(this.y,world_height*1.5)
        //return collision
    }

    updatePhysicsCollisions()
    {
        //first query for all neary blocks
        let queryrect = getQtreeRectFromWorldRect(this.x,this.y,this.w*3.0,this.h*3.0)

        //our actual AABB
        let physrect = getQtreeRectFromWorldRect(this.x,this.y,this.w,this.h)
        q = world.query(queryrect)
        let physics_iter = 4

        let collision = false

        //collision with terrain
        if(q != null && q.length>0)
        for(let i = 0; i<physics_iter; i++)
        {
          for (let square of q) {
    
            if(!square.collidable)
                continue

            let boxrect = new Rect(square.p.x, square.p.y,0.5,0.5)
            
            if(physrect.intersects(boxrect))
            {

              collision = true

              //do collision
              let px1 = (this.x + this.w) - (square.p.x*chunk_size - chunk_size/2)
              let px2 = (square.p.x*chunk_size + chunk_size/2) - (this.x - this.w) 
              let py1 = (this.y + this.h) - (square.p.y*chunk_size - chunk_size/2)
              let py2 = (square.p.y*chunk_size + chunk_size/2) - (this.y - this.h) 
              
              //fix hitching
              let hackx = abs(square.p.x*chunk_size - this.x)
              
              py1 += hackx*0.00001
              
              let min_dir = createVector(0,0)
              let min_sep = 1000000.0
    
              //some derpy collision logic
              if(max(px1,0)<min_sep)
              {
                min_sep = abs(px1)
                min_dir = createVector(-1,0)
              }
              
              if(max(px2,0)<min_sep)
              {
                min_sep = abs(px2)
                min_dir = createVector(1,0)
              }
              
              if(max(py1,0)<min_sep)
              {
                min_sep = abs(py1)
                min_dir = createVector(0,-1)
              }
              
              if(max(py2,0)<min_sep)
              {
                min_sep = abs(py2)
                min_dir = createVector(0,1)
              }
              
              this.x += min_dir.x*min_sep;
              this.y += min_dir.y*min_sep;
              
              if(abs(min_dir.y) == 1.0)
              {
                this.vy *= -this.bounciness
                this.vx *= 0.98
              }
              
              if(abs(min_dir.x) == 1.0)
                this.vx *= -this.bounciness
            }
          }
        }

        return collision
    }

}