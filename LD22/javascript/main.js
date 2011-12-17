var state = require('./state')

var screen
var dragpos, dragging = false
var mousepos, mousestart, mouset0
var gamejs = require('gamejs')
var Thing = require('./Thing')

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
    var gamepos = state.stage.togamepos(pos)
    var clicked = state.stage.topcontains(pos)
    if (clicked) {
        if (state.selected.length == 1 && state.selected[0] === clicked) {
            state.applyselection()
        } else if (clicked instanceof Thing.Adventurer) {
            state.applyselection([clicked])
        } else if (clicked instanceof Thing.Monster) {
            for (var j in state.selected) state.selected[j].prey = clicked
        }
    } else if (state.selected.length) {
        var p = (new Thing.Puddle()).attachto(state.indicators).setstagepos(gamepos)
        for (var j = 0 ; j < state.selected.length ; ++j) {
            // TODO: better crowding algorithm
            state.selected[j].target = [gamepos[0], gamepos[1] + 20 * j]
            state.selected[j].prey = null
        }
    }
}

function handlemouseup(pos) {
    if (dragging) {
        if (selector) {
            newselected = state.players.filter(function (p) { return selector.contains(p) })
            state.applyselection(newselected)
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
            dragpos = pos
        }
    }
}

function handlekeydown(key, pos) {
    switch (key) {
        case gamejs.event.K_1:
            var gamepos = state.stage.togamepos(pos)
            var s = (new Thing.Shockwave(0.5, 200)).attachto(state.indicators).setstagepos(gamepos)
            state.hazards.push(s)
            break
        case gamejs.event.K_a:  // select/deselect all
            if (state.selected.length) {
                state.applyselection()
            } else {
                state.applyselection(state.players)
            }
            break
        case gamejs.event.K_SPACE:  // cast
            if (state.selected.length == 1) {
                state.selected[0].castat(state.stage.togamepos(pos), state.critters, state.indicators)
            }
            break
        case gamejs.event.K_RIGHT:
            state.stage.turn(0.1)
            break
        case gamejs.event.K_LEFT:
            state.stage.turn(-0.1)
            break
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

    if (Math.random() * 5 < dt && state.tokens.length < 10) {
        var tpos = [Math.random() * 600 - 300, Math.random() * 600 - 300]
        var type = [Thing.HealToken, Thing.ManaToken][Math.floor(Math.random() * 2)]
        var token = (new type()).attachto(state.critters).setstagepos(tpos)
        state.tokens.push(token)
        var i = (new Thing.Indicator(token, 5, "rgba(0,0,0,0.5)", null)).attachto(state.indicators)
    }

    var castarea = null
    if (state.selected.length == 1) {
        castarea = state.selected[0].getcastarea().attachto(state.indicators)
    }

    selector = null
    if (dragpos && dragging) {
        var p1 = state.stage.togamepos(mousestart), p2 = state.stage.togamepos(mousepos)
        state.statusbox.update([p1, p2])
        selector = (new Thing.Selector()).attachto(state.indicators).setends(p1, p2)
    }

    // FIXME
    //state.gameplay.think0(dt)
    state.critters.think0(dt)
    state.indicators.think0(dt)
    state.HUD.think0(dt)

    for (var j in state.players) {
        state.players[j].nab(state.tokens)
        state.players[j].considerattacking(state.monsters)
    }
    for (var j in state.hazards) {
        state.hazards[j].harm(state.players)
    }
    for (var j in state.monsters) {
        state.monsters[j].chooseprey(state.players)
    }

    screen.fill("black")
    state.gameplay.draw0(screen)
    if (screen.boltage) {
        for (var j = 0 ; j < screen.boltage ; ++j) {
            screen.fill("rgba(255,255,255," + Math.random() + ")")
        }
        screen.boltage = 0
    }
    state.HUD.draw0(screen)

    if (selector) {
        selector.die()
    }
    if (castarea) {
        castarea.die()
    }

    state.filtergroups()

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
    state.makelayers()


    state.players.push((new Thing.Adventurer()).attachto(state.critters).setstagepos([100,100]))
    state.players.push((new Thing.Adventurer()).attachto(state.critters).setstagepos([-100,100]))
    state.players.push((new Thing.Adventurer()).attachto(state.critters).setstagepos([100,-100]))
    state.players.push((new Thing.Adventurer()).attachto(state.critters).setstagepos([-100,-100]))
    for (var j = 0 ; j < state.players.length; ++j) {
        (new Thing.Indicator(state.players[j], 15, "rgba(0,0,0,0.5)", null)).attachto(state.indicators)
    }
    state.monsters.push((new Thing.Monster()).attachto(state.critters).setstagepos([200, 0]))

    gamejs.time.fpsCallback(think, null, 10)

}

// ls -1 img/*.png | sed 's/^/    \"/;s/$/\",/'
gamejs.preload([
    "img/birdy-0.png",
    "img/birdy-1.png",
    "img/birdy-2.png",
    "img/birdy-3.png",
    "img/foots-0.png",
    "img/lump-0.png",
    "img/noggin-0.png",
    "img/peepers-0.png",
    "img/spike-0.png",
    "img/zoltar-0.png",
])


gamejs.ready(init)

