let turret_quadtree
let root_quadtree

class Rectangle {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  
    contains(point) {
      return (point.body.x >= this.x - this.w &&
        point.body.x < this.x + this.w &&
        point.body.y >= this.y - this.h &&
        point.body.y < this.y + this.h);
    }
  
    intersects(range) {
      return !(range.x - range.w > this.x + this.w ||
        range.x + range.w < this.x - this.w ||
        range.y - range.h > this.y + this.h ||
        range.y + range.h < this.y - this.h);
    }
}
  
class QuadTree {
    constructor(boundary, n) {
      this.boundary = boundary;
      
      this.capacity = n;
      this.points = [];
      this.divided = false;
    }
  
    subdivide() {
      let x = this.boundary.x;
      let y = this.boundary.y;
      let w = this.boundary.w;
      let h = this.boundary.h;
      let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
      this.northeast = new QuadTree(ne, this.capacity);
      let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
      this.northwest = new QuadTree(nw, this.capacity);
      let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
      this.southeast = new QuadTree(se, this.capacity);
      let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
      this.southwest = new QuadTree(sw, this.capacity);
      this.divided = true;
      
      //subdivision involves also pushing all the points in this cell further down
      //the original algorithm I based this off didn't do this but I find this cleaner
      for(let p of this.points)
      {
        if (this.northeast.insert(p)) {
          continue;
        } else if (this.northwest.insert(p)) {
          continue;
        } else if (this.southeast.insert(p)) {
          continue;
        } else if (this.southwest.insert(p)) {
          continue;
        }
      }
      
      this.points = []
    }
  
    insert(point) {
  
      if (!this.boundary.contains(point)) {
        return false;
      }
  
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      } else {
        if (!this.divided) {
          this.subdivide();
        }
        if (this.northeast.insert(point)) {
          return true;
        } else if (this.northwest.insert(point)) {
          return true;
        } else if (this.southeast.insert(point)) {
          return true;
        } else if (this.southwest.insert(point)) {
          return true;
        }
      }
    }
    //return points in range
    query(range, found) {
      if (!found) {
        found = [];
      }
      if (!this.boundary.intersects(range)) {
        return;
      } else {
        for (let p of this.points) {
          if (range.contains(p)) {
            found.push(p);
          }
        }
        if (this.divided) {
          this.northwest.query(range, found);
          this.northeast.query(range, found);
          this.southwest.query(range, found);
          this.southeast.query(range, found);
        }
      }
      return found;
    }

    debugRender() {

        pg.strokeWeight(1)
        pg.rectMode(CENTER)
        pg.noFill()
        pg.stroke(255,255,255,100)
        pg.rect(this.boundary.x,this.boundary.y,this.boundary.w*2,this.boundary.h*2)

        if (this.divided) {
            this.northwest.debugRender();
            this.northeast.debugRender();
            this.southwest.debugRender();
            this.southeast.debugRender();
        }

      }
  }
  