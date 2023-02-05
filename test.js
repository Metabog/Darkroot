function drawTest()
{
    pg.clear()
  pg.background(100,20,30)
  pg.stroke(255)
  
  pg.beginShape();
  pg.noFill()
  for(let i =0; i<50;i++)
  {
    pg.vertex(i*5-100,cos(i+t)*30)
  }
  pg.endShape();
  
  pg.fill(100)

  pg.push()
  pg.circle(0,0,50)
  pg.translate(0,0,-4)
  pg.pop()
  
  pg.push()
  pg.translate(0,0,10)
  pg.stroke(255,0,0)
  pg.fill(20,50,30)
  pg.rotate(t)
  pg.rect(0,0,30,100)
  pg.pop()

  pg2.push()
  pg2.imageMode(CENTER)
  pg2.translate(0,0)
  pg2.image(test,64,64,64,64)
  pg2.pop()
  
  pg.push()
  pg.translate(0,0,-0.01)
  pg.imageMode(CENTER)
  pg.image(pg2,0,0)
  pg.pop()
}