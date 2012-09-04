// Flight paths - for invaders to follow

// Path constructors should take a single argument, the entity to apply to.
// This entity should have x, y, and v attributes.

// path.update(dt) should set x, y, vx, and vy on the entity.

var BezierPath = {
    start: function () {
        this.h = 0
        this.alive = true
    },
    
    update: function (dt) {
        var r = gamestate.worldr
        
        var h = this.h, g = 1 - h
        var dxdh = 3*g*g*this.dx0 + 6*h*g*this.dx1 + 3*h*h*this.dx2
        var dydh = 3*g*g*this.dy0 + 6*h*g*this.dy1 + 3*h*h*this.dy2
        var dpdh = Math.sqrt(dxdh*dxdh + dydh*dydh)
        var dhdt = this.obj.v / dpdh
        
        var dh = dhdt * dt
        if (this.h + dh >= 1) {
            dt *= 1 - (1 - this.h) / dh
            dh = 1 - this.h
            this.h = 1
        } else {
            this.h += dh
        }
        h = this.h ; g = 1 - h
        this.obj.y = g*g*g*this.y0 + 3*h*g*g*this.y1 + 3*h*h*g*this.y2 + h*h*h*this.y3
        this.obj.x += dxdh * dh / (this.obj.y + r)
        this.obj.vy = dydh * dhdt   // could be better approximation
        this.obj.vx = dxdh * dhdt
        
        if (this.h == 1) {
            this.makesegment()
            this.start()
            this.update(dt)
        }
    },
}

function SinePath(obj) {
    this.obj = obj
    this.upward = false
    this.alive = true
    this.makesegment()
}
SinePath.prototype = Object.create(BezierPath)
SinePath.prototype.makesegment = function () {
    var dx = 100, dy = this.upward ? 80 : -80
    this.y0 = this.y1 = this.obj.y
    this.y2 = this.y3 = this.obj.y + dy
    this.dy0 = this.y1 - this.y0
    this.dy1 = this.y2 - this.y1
    this.dy2 = this.y3 - this.y2
    this.dx0 = dx
    this.dx1 = -dx
    this.dx2 = dx
    this.upward = !this.upward        
}

function LoopPath(obj) {
    this.obj = obj
    this.jpath = 0
    this.alive = true
    this.makesegment()
}
LoopPath.prototype = Object.create(BezierPath)
LoopPath.prototype.makesegment = function () {
    if (this.jpath == 0) {
        this.dx0 = -60 ; this.dx1 = 0 ; this.dx2 = 60
        this.dy0 = 0 ; this.dy1 = -90 ; this.dy2 = 0
    } else if (this.jpath == 1) {
        this.dx0 = 60 ; this.dx1 = 0 ; this.dx2 = -60
        this.dy0 = 0 ; this.dy1 = 90 ; this.dy2 = 0
    }
    this.y0 = this.obj.y
    this.y1 = this.y0 + this.dy0
    this.y2 = this.y1 + this.dy1
    this.y3 = this.y2 + this.dy2
    this.jpath = (this.jpath + 1) % 2
}

function LevelPath(obj) {
    this.obj = obj
    this.y0 = 5
    this.alive = true
    this.xdir = this.obj.vx > 0 ? 1 : -1
}
LevelPath.prototype = {
    start: function () {
        this.y0 = UFX.random(20, 50)
    },
    update: function (dt) {
//        var dy = this.y0 - this.obj.y
//        var dx = 200
//        var d = Math.sqrt(dx * dx + dy * dy)
//        this.obj.vx = dx * this.obj.v / d
//        this.obj.vy = dy * this.obj.v / d
        console.log(this.obj.vx, this.obj.vy)
        this.obj.vx += 50 * dt * this.xdir
        this.obj.vy += 2 * (this.y0 - this.obj.y) * dt
        var d = Math.sqrt(this.obj.vx * this.obj.vx + this.obj.vy * this.obj.vy)
        this.obj.vx *= this.obj.v / d
        this.obj.vy *= this.obj.v / d
        this.obj.x += (this.obj.vx * dt) / (this.obj.y + gamestate.worldr)
        this.obj.y += this.obj.vy * dt
    },
}


