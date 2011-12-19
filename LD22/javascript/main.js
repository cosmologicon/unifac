var state = require('./state')
var sound = require('./sound')

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
        } else if (clicked instanceof Thing.Monster && clicked.takesphysical) {
            for (var j in state.selected) {
                state.selected[j].prey = clicked
                sound.play("select-0")
            }
        }
    } else if (state.selected.length) {
        var p = (new Thing.Puddle()).attachto(state.indicators).setstagepos(gamepos)
        for (var j = 0 ; j < state.selected.length ; ++j) {
            // TODO: better crowding algorithm
            var theta = Math.random() * 1000, r = 20 * j
            state.selected[j].target = [gamepos[0] + r * Math.sin(theta), gamepos[1] + r * Math.cos(theta)]
            state.selected[j].casttarget = null
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
        case gamejs.event.K_TAB:
            if (state.players.length) {
                if (state.selected.length == 1) {
                    for (var j = 0 ; j < state.players.length ; ++j) {
                        if (state.selected.indexOf(state.players[j]) != -1) {
                            state.applyselection([state.players[(j+1)%state.players.length]])
                            break
                        }
                    }
                } else {
                    state.applyselection([state.players[0]])
                }
            }
            break
/*        case gamejs.event.K_0:
            state.beatlevel()
            break
        case gamejs.event.K_1:
            var gamepos = state.stage.togamepos(pos)
            var s = (new Thing.Shockwave(0.5, 200)).attachto(state.indicators).setstagepos(gamepos)
            state.hazards.push(s)
            break*/
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
            state.stage.turn(Math.PI / 4)
            break
        case gamejs.event.K_LEFT:
            state.stage.turn(-Math.PI / 4)
            break
/*        case gamejs.event.K_m:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Monster()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_l:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Lump()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_b:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Bomb()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_s:
            var theta = Math.random() * 1000
            var pos = [600 * Math.cos(theta), 600 * Math.sin(theta)]
            var m = (new Thing.Spike()).attachto(state.critters).setstagepos(pos)
            state.monsters.push(m)
            m.castshadow()
            break
        case gamejs.event.K_z:
            var z = (new Thing.Zoltar()).attachto(state.critters).setstagepos([0,0,600])
            state.monsters.push(z)
            z.castshadow()
            break
        case gamejs.event.K_k:
            var b = (new Thing.Birdy()).attachto(state.critters).setstagepos([0,0,100])
            state.monsters.push(b)
            b.castshadow()
            break
        case gamejs.event.K_u:
            var b = (new Thing.Skull()).attachto(state.critters).setstagepos([0,0,600])
            state.monsters.push(b)
            b.castshadow()
            break*/
    }
}

var t0 = 0
function think(dt) {
    dt = Math.min(dt * 0.001, 0.1)
    if (state.currentlevel > 20) {
        titlethink(dt)
    } else if (state.currentlevel > 10) {
        cutthink(dt)
    } else if (state.currentlevel == 10) {
        shopthink(dt)
    } else if (state.currentlevel >= 1) {
        gamethink(dt)
    }
    sound.setvolumes(document.getElementById("sfxvolume").value * 0.1,
                     document.getElementById("musicvolume").value * 0.1)
}


function titlethink(dt) {
    screen.fill("black")
    screen._context.textAlign = "center"
    screen._context.fillStyle = "white"
    screen._context.font = "bold 40px serif"
    screen._context.fillText(state.title, 427, 200)
    screen._context.font = "bold 24px serif"
    screen._context.fillText(state.subtitle, 427, 260)
    if (state.currentlevel != 26) {
        screen._context.font = "16px serif"
        screen._context.fillText("click to continue", 427, 400)
    }
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (state.currentlevel != 26 && screen.getRect().collidePoint(event.pos)) {
                state.loadlevel()
            }
        } else if (event.type === gamejs.event.KEY_DOWN && event.key == gamejs.event.K_BACKSPACE) {
            state.loadlevel(10)
        }
    })
}


// Upgradin stuff....
function shopthink(dt) {
    gamejs.event.get().forEach(function(event) {
        if (event.type === gamejs.event.MOUSE_UP) {
            if (screen.getRect().collidePoint(event.pos)) {
                var button = state.HUD.topcontains(event.pos)
                if (button && button.callback) {
                    button.callback()
                } else {
                    var sprite = state.gameplay.topcontains(event.pos)
                    if (sprite) {
                        state.applyselection([sprite])
                    }
                }
            }
        }
        if (event.type === gamejs.event.KEY_DOWN) {
            if (event.key == gamejs.event.K_0) state.xp += 10
//            handlekeydown(event.key, mousepos)
        }
    })

    state.setshopvisibility()

    state.stage.turn(0.03 * dt)

    state.stage.think(dt)
    state.critters.think0(dt)
    state.indicators.think0(dt)
    state.HUD.think0(dt)
    
//    state.statusbox.update(state.stage.alpha)


    screen.fill("black")
    state.gameplay.draw0(screen)
    state.HUD.draw0(screen)

}



// The gameplay context
function gamethink(dt) {
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


    if (state.tokens.length < 30 && Math.random() < dt) {
        var tpos = function() { return [Math.random() * 600 - 300, Math.random() * 600 - 300] }
        var spawntoken = function(type, amt) {
            var token = (new type(amt)).attachto(state.critters).setstagepos(tpos())
            state.tokens.push(token)
            var i = (new Thing.Indicator(token, 5, "rgba(0,0,0,0.5)", null)).attachto(state.indicators)
        }
        if (state.currentlevel == 1) {
            if (Math.random() * 5 < 1) spawntoken(Thing.HealToken, 3)
        } else if (state.currentlevel == 2) {
            if (Math.random() * 10 < 1) spawntoken(Thing.HealToken, 3)
            if (Math.random() * 10 < 1) spawntoken(Thing.ManaToken, 3)
        } else if (state.currentlevel == 3) {
            if (Math.random() * 20 < 1) spawntoken(Thing.HealToken, 5)
            if (Math.random() * 20 < 1) spawntoken(Thing.ManaToken, 5)
        } else if (state.currentlevel == 4) {
            if (Math.random() * 20 < 1) spawntoken(Thing.HealToken, 10)
            if (Math.random() * 20 < 1) spawntoken(Thing.ManaToken, 10)
        } else if (state.currentlevel == 5) {
            if (Math.random() * 30 < 1) spawntoken(Thing.HealToken, 10)
            if (Math.random() * 30 < 1) spawntoken(Thing.ManaToken, 10)
        }
    }


    var castarea = null
    var selinfo = null
    if (state.selected.length == 1) {
        castarea = state.selected[0].getcastarea().attachto(state.indicators)
        selinfo = state.selected[0].getselinfo().attachto(state.HUD).setpos([0, 0])
    }

    selector = null
    if (dragpos && dragging) {
        var p1 = state.stage.togamepos(mousestart), p2 = state.stage.togamepos(mousepos)
        selector = (new Thing.Selector()).attachto(state.indicators).setends(p1, p2)
    }

    state.gameevents(dt)

    // FIXME
    //state.gameplay.think0(dt)
    state.stage.think(dt)
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
    for (var j in state.mhazards) {
        state.mhazards[j].harm(state.monsters)
    }
    for (var j in state.monsters) {
        state.monsters[j].chooseprey(state.players)
    }
//    state.statusbox.update(state.xp + " XP")


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
    if (selinfo) {
        selinfo.die()
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
//    state.makelayers()
    state.loadlevel()

    gamejs.time.fpsCallback(think, null, 40)

}

// ls -1 img/*.png sound/*.ogg music/*.ogg | sed 's/^/    \"/;s/$/\",/'
gamejs.preload([
    "img/birdy-0.png",
    "img/birdy-1.png",
    "img/birdy-2.png",
    "img/birdy-3.png",
    "img/crystal-0.png",
    "img/dana-0.png",
    "img/foots-0.png",
    "img/lisa-0.png",
    "img/lump-0.png",
    "img/mort-0.png",
    "img/noggin-0.png",
    "img/peepers-0.png",
    "img/rosa-0.png",
    "img/skull-0.png",
    "img/spike-0.png",
    "img/theo-0.png",
    "img/vern-0.png",
    "img/zoltar-0.png",
    "img/zoltar-1.png",
    "music/boss-0.ogg",
    "music/boss-2.ogg",
    "music/cutscene-0.ogg",
    "music/fast-0.ogg",
    "music/happy-0.ogg",
    "music/happy-1.ogg",
    "music/happy-2.ogg",
    "sound/boing-0.ogg",
    "sound/cast-0.ogg",
    "sound/cry-0.ogg",
    "sound/die-0.ogg",
    "sound/ding-0.ogg",
    "sound/klaxon-0.ogg",
    "sound/no-0.ogg",
    "sound/portal-0.ogg",
    "sound/powerup-0.ogg",
    "sound/quake-0.ogg",
    "sound/select-0.ogg",
    "sound/shine-0.ogg",
])


gamejs.ready(init)

