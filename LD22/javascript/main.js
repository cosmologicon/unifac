
var screen, HUD, gameplay, statusbox, stage
var dragpos, dragging = false
var mousepos, mousestart, mouset0
var gamejs = require('gamejs')
var Thing = require('./Thing')
var tokens = new Array(), players = new Array(), hazards = new Array()
var selected = [], sindics = []

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
 

// We count it as a click if the mouse has moved less than 20px and mouseup
//   is within 0.25s of mousedown
// I think that this is more reliable than relying on the browser click event? idk i heard that
function handleclick(pos) {
    var gamepos = stage.togamepos(pos)
    var clicked = stage.topcontains(pos)
    if (clicked) {
        if (selected.length == 1 && selected[0] === clicked) {
            applyselection([])
        } else {
            applyselection([clicked])
        }
    } else if (selected.length) {
        var p = (new Thing.Puddle()).attachto(indicators).setstagepos(gamepos)
//        var b = (new Thing.Bolt()).attachto(critters).setstagepos(gamepos)
        for (var j = 0 ; j < selected.length ; ++j) {
            selected[j].target = [gamepos[0], gamepos[1] + 20 * j]
        }
    }
}

function handlemouseup(pos) {
    if (dragging) {
        if (selector) {
            newselected = players.filter(function (p) { return selector.contains(p) })
            applyselection(newselected)
        }
    } else {
        handleclick(pos)
    }
    dragging = false
    dragpos = null
}

function handlemousedown(pos) {
    dragpos = pos
    mousestart = pos
    mouset0 = (new Date()).getTime()
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

function handlekeydown(key, pos) {
    switch (key) {
        case gamejs.event.K_1:
            var gamepos = stage.togamepos(pos)
            var s = (new Thing.Shockwave(0.5, 200)).attachto(indicators).setstagepos(gamepos)
            hazards.push(s)
            break
    }
}

function applyselection(newselected) {
    for (var j in sindics) {
        sindics[j].die()
    }
    sindics = []
    selected = newselected
    for (var j in selected) {
        sindics.push((new Thing.Indicator(selected[j], 20, null, "yellow")).attachto(indicators))
    }
}


var t0 = 0
function think(dt) {
    dt = Math.min(dt * 0.001, 0.1)

    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (screen.getRect().collidePoint(event.pos)) {
                handlemouseup(event.pos)
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
        if (event.type === gamejs.event.KEY_DOWN) {
            handlekeydown(event.key, mousepos)
        }
    })

    if (Math.random() * 5 < dt && tokens.length < 10) {
        var tpos = [Math.random() * 600 - 300, Math.random() * 600 - 300]
        var token = (new Thing.HealToken()).attachto(critters).setstagepos(tpos)
        tokens.push(token)
        var i = (new Thing.Indicator(token, 5, "rgba(0,0,0,0.5)", null)).attachto(indicators)
    }

    selector = null
    if (dragpos && dragging) {
        var p1 = stage.togamepos(mousestart), p2 = stage.togamepos(mousepos)
        statusbox.update([p1, p2])
        selector = (new Thing.Selector()).attachto(indicators).setends(p1, p2)
    }

    // FIXME
    //gameplay.think0(dt)
    critters.think0(dt)
    indicators.think0(dt)
    HUD.think0(dt)

    for (var j in players) {
        players[j].nab(tokens)
    }
    for (var j in hazards) {
        hazards[j].harm(players)
    }

    screen.fill("black")
    gameplay.draw0(screen)
    if (screen.boltage) {
        for (var j = 0 ; j < screen.boltage ; ++j) {
            screen.fill("rgba(255,255,255," + Math.random() + ")")
        }
        screen.boltage = 0
    }
    HUD.draw0(screen)

    if (selector) {
        selector.die()
    }
    
    tokens = tokens.filter(function (t) { return t.parent })
    players = players.filter(function (t) { return t.parent })
    hazards = hazards.filter(function (t) { return t.parent })
    selected = selected.filter(function (t) { return t.parent })


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
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
    indicators = (new Thing.StagedThing()).attachto(stage)
    critters = (new Thing.StagedThing()).attachto(stage)
    players.push((new Thing.Adventurer()).attachto(critters).setstagepos([100,100]))
    players.push((new Thing.Adventurer()).attachto(critters).setstagepos([-100,100]))
    players.push((new Thing.Adventurer()).attachto(critters).setstagepos([100,-100]))
    players.push((new Thing.Adventurer()).attachto(critters).setstagepos([-100,-100]))
    for (var j = 0 ; j < players.length; ++j) {
        (new Thing.Indicator(players[j], 15, "rgba(0,0,0,0.5)", null)).attachto(indicators)
    }

    gamejs.time.fpsCallback(think, null, 10)

}

gamejs.preload(["img/peepers-0.png", "img/noggin-0.png", "img/foots-0.png"])


gamejs.ready(init)

