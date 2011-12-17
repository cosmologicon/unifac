
var screen, HUD, gameplay, statusbox, stage
var dragpos, dragging = false, mousepos, mousestart
var gamejs = require('gamejs')
var Thing = require('./Thing')

var mousedown = false, mousepos = null

/*
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();*/
 

function handleclick(pos) {
    if (!dragging) {
        statusbox.update(stage.togamepos(pos))
        var p = (new Thing.Puddle()).attachto(stage).setstagepos(stage.togamepos(pos))
    }
    dragging = false
    dragpos = null
}

function handlemousedown(pos) {
    dragpos = pos
    mousestart = pos
}
function handlemousemove(pos) {
    if (dragpos) {
        var dx = pos[0] - dragpos[0], dy = pos[1] - dragpos[1]
        if (!dragging) {
            dragging = dx * dx + dy * dy > 20 * 20
        }
        if (dragging) {
//            gameplay.x = Math.max(Math.min(gameplay.x + dx, 0), 0)
//            gameplay.y = Math.max(Math.min(gameplay.y + dy, 0), 480-854)
            dragpos = pos
        }
    }
}

var t0 = 0
function think(dt) {
    dt *= 0.001

    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (screen.getRect().collidePoint(event.pos)) {
                handleclick(event.pos)
            }
//            statusbox.update(event.pos)
        }
        if (event.type === gamejs.event.MOUSE_DOWN) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemousedown(event.pos)
            }
        }
        if (event.type === gamejs.event.MOUSE_MOTION) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemousemove(event.pos)
            } else {
                dragpos = null
            }
            mousepos = event.pos
        }
    })



    var selector = null
    if (dragpos && dragging) {
        var p1 = stage.togamepos(mousestart), p2 = stage.togamepos(mousepos)
        statusbox.update([p1, p2])
        selector = (new Thing.Selector()).attachto(stage).setends(p1, p2)
    }

    gameplay.think0(dt)
    HUD.think0(dt)

    screen.fill("black")
    gameplay.draw0(screen)
    HUD.draw0(screen)

    if (selector) {
        selector.die()
    }

}


function init() {
    gamejs.display.setMode([854, 480])
/*
    backdropimg = new gamejs.Surface([854, 854])
    backdropimg.fill("#000088")
    var circ = new gamejs.Surface([100, 100])
    var carr = new gamejs.surfacearray.SurfaceArray(circ)
    for (var x = 0 ; x < 100 ; ++x) {
        for (var y = 0 ; y < 100 ; ++y) {
            var dx = x - 50, dy = y - 50
            var a = Math.floor(32 * Math.exp(-(dx * dx + dy * dy) / 400))
            carr.set(x, y, [0, 64, 0, a])
        }
    }
    gamejs.surfacearray.blitArray(circ, carr)
    circ = gamejs.transform.scale(circ, [300, 300])
    var rect = circ.getRect()
    for (var j = 0 ; j < 240 ; ++j) {
        var x = Math.random() * 854, y = Math.random() * 854, r = Math.random() * 100
        rect.center = [x, y]
        backdropimg.blit(circ, rect)
    }*/
    

    screen = gamejs.display.getSurface()
//    for (var j in screen) alert(j)
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
//    gameplay.image = backdropimg
//    gameplay.centered = false
//    balls = (new Thing.Thing()).attachto(gameplay)

    gamejs.time.fpsCallback(think, null, 60)

}

gamejs.ready(init)

