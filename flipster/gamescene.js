var GameScene = Object.create(UFX.scene.Scene)

var levelnumber = 0

GameScene.start = function () {
    this.level = levels[levelnumber]
    this.ball = {
        x: this.level.startx,
        y: -mechanics.ballR,
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
    
    this.points = this.level.points()
    this.drawbuffer()
    
    this.mode = "prepare"
    this.preptime = this.level.preptime
}

GameScene.drawbuffer = function () {
    var noisecanvas = document.createElement("canvas")
    var w = settings.sx / 2, h = settings.sy / 2
    noisecanvas.width = w ; noisecanvas.height = h
    var noisecontext = noisecanvas.getContext("2d")
    var idata = noisecontext.createImageData(w, h)
    var data = idata.data
    var ndata = UFX.noise.wrap2d([256, 256])
    UFX.noise.fractalize(ndata, [256, 256], 4)
    for (var y = 0, j = 0, k = 0 ; y < h ; ++y) {
        for (var x = 0 ; x < w ; ++x, ++k, j += 4) {
            var v = ndata[x % 256 + y % 256 * 256]
            data[j] = 20 - 10 * v
            data[j+1] = 1
            data[j+2] = 120 + 80 * v
            data[j+3] = 255
        }
    }
    noisecontext.putImageData(idata, 0, 0)
            

    UFX.draw(this.buffercon, "fs", settings.backcolor, "fr", 0, 0, settings.sx, settings.sy)
    UFX.draw(this.buffercon, "[")
    this.level.trace(this.buffercon)
    UFX.draw(this.buffercon, "clip [ z 2 2")
    this.buffercon.drawImage(noisecanvas, 0, 0)
    UFX.draw(this.buffercon, "] ss white lw 8 s ]")
}

GameScene.thinkargs = function (dt) {
    var clicked = false
    UFX.mouse.events().forEach(function (event) {
        if (event.type === "up") clicked = true
    })
    return [dt, UFX.mouse.pos, clicked]
}
GameScene.think = function (dt, mpos, clicked) {    


    if (this.mode === "prepare") {
        this.csize = Math.min(this.csize + mechanics.apgrate * dt, mechanics.amax)
        this.preptime -= dt
        if (this.preptime < 0) {
            this.mode = "act"
            this.skipclicks = 2
            this.tpool = 0
        }
    } else if (this.mode === "act") {
        var oldx = this.ball.x, oldy = this.ball.y
        if (this.tstill > 0.5 || oldy > settings.sy + 100 || this.skipclicks <= 0) {
            playsound("fail")
            this.start()
            return
        }

        var ball = this.ball
        var x = ball.x, y = ball.y
        var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        var Rplus = 1 + ball.R + 1.2 * dt * v
        var Rplus2 = Rplus * Rplus
        
        var closepoints = this.points.filter(function(p) {
            return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) < Rplus2
        })
        this.tpool += dt

        while (this.tpool > settings.tstep) {
            this.tpool -= settings.tstep
            ball.vy += mechanics.g * settings.tstep
            ball.x += ball.vx * settings.tstep
            ball.y += ball.vy * settings.tstep
            
            closepoints.forEach(function (point) {
                var x0 = point[0], y0 = point[1]
                var dx = x0 - ball.x, dy = y0 - ball.y
                if (dx * dx + dy * dy > ball.R * ball.R) return
                if (dx * ball.vx + dy * ball.vy <= 0) return
                var p = -(1 + mechanics.elasticity) * (ball.vx * dx + ball.vy * dy) / (dx * dx + dy * dy)
                ball.vx += p * dx
                ball.vy += p * dy
                ball.vx *= mechanics.friction
                ball.vy *= mechanics.friction
                var df = ball.R / Math.sqrt(dx * dx + dy * dy) - 1
                if (df > 0) {
                    ball.x -= df * dx
                    ball.y -= df * dy
                }
            })
            if (ball.y > settings.sy - 10 && ball.y < settings.sy &&
                Math.abs(this.level.endx - ball.x) < this.level.goalwidth / 2) {
                playsound("success")
                levelnumber += 1
                if (levelnumber >= levels.length) {
                    alert("you beat the game!")
                    levelnumber = 0
                }
                this.start()
                return
            }
        }

        
        var dx = this.ball.x - oldx, dy = this.ball.y - oldy
        if (dx * dx + dy * dy < 0.01) {
            this.tstill += dt
        } else {
            this.tstill = 0
        }
        if (clicked) this.skipclicks -= 1
    }

//    UFX.draw("fs blue fr 0 0", settings.sx, settings.sy)
    context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)

    if (mpos) {
        // pointing to the timer?
        var dx = settings.sx - 40 - mpos[0], dy = 40 - mpos[1]
        var pointtime = dx * dx + dy * dy < 40 * 40
        // visible aperture?
        var vaper = !pointtime && mpos[0] >= 0 && mpos[0] < settings.sx && mpos[1] >= 0 && mpos[1] < settings.sy
    } else {
        var pointtime = false, vaper = false
    }

    if (this.mode === "prepare" && vaper) {
        this.buffercon.drawImage(canvas, 0, 0, settings.sx, settings.sy)
        UFX.draw("[ b o", mpos, this.csize, "clip fs", settings.backcolor, "f")
        UFX.draw("t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
//        UFX.draw("t", -mpos[0], 0, "z -1 1 t", mpos[0], 0)
        context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
        UFX.draw("]")
        
        if (clicked) {
            var c = this.csize
            this.points.forEach(function (point) {
                var dx = point[0] - mpos[0], dy = point[1] - mpos[1]
                if (dx * dx + dy * dy > c * c) return
                point[0] -= 2 * dx
            })
            var idata = this.buffercon.getImageData(0, 0, settings.sx, settings.sy)
            var data = idata.data
            var n = Math.floor(this.csize * 6.3 / settings.psep) + 10
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
        var x0 = mpos[0], y0 = mpos[1]
        UFX.draw("b o", mpos, this.csize)
        UFX.draw("m", x0, y0 + this.csize + 8, "l", x0, y0 - this.csize - 8)
        UFX.draw("m", x0 - 20, y0, "l", x0 + 20, y0)
        
        UFX.draw("ss white lw 1 s")
    } else if (this.mode === "prepare" && pointtime) {
        if (clicked) {
            this.preptime = 0
        }
        var text = "click to begin", x = settings.sx / 2, y = settings.sy / 2
        context.font = settings.font1
        UFX.draw("b textalign center textbaseline middle fs white ss black lw 1")
        context.fillText(text, x, y)
        context.strokeText(text, x, y)
    }
    
    if (settings.showpoints) {
        UFX.draw("b")
        this.points.forEach(function (point) {
            UFX.draw("o", point[0], point[1], 2)
        })
        UFX.draw("fs red f")
    }
    UFX.draw("b m", this.level.startx, 0, "l", this.level.startx, 40, "ss red lw 5 s")
//    UFX.draw("b m", this.level.endx, settings.sy - 40, "l", this.level.endx, settings.sy, "ss red lw 5 s")
    var x1 = this.level.endx, w = this.level.goalwidth, y = settings.sy
    UFX.draw("b fs red fr", x1 - w/2, y - 20, w, 20)
    
    if (this.mode === "act") {
        UFX.draw("b o", this.ball.x, this.ball.y, this.ball.R, "fs red f ss black lw 1.5 s")
        var text = this.skipclicks == 2 ? "click twice to restart" : "click to restart"
        var x = settings.sx / 2, y = 40
        context.font = settings.font1
        UFX.draw("b textalign center textbaseline middle fs white ss black lw 1")
        context.fillText(text, x, y)
        context.strokeText(text, x, y)
    }
    if (this.mode === "prepare") {
        var text = "" + Math.floor(this.preptime + 1), x = settings.sx - 40, y = 40
        var d = (this.preptime - Math.floor(this.preptime)) * 6.28
        UFX.draw("b o", x, y, 30, "fs rgb(0,128,0) f")
        UFX.draw("( m", x, y, "a", x, y, 30, -1.57, -1.57-d, "fs rgb(128,0,0) ) f")
        UFX.draw("b o", x, y, 30, "m", x, y - 35, "l", x, y + 35, "m", x-35, y, "l", x + 35, y, "ss gray lw 2 s")
        context.font = settings.font1
        UFX.draw("b textalign center textbaseline middle fs white ss black lw 1")
        context.fillText(text, x, y)
        context.strokeText(text, x, y)
    }
    

}


