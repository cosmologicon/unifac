var settings = {
    // canvas size
    sx: 640,
    sy: 480,
    
    // 3d viewing settings
    H: 2,
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

GameScene.thinkargs = function (dt) {
    var kdown = UFX.key.state().down
    return [dt, kdown]
}

GameScene.think = function (dt, kdown) {
    kdown = kdown || {}
    
    this.t = this.t || 0
    this.t += dt
    
    
    var S = Math.sin(this.t*2), C = Math.cos(this.t*2)
    this.b = [5*C, 0, 5*S]
    this.f = [0, 0, 0]
    this.n = [-S, 0, C]
    
    this.h = plus(this.b, times(this.n, settings.H))
    this.i = normalize(minus(this.f, this.h))
    this.j = normalize(cross(this.n, this.i))
    this.k = cross(this.i, this.j)
}

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


