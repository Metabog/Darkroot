let global_root_tick = 0

let global_cur_recursive_num_ends = 0
let max_ends = 4

let prevx = 0
let prevy = 0

let rootContexts = []

let max_nodes_in_root_context = 32

function createRootContext(x,y,ang)
{
    let newRootContext = new RootContext(x,y,ang)
    rootContexts.push(newRootContext)

    return newRootContext
}

function updateRoots()
{
  for(var i = rootContexts.length - 1; i >= 0; i--)
  {
    rootContexts[i].doStuff()
      if(rootContexts[i].dead)
        rootContexts.splice(i, 1);
  }
}

class RootContext
{
    constructor(x,y,ang=0.0)
    {
       this.rootnode = new RootNode(x,y,x,y,this)
       this.rootnode.isrootroot = true
       this.rootnode.angle = ang
       this.numnodes = 0
       this.done = false
       this.dead = false
    }

    doStuff()
    {
      this.rootnode.recurseNodesIntoQuadtree()

      pg.beginShape()
      this.rootnode.drawRecursive()
      pg.endShape()

      if(global_root_tick % 8 == 0)
      {
          global_cur_recursive_num_ends = 0
          this.rootnode.spreadRecursive()
      }

      let totallife = this.rootnode.evalLife(0.0)
      
      if(totallife==0.0)
      {
        this.dead = true
      }

      //render my actual root start node!
      //pg.noStroke()
      //pg.fill(40,20,20)
      //pg.circle(this.rootnode.body.x,this.rootnode.body.y,8)
    }
}

class RootNode
{
    constructor(x, y, renderx, rendery, mycontext, parent=null, angle =0.0) {
    this.body = new Body(x,y,0,0,0.0,0.0)
    this.body.damping = 0.81

    this.renderx = renderx
    this.rendery = rendery
      
    this.angle = angle
    this.dead = false
    this.life = 1.0

    this.children=[]
    this.parent=parent

    this.mycontext = mycontext

    this.spring_dist_from_my_parent = 0.0
    this.visual_angle = angle

    this.isrootroot = false

    this.energy = 0.0

    this.chaseenergy = random(0.0,1.0)<0.1

    if(parent!= null)
    {
        this.spring_dist_from_my_parent = dist(x,y,parent.body.x,parent.body.y)
    }
  }    
  
  evalLife(lf=0.0)
  {
    lf += this.life

    if(this.children != null && this.children.length>0)
    {
      for(let c of this.children)
      {
        lf = c.evalLife(lf)
      }
    }

    return lf
  }

  recurseDamageVectorParents(vx, vy, idx)
  {
       if(idx>8)
        return

       //if(!this.isrootroot)
       //{
        this.body.vx += vx/(idx+1)
        this.body.vy += vy/(idx+1)
      // }

       if(this.parent != null)
        this.parent.recurseDamageVectorParents(vx,vy,idx+1)
  }

  recurseDamageVectorChildren(vx, vy, idx)
  {
      if(idx>8)
        return

      this.body.vx += vx/(idx+1)
      this.body.vy += vy/(idx+1)

      if(this.children != null && this.children.length>0)
      for(let c of this.children)
      {
        c.recurseDamageVectorChildren(vx,vy,idx+1)
      }
  }

  spreadRecursive()
  {    
      //you have brunched your last brunch
      //time to create a fresh root context
      if(this.mycontext.numnodes>max_nodes_in_root_context)
        return

      if(this.children.length == 0)
      {
          if(!this.dead)
          {
            global_cur_recursive_num_ends++
            
            if(global_cur_recursive_num_ends>max_ends)
            {
              this.dead = true
              return
            }

            //EXPERIMENTAL
            //ALLOW ROOT TO COLLECT ENERGy

            let chase_target = player

            let closest_energy_dist = 1000.0
            let closest_energy = null

            let playerd = dist(this.body.x,this.body.y, player.body.x, player.body.y)

            for(let e of energies)
            {                 
                let d = dist(this.body.x,this.body.y, e.body.x, e.body.y)
                if(this.chaseenergy)
                {

                  if(d<closest_energy_dist)
                  {
                    closest_energy_dist = d
                    closest_energy = e
                  }
                }

                if(d<16.0)
                {
                    const index = energies.indexOf(e);
                    energies.splice(index, 1)
                    this.energy = 1.0

                    playSoundSpatial(rootcollects[(int)(random(0,3))], this.body.x, this.body.y)

                    break;
                }
            }

            if(this.chaseenergy && closest_energy_dist < 256 && closest_energy!=null)
            {
                chase_target = closest_energy
            }

            let chance_to_branch = random(0.0,1.0)>0.7
  
            let playervec = p5.Vector.sub(createVector(chase_target.body.x, chase_target.body.y), 
            createVector(this.body.x, this.body.y))
            playervec.normalize()
          
            let myvec = createVector(cos(this.angle),sin(this.angle))
            
            let torque = p5.Vector.cross(myvec, playervec)
            
            if(this.dead)
              chance_to_branch = false

            this.children = []
            for(let i = 0; i< (chance_to_branch ? 2 : 1); i++)
            {
              
                let ndist = random(2,7) * (1.0+ this.energy*1.5)
                let newx = cos(this.angle)*ndist + this.body.x
                let newy = sin(this.angle)*ndist + this.body.y
                let newang = this.angle + random(-0.9,0.9)
                
                newang += torque.z*0.53

                this.mycontext.numnodes++;

                if(this.mycontext.numnodes>max_nodes_in_root_context)
                {
                    createRootContext(this.body.x, this.body.y, newang).rootnode.energy =this.energy
                    return
                }

                let rnode = new RootNode(newx,newy,this.body.x,this.body.y,this.mycontext, this, newang)
                rnode.energy = this.energy*0.9
                rnode.chaseenergy = this.chaseenergy
                this.children.push(rnode)
            }
          }
                  
      }
      else
      {
        for(let c of this.children)
           c.spreadRecursive();
      }
    
  }
    
  drawRecursive(hasShape=false, progression = 1.0)
  {

    //do "physics"
    this.body.updatePhysics()

    //do spring physics
    if(this.parent != null)
    {
       let current_distance_from_parent = dist(this.body.x, this.body.y, this.parent.body.x, this.parent.body.y)
       let K = 0.4 * (this.spring_dist_from_my_parent - current_distance_from_parent)

       let p1 = createVector(this.body.x, this.body.y)
       let p2 = createVector(this.parent.body.x, this.parent.body.y)

       let vvv = p5.Vector.sub(p1,p2)
       vvv.normalize()

       // I think we need to always make the angle of nodes sort of half way between their parent and next node
       let dx1 = this.body.x - this.parent.body.x
       let dy1 = this.body.y - this.parent.body.y

       if(this.children.length>0)
       {
         let dx2 = this.children[0].body.x - this.body.x
         let dy2 = this.children[0].body.y - this.body.y

         let dx = (dx1 + dx2)/2
         let dy = (dy1 + dy2)/2

         let omfg = createVector(dx,dy)
         omfg.normalize()

         let newang = atan2(dy,dx)
         this.visual_angle = newang
       }

       //let newang = atan2(vvv.y,vvv.x)
       //this.visual_angle = newang

       //let force = vvv.mult(K)
       //this.body.vx += force.x
       //this.body.vy += force.y

    }

    this.life -= 0.001*dt
    this.life = max(this.life,0.0)

    progression = max(progression,0.2)
    pg.noFill()
    pg.strokeWeight(int(2.0 * this.life))
    pg.strokeWeight(1 + this.energy)
    pg.stroke(lerp(40,200,this.energy),lerp(20,10,this.energy),lerp(20,10,this.energy))

    //pg.fill(40,20,20)
    
    let cx = cos(this.visual_angle)
    let cy = sin(this.visual_angle)

    this.renderx = lerp(this.renderx,this.body.x,0.15)
    this.rendery = lerp(this.rendery,this.body.y,0.15)

    let perpx = cy
    let perpy = -cx

    //draw a vertex here
    //pg.vertex(this.renderx - perpx * 3.0 * this.life,
    //   this.rendery - perpy * 3.0 * this.life)
    
    //pg.vertex(this.renderx,
    //   this.rendery)

    //proceed through tree, potentially branching
    for(let c of this.children)
    {
      pg.line(this.renderx,
        this.rendery,
        c.renderx, 
        c.rendery)

      c.drawRecursive(false, progression*0.97)//this.children.length==1, progression+0.03)
    }

    //draw a vertex on the return path
    //pg.vertex(this.renderx + perpx * 3.0 * this.life,
    //   this.rendery + perpy * 3.0 * this.life)

    //pg.vertex(this.renderx,
    //  this.rendery)
  }

  recurseNodesIntoQuadtree()
  {
    root_quadtree.insert(this)
    for(let c of this.children)
    {
       c.recurseNodesIntoQuadtree()
    }
  }
}