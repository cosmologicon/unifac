var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.ball = {
        x: 200,
        y: 100,
        vx: 0,
        vy: 0,
        R: mechanics.ballR,
        oldx: 200,
        oldy: 100,
    }
    this.tstill = 0
    
    this.csize = 1
    this.buffer = document.createElement("canvas")
    this.buffercon = this.buffer.getContext("2d")
    this.buffer.width = settings.sx
    this.buffer.height = settings.sy
    
    
    this.level = level1
    this.points = this.level.points()
    this.drawbuffer()
}

GameScene.drawbuffer = function () {
    UFX.draw(this.buffercon, "fs rgb(0,0,20) fr", 0, 0, settings.sx, settings.sy)
    this.level.trace(this.buffercon)
    UFX.draw(this.buffercon, "fs rgb(0,1,100) f")
}

GameScene.thinkargs = function (dt) {
    var clicked = false
    UFX.mouse.events().forEach(function (event) {
        if (event.type === "up") clicked = true
    })
    return [dt, UFX.mouse.pos, clicked]
}
GameScene.think = function (dt, mpos, clicked) {    
        
    this.csize = Math.min(this.csize + mechanics.apgrate * dt, mechanics.amax)
    
    var oldx = this.ball.x, oldy = this.ball.y
    if (this.tstill > 0.5 || this.ball.y > settings.sy + 100) {
        this.ball.x = UFX.random(100, settings.sx - 100)
        this.ball.y = 40
        this.ball.vx = 0
        this.ball.vy = 0
    }
    
    var ball = this.ball
    var x = ball.x, y = ball.y
    var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    var Rplus = 1 + ball.R + 1.2 * dt * v
    var Rplus2 = Rplus * Rplus
    
    var closepoints = this.points.filter(function(p) {
        return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) < Rplus2
    })

    for (var jt = 0 ; jt < 10 ; ++jt) {
        ball.vy += mechanics.g * dt / 10.
        ball.x += ball.vx * dt / 10.
        ball.y += ball.vy * dt / 10.
        
        closepoints.forEach(function (point) {
            var x0 = point[0], y0 = point[1]
            var dx = x0 - ball.x, dy = y0 - ball.y
            if (dx * dx + dy * dy > ball.R * ball.R) return
            if (dx * ball.vx + dy * ball.vy <= 0) return
            var p = -(1 + mechanics.elasticity) * (ball.vx * dx + ball.vy * dy) / (dx * dx + dy * dy)
            ball.vx += p * dx
            ball.vy += p * dy
            var df = ball.R / Math.sqrt(dx * dx + dy * dy) - 1
            if (df > 0) {
                ball.x -= df * dx
                ball.y -= df * dy
            }
        })
    }

    
    var dx = this.ball.x - oldx, dy = this.ball.y - oldy
    if (dx * dx + dy * dy < 0.01) {
        this.tstill += dt
    } else {
        this.tstill = 0
    }


//    UFX.draw("fs blue fr 0 0", settings.sx, settings.sy)
    context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)

    if (mpos) {
        this.buffercon.drawImage(canvas, 0, 0, settings.sx, settings.sy)
        UFX.draw("[ b o", mpos, this.csize, "clip fs black f")
        UFX.draw("t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
//        UFX.draw("t", -mpos[0], 0, "z -1 1 t", mpos[0], 0)
        context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
        UFX.draw("]")
    }
    if (mpos && clicked) {
        var c = this.csize
        this.points.forEach(function (point) {
            var dx = point[0] - mpos[0], dy = point[1] - mpos[1]
            if (dx * dx + dy * dy > c * c) return
            point[0] -= 2 * dx
        })
        var idata = this.buffercon.getImageData(0, 0, settings.sx, settings.sy)
        var data = idata.data
        var n = Math.floor(this.csize / 2) + 10
        for (var j = 0 ; j < n ; ++j) {
            var theta = 2 * Math.PI * j / n
            var x0 = Math.floor(mpos[0] + this.csize * Math.cos(theta) + 0.5)
            var x1 = Math.floor(mpos[0] - this.csize * Math.cos(theta) + 0.5)
            var y = Math.floor(mpos[1] + this.csize * Math.sin(theta) + 0.5)
            var g0 = 0 <= x0 && x0 < settings.sx && data[(settings.sx * y + x0) * 4 + 1]
            var g1 = 0 <= x1 && x1 < settings.sx && data[(settings.sx * y + x1) * 4 + 1]
            if (g0 && !g1) {
                this.points.push([x0, y])
                this.points.push([x1, y])
            }
        }
        this.points = this.points.filter(function (point) { return point[0] >= 0 && point[0] < settings.sx })
        
        this.csize = 1
        this.buffercon.drawImage(canvas, 0, 0, settings.sx, settings.sy)
    }
    if (mpos) {
        UFX.draw("b o", mpos, this.csize, "ss white lw 1 s")
    }
    if (settings.showpoints) {
        UFX.draw("b")
        this.points.forEach(function (point) {
            UFX.draw("o", point[0], point[1], 2)
        })
        UFX.draw("fs red f")
    }    

    UFX.draw("b o", this.ball.x, this.ball.y, this.ball.R, "fs red f ss black lw 1.5 s")
    

}


