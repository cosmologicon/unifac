var settings = {
    // canvas size
    sx: 640,
    sy: 480,
    
    // transition time
    ttime: 0.25,
    
    // stars
    nstars: 200,
    dstar: 8,
    
    // 3d viewing settings
    Hfac: 0.3,
    vantage: 8,
    scale: 560,
    
    // Game time
    gtime: 5,
}

// Cube dimensions
var cdim = {
    C: 0.5,
    D: 0.2,
    G: 0.1,
    L: 0.3,
    B: 0.11,
}

// SETUP
var canvas = document.getElementById("canvas")
canvas.width = settings.sx ; canvas.height = settings.sy
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.key.qup = false
UFX.key.qdown = true
UFX.key.watchlist = "up down left right space".split(" ")
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
function nface(face) {
    var s = face.toString()
    for (var j = 0 ; j < 6 ; ++j) if (faces[j].toString() == s) return j
    return -1
}
var offcolors = "#300 #330 #003 #030 #303 #420".split(" ")
var oncolors = "#F22 #FF3 #22F #0D0 #F0F #F70".split(" ")
function scolor(vec) {
    return vec[0] ? "#555" : vec[1] ? "#666" : "#444"
}
var verts = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
             [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]]
var cpolys = []  // Corner caps
var bpolys = []  // Corner borders
var dpolys = []  // drop edges
var epolys = []  // Edges
var fpolys = []  // faces
faces.forEach(function (f,fj) { verts.forEach(function (v) {
    if (dot(f, v) < 0) return
    var p = times(plus(cross(v, f), minus(v, f)), 0.5)
    var q = times(plus(cross(f, v), minus(v, f)), 0.5)
    function vec(x, y, z) {
        return plus(times(f, z), plus(times(p, x), times(q, y)))
    }
    var cC = 1 - cdim.C, cD = 1 - cdim.D
    var a = vec(cC, cD+cdim.G-cdim.L, cD)
    var b = plus(a, times(f, cdim.G))
    var c = plus(b, times(q, cdim.L))
    var d = times(p, -2*cC)

    cpolys.push([[vec(cC, cC, 1), vec(1, cC, 1), vec(1+cdim.B, 1+cdim.B, 1+cdim.B), vec(1-cC, 1, 1)], f, scolor(f)])
    dpolys.push([[a, b, plus(b, d), plus(a, d)], f, scolor(q)])
    epolys.push([[b, c, plus(c, d), plus(b, d)], f, scolor(f)])

    var br = [vec(cC, cD, cD), vec(cC, cC, cD), vec(cC, cC, 1), vec(cC, 1, 1)]
    bpolys.push([br, f, scolor(p), true])
    bpolys.push([[plus(br[3],d), plus(br[2],d), plus(br[1],d), plus(br[0],d)], f, scolor(p), true])
    
    if (fpolys.length <= fj) {
        fpolys.push([[vec(cD,cD,cD), vec(-cD,cD,cD), vec(-cD,-cD,cD), vec(cD,-cD,cD)], f, "yellow"])
    }
})})


var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.state = [true, false, false, false, false, false]  // lit up faces
    this.score = 1
    this.stime = 0  // Amount of time to zoom in the score
    this.z = 1
    this.htext = 800
    this.tick = settings.gtime

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
    if (this.ttype == "up") {
        var nf = nface(this.currentface)
        this.state[nf] = !this.state[nf]
        this.score += this.state[nf] ? 1 : -1
        this.stime = 0.2
    }
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
    this.h = plus(this.b, times(this.n, 1 + settings.Hfac * settings.vantage))
    this.i = normalize(minus(this.f, this.h))
    this.j = normalize(cross(this.n, this.i))
    this.k = cross(this.i, this.j)
    
    this.stime -= dt

    var f = 1 - Math.exp(-10 * dt)
    var ztarget = this.score * 0.25 + 1
    this.z = Math.exp(Math.log(this.z) * (1-f) + Math.log(ztarget) * f)
    
    this.htext -= (Math.abs(this.htext) < 80 ? 200 : 2000) * dt
    
    this.tick -= dt
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
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    
    var that = this
    UFX.draw("[ t", settings.sx/2, settings.sy/2, "vflip fs white z", this.z, this.z)

    function drawpoly(poly) {
        var ps = poly[0], face = poly[1], color = poly[2], unclose = poly[3]
        if (face0 && face != face0) return
        var sps = []
        ps.forEach(function (p) { sps.push(that.screenpos(p)) })
        if (!that.facing(sps)) return
        UFX.draw("( m", sps[0])
        for (var j = 1 ; j < sps.length ; ++j) UFX.draw("l", sps[j])
        if (!unclose) UFX.draw(")")
        UFX.draw("fs", color, "f ss white lw 0.5 s")
    }
    

    UFX.draw("fs white")
    this.stars.forEach(function (star) {
        if (that.viewward(star)) {
            UFX.draw("b o", that.screenpos(star), 1, "f")
        }
    })

    var face0 = null
    bpolys.forEach(drawpoly)
    var fs = faces.slice(0)
    fs.sort(function comp(a, b) { return dot(a, that.h) - dot(b, that.h) })
    fs.forEach(function (face) {
        if (dot(face, that.i) > -0.01) return
        face0 = face
        var fcol = (that.state[nface(face)] ? oncolors : offcolors)[nface(face)]
        fpolys.forEach(function (poly) { drawpoly([poly[0], poly[1], fcol]) })
        bpolys.forEach(drawpoly)
        dpolys.forEach(drawpoly)
        epolys.forEach(drawpoly)
        cpolys.forEach(drawpoly)
    })

    UFX.draw("]")
    
    context.font = (60 + 10 * this.score) + "px 'Slackey'"
    UFX.draw("[ textalign left textbaseline top fs #840 ss yellow lw", 2 + 0.2 * this.score)
    var s = this.score + "/6"
    context.fillText(s, 10, 0)
    context.strokeText(s, 10, 0)
    if (this.tick > 0) {
        context.font = Math.floor(120 - 10 * this.tick) + "px 'Slackey'"
        s = Math.floor(this.tick) + "." + Math.floor(this.tick * 10) % 10 + "s"
        UFX.draw("textalign right fs #400 ss #F88 lw", 3 - 0.2 * this.tick)
        context.fillText(s, settings.sx - 10, 0)
        context.strokeText(s, settings.sx - 10, 0)
    }
    UFX.draw("]")

    

    if (this.htext > -400) {
        var s = "Light all 6"
        context.font = "100px 'Slackey'"
        UFX.draw("[ textalign center textbaseline middle fs blue ss #AFA lw 2 t", settings.sx/2, settings.sy*0.7)
        UFX.draw("t 0", -this.htext)
        context.fillText(s, 0, 0)
        context.strokeText(s, 0, 0)
        UFX.draw("]")
    }
}


