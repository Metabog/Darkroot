let offscreen_width = 320
let offscreen_height = 240

let wratio
let hratio

function screenToWorldX(x)
{
    return x*wratio + camx
}

function screenToWorldY(y)
{
    return y*hratio + camy
}