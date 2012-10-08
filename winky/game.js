var settings = {
    // canvas size
    sx: 640,
    sy: 480,
    
    // transition time
    ttime: 0.2,
    
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



var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.currentface = [1, 0, 0]
    this.nextface = [0, 0, 1]
    this.arrive()
}

GameScene.thinkargs = function (dt) {
    var kdown = UFX.key.state().down
    return [dt, kdown]
}

// Snap to final position, at the end of a transition
GameScene.arrive = function () {
    this.b = times(this.currentface, settings.vantage)
    this.n = this.nextface
    this.f = [0, 0, 0]
    this.ttype = null  // transition type can be left, right, or up
}


GameScene.transition = function (dt) {
    this.tfrac += dt / settings.ttime
    if (this.tfrac >= 1) {
        this.arrive()
    } else if (this.ttype === "up") {
        var S = Math.sin(this.tfrac * Math.PI / 2), C = Math.cos(this.tfrac * Math.PI / 2)
        this.b = plus(times(this.oldface, C * settings.vantage),
                      times(this.currentface, S * settings.vantage))
        this.n = plus(times(this.currentface, C),
                      times(this.nextface, S))
    } else if (this.ttype === "left" || this.ttype === "right") {
        var S = Math.sin(this.tfrac * Math.PI / 2), C = Math.cos(this.tfrac * Math.PI / 2)
        this.n = plus(times(this.oldnext, C),
                      times(this.nextface, S))
    
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

GameScene.draw = function () {
    context.fillStyle = "#222"
    context.fillRect(0, 0, settings.sx, settings.sy)
    
    var ps = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]]
    var that = this
    UFX.draw("[ t", settings.sx/2, settings.sy/2, "vflip fs white")
    ps.forEach(function (p) {
        UFX.draw("b o", that.screenpos(p), "3 f")
    })
    UFX.draw("]")
}


