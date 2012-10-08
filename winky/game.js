var settings = {
    // canvas size
    sx: 640,
    sy: 480,
    
    // transition time
    ttime: 0.25,
    
    
    nstars: 200,
    dstar: 6,
    
    // 3d viewing settings
    H: 1.5,
    vantage: 5,
    scale: 560,
}

// SETUP
var canvas = document.getElementById("canvas")
canvas.width = settings.sx ; canvas.height = settings.sy
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.key.remaparrows()
UFX.key.qup = false
UFX.key.qdown = true
UFX.key.watchlist = "up down left right".split(" ")
UFX.key.init()

function playsound(soundname) {
    if (document.getElementById("playsound").checked) {
        UFX.resource.sounds[soundname].play()
    }
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.resource.onload = function () {
    UFX.scene.push(GameScene)
    UFX.scene.init()
    gamestart()
}
UFX.resource.load({
//    success: "success.ogg",
})

// IMPLEMENTING MY OWN VECTORS. WHAT YOU GOING TO DO ABOUT IT?
function times(v, a) {
    return [a*v[0], a*v[1], a*v[2]]
}
function plus(v, w) {
    return [v[0]+w[0], v[1]+w[1], v[2]+w[2]]
}
function minus(v, w) {
    return [v[0]-w[0], v[1]-w[1], v[2]-w[2]]
}
function dot(v, w) {
    return v[0]*w[0] + v[1]*w[1] + v[2]*w[2]
}
function cross(v, w) {
    return [v[1]*w[2]-v[2]*w[1], v[2]*w[0]-v[0]*w[2], v[0]*w[1]-v[1]*w[0]]
}
function norm(v) {
    return Math.sqrt(dot(v, v))
}
function normalize(v) {
    return times(v, 1./norm(v))
}


// Cube specs
var faces = [[1,0,0],[0,1,0],[0,0,1],[-1,0,0],[0,-1,0],[0,0,-1]]
var fcolors = "red green blue red green blue".split(" ")
var verts = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
             [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]]
var polys = []
faces.forEach(function (f) { verts.forEach(function (v) {
    if (dot(f, v) < 0) return
    var p = times(plus(cross(v, f), minus(v, f)), 0.5)
    var q = times(plus(cross(f, v), minus(v, f)), 0.5)
    console.log(f, v, p, q)
    var C = 0.4
    polys.push([[
        plus(f, plus(times(p, 1-C), times(q, 1-C))),
        plus(f, plus(p, times(q, 1-C))),
        v,
        plus(f, plus(times(p, 1-C), q))
      ], "white"])
})})


var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.currentface = [1, 0, 0]
    this.nextface = [0, 0, 1]
    this.f = [0, 0, 0]  // Always looking at the center of the cube
    this.arrive()
    
    this.stars = []
    for (var j = 0 ; j < settings.nstars ; ++j) {
        var p = UFX.random.rsphere()
        this.stars.push([p[0]*settings.dstar, p[1]*settings.dstar, p[2]*settings.dstar])
    }
}

GameScene.thinkargs = function (dt) {
    var kdown = UFX.key.state().down
    return [dt, kdown]
}

// Snap to final position, at the end of a transition
GameScene.arrive = function () {
    this.b = times(this.currentface, settings.vantage)
    this.n = this.nextface
    this.ttype = null  // transition type can be left, right, or up
}

GameScene.transition = function (dt) {
    this.tfrac += dt / settings.ttime
    var f = Math.pow(this.tfrac, 0.5)
    if (this.tfrac >= 1) {
        this.arrive()
    } else {
        var A = f * Math.PI / 2
        var S = Math.sin(A), C = Math.cos(A)
        switch (this.ttype) {
          case "up":
            this.b = plus(times(this.oldface, C * settings.vantage),
                          times(this.currentface, S * settings.vantage))
            this.n = plus(times(this.currentface, C),
                          times(this.nextface, S))
            break
          case "left": case "right":
            this.n = plus(times(this.oldnext, C),
                          times(this.nextface, S))
        }    
    }
}

GameScene.think = function (dt, kdown) {
    kdown = kdown || {}
    
    if (kdown.up) {
        this.arrive()
        this.ttype = "up"
        this.tfrac = 0
        this.oldface = this.currentface
        this.currentface = this.nextface
        this.nextface = times(this.oldface, -1)
    }
    if (kdown.left) {
        this.arrive()
        this.ttype = "left"
        this.tfrac = 0
        this.oldnext = this.nextface
        this.nextface = cross(this.currentface, this.nextface)
    }
    if (kdown.right) {
        this.arrive()
        this.ttype = "right"
        this.tfrac = 0
        this.oldnext = this.nextface
        this.nextface = cross(this.nextface, this.currentface)
    }
    
    if (this.ttype) {
        this.transition(dt)
    }

    
    // Set up 3d projection matrix
    this.h = plus(this.b, times(this.n, settings.H))
    this.i = normalize(minus(this.f, this.h))
    this.j = normalize(cross(this.n, this.i))
    this.k = cross(this.i, this.j)
}

// Apply 3d projection matrix
GameScene.screenpos = function (p) {
    var a = minus(p, this.h)
    var x = dot(a, this.i), y = dot(a, this.j), z = dot(a, this.k)
    var X = -y/x, Y = z/x
    return [settings.scale * X, settings.scale * Y]
}
GameScene.viewward = function (p) {
    return dot(minus(p, this.h), this.i) > 0
}
// Given screen positions of points of a polygon, is it facing camera?
GameScene.facing = function (ps) {
    var A = 0
    for (var j = 0 ; j < ps.length ; ++j) {
        var k = (j + 1) % ps.length
        A += ps[j][0] * ps[k][1] - ps[j][1] * ps[k][0]
    }
    return A > 0
}

GameScene.draw = function () {
    context.fillStyle = "#222"
    context.fillRect(0, 0, settings.sx, settings.sy)
    
    var that = this
    UFX.draw("[ t", settings.sx/2, settings.sy/2, "vflip fs white")

    function drawpoly(poly) {
        var ps = poly[0], color = poly[1]
        var sps = []
        ps.forEach(function (p) { sps.push(that.screenpos(p)) })
        if (!that.facing(sps)) return
        UFX.draw("( m", sps[0])
        for (var j = 1 ; j < sps.length ; ++j) UFX.draw("l", sps[j])
        UFX.draw(") fs", color, "f ss blue s")
    }
    
    polys.forEach(drawpoly)

    UFX.draw("b")
    this.stars.forEach(function (star) {
        if (that.viewward(star)) {
            UFX.draw("o", that.screenpos(star), 1)
        }
    })
    UFX.draw("fs white f")

    UFX.draw("]")
}


