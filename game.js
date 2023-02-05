let camx = 0
let camy = 0

let screenshake_amt = 0.0
let portalzoom = 0.0

function updateCamera()
{


  screenshake_amt -= 0.06
  screenshake_amt = max(screenshake_amt,0)

  if(portal.win)
  {
    camx = lerp(camx,portal.body.x - offscreen_width/2,0.2)
    camy = lerp(camy,portal.body.y-offscreen_height/2,0.2)
  }
  else
  {
    camx = lerp(camx,player.body.x - offscreen_width/2,0.2)
    camy = lerp(camy,player.body.y-offscreen_height/2,0.2)
  }
}


let mouseClickPrev = false
let mouseJustClicked = false

function updateMouse()
{
    mouseJustClicked = false

    if(mouseIsPressed && !mouseClickPrev)
      mouseJustClicked = true

    mouseClickPrev = mouseIsPressed
}