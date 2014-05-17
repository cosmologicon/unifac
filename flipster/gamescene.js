var GameScene = UFX.scenes.game = {}

var levelnumber = 0

GameScene.start = function () {
    this.level = levels[levelnumber]
    this.balls = []
    this.addball(this.level.startx, -mechanics.ballR, mechanics.ballR)
    this.setblocks()
    
    this.mode = "prepare"
    this.preptime = this.level.preptime
    
    this.titlex = 1000
    this.fadealpha = 1
    this.winmode = levelnumber === levels.length - 1
    this.tpool = 0
    this.skipclicks = 2
    this.csize = 1
    this.nexttick = 3
    
    this.playback = null
    if (settings.savewalkthrough) {
        if (this.winmode) {
            window.location = "data:text/plain,var walkthrough = " + JSON.stringify(walkthrough)
        } else {
            this.recorder = UFX.Recorder()
        }
    }
}

GameScene.addball = function (x, y, R) {
    this.balls.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        R: R,
        oldx: x,
        oldy: y,
        omega: 1,
        theta: 3.5,
        tstill: 0,
        alive: true,
    })
}

GameScene.setblocks = function () {
    this.points = this.level.points()
    this.drawbuffer()
}


GameScene.drawbuffer = function () {
    UFX.random.seed = levelnumber * 14045
    var noisecanvas = document.createElement("canvas")
    var w = settings.sx / 2, h = settings.sy / 2
    noisecanvas.width = w ; noisecanvas.height = h
    var noisecontext = noisecanvas.getContext("2d")
    var idata = noisecontext.createImageData(w, h)
    var data = idata.data
    var ndata = UFX.noise.wrap2d([256, 256])
    for (var j = 0 ; j < ndata.length ; ++j) ndata[j] = Math.sin(20 * ndata[j])
//    UFX.noise.fractalize(ndata, [256, 256], 2)
    var r0 = UFX.random(30, 50), g0 = UFX.random(40, 80), b0 = UFX.random(80, 160)
    var dr = UFX.random(-40, 40), dg = UFX.random(-60, 60), db = UFX.random(70, 100)
    for (var y = 0, j = 0, k = 0 ; y < h ; ++y) {
        for (var x = 0 ; x < w ; ++x, ++k, j += 4) {
            var v = ndata[x % 256 + y % 256 * 256]
            data[j] = r0 + dr * v
            data[j+1] = g0 + dg * v
            data[j+2] = b0 + db * v
            data[j+3] = 255
        }
    }
    noisecontext.putImageData(idata, 0, 0)

    this.backdrop = document.createElement("canvas")
    this.backcon = this.backdrop.getContext("2d")
    this.backdrop.width = settings.sx
    this.backdrop.height = settings.sy
    var grad = context.createLinearGradient(0, 0, settings.sx, settings.sy)
    var color0 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    var color1 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    var color2 = "rgb(" + UFX.random.rand(40) + "," + UFX.random.rand(80) + "," + UFX.random.rand(120) + ")"
    grad.addColorStop(0, color0)
    grad.addColorStop(0.5, color1)
    grad.addColorStop(1, color2)
    this.backgrad = grad
    UFX.draw(this.backcon, "fs", grad, "fr 0 0", settings.sx, settings.sy)
    this.backtheta = 0

    this.buffer = document.createElement("canvas")
    this.buffercon = this.buffer.getContext("2d")
    this.buffer.width = settings.sx
    this.buffer.height = settings.sy

    UFX.draw(this.buffercon, "fs rgba(0,0,0,0) fr", 0, 0, settings.sx, settings.sy)
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
    var mpos = UFX.mouse.pos && [UFX.mouse.pos[0], UFX.mouse.pos[1]]
    var kdown = UFX.key.state().down
    if (!settings.DEBUG) kdown = false
    return [dt, mpos, clicked, kdown]
}
GameScene.think = function (dt, mpos, clicked, kdown) {
    if (!dt) return
    if (this.playback) {
        var args = this.thinkargs(0)
        if (args[2] || (args[3] && args[3].F3)) {
            this.playback.stop()
            this.playback = null
            this.start()
            return
        }
    }
    if (kdown && kdown.F1) {
        levelnumber = Math.max(0, levelnumber - 1)
        this.start()
        return
    } else if (kdown && kdown.F2) {
        levelnumber = Math.min(levelnumber + 1, levels.length - 1)
        this.start()
        return
    } else if (kdown && kdown.F3) {
        if (walkthrough[levelnumber]) {
            this.start()
            this.playback = UFX.Playback(walkthrough[levelnumber])
            this.playback.playraw()
            return
        }
    }


    if (this.winmode || this.mode === "prepare") {
        this.csize = Math.min(this.csize + mechanics.apgrate * dt, mechanics.amax)
        this.preptime -= dt
        if (this.winmode && this.preptime < 1) this.preptime += 10
        if (this.preptime < 0) {
            this.mode = "act"
            this.skipclicks = 2
        } else if (this.preptime < this.nexttick) {
            playsound("tick")
            this.nexttick -= 1
        }
    }
    if (this.winmode) {
        while (this.balls.length < 10) {
            this.addball(UFX.random(settings.sx), UFX.random(-200, -100), UFX.random(15, 40))
        }
    }
    if (this.winmode || this.mode === "act") {
        this.tpool += dt
        var ntick = 0
        while (this.tpool > settings.tstep) {
            ntick += 1
            this.tpool -= settings.tstep
        }
        for (var jball = 0 ; jball < this.balls.length ; ++jball) {
            var ball = this.balls[jball]
        
            var oldx = ball.x, oldy = ball.y
            if (ball.tstill > 0.5 || oldy > settings.sy + 100 || (!this.winmode && this.skipclicks <= 0)) {
                ball.alive = false
            }

            var x = ball.x, y = ball.y
            var v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
            var Rplus = 1 + ball.R + 1.2 * dt * v
            var Rplus2 = Rplus * Rplus
            
            var closepoints = this.points.filter(function(p) {
                return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) < Rplus2
            })
            
            for (var jtick = 0 ; jtick < ntick ; ++jtick) {
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
                    if (this.recorder) {
                        walkthrough[levelnumber] = this.recorder.stop()
                    }
                    if (!this.playback) {
                        levelnumber += 1
                        if (levelnumber >= levels.length) {
                            alert("you beat the game!")
                            levelnumber = 0
                        }
                    }
                    this.start()
                    return
                }
            }
            ball.omega = ball.vx * 0.05
            ball.theta += ball.omega * dt

            
            var dx = ball.x - oldx, dy = ball.y - oldy
            if (dx * dx + dy * dy < 0.01) {
                ball.tstill += dt
            } else {
                ball.tstill = 0
            }
        }
        this.balls = this.balls.filter(function (ball) { return ball.alive })
        if (this.balls.length == 0) {
            playsound("fail")
            if (this.recorder) {
            	this.recorder.stop()
            	delete this.recorder
        	}
            this.start()
            return
        }

        if (clicked) this.skipclicks -= 1
    }

    context.drawImage(this.backdrop, 0, 0, settings.sx, settings.sy)
    context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)

    if (mpos) {
        // pointing to the timer?
        var x = mpos[0], y = mpos[1]
        function pcheck (x0, y0, value) { return (x0-x)*(x0-x) + (y0-y)*(y0-y) < 40*40 && value }
        var pointat = pcheck(settings.sx - 40, 40, "time")
                   || pcheck(40, 40, "next")
                   || pcheck(40, 110, "previous")
                   || pcheck(40, 180, "walkthrough")
        // visible aperture?
        var vaper = !pointat && x >= 0 && x < settings.sx && y >= 0 && y < settings.sy
    } else {
        var pointtime = null, vaper = false
    }
    canvas.style.cursor = vaper && this.mode === "prepare" && !this.playback ? "none" : "default"

    if ((this.winmode || this.mode === "prepare") && vaper) {
        UFX.draw("[ b o", mpos, this.csize, "clip")
        context.drawImage(this.backdrop, 0, 0, settings.sx, settings.sy)
        UFX.draw("t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
        context.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
        UFX.draw("]")
        
        if (clicked) {
            playsound("click")
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
            


            this.buffer2 = document.createElement("canvas")
            this.buffer2.width = settings.sx ; this.buffer2.height = settings.sy
            this.bcon2 = this.buffer2.getContext("2d")
            this.bcon2.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "[ b o", mpos, this.csize, "clip")
            this.bcon2.clearRect(0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "t", mpos[0], 0, "z -1 1 t", -mpos[0], 0)
            this.bcon2.drawImage(this.buffer, 0, 0, settings.sx, settings.sy)
            UFX.draw(this.bcon2, "]")
            
            this.buffer = this.buffer2 ; this.buffercon = this.bcon2


            this.csize = 1
        }
        // Draw aperture
        UFX.draw("[ t", mpos, "b o 0 0", this.csize)
        UFX.draw("m", 0, this.csize + 8, "l", 0, -this.csize - 8)
        UFX.draw("m -20 0 l 20 0 m -10 3 l -20 0 l -10 -3 m 10 3 l 20 0 l 10 -3")
        
        UFX.draw("ss rgb(255,255,128) lw 2 s ]")
    } else if (this.winmode && pointat == "time") {
        if (clicked) {
            this.setblocks()
        }
    } else if (this.mode == "prepare") {
        if (pointat == "time") {
            var text = "click to begin"
            if (clicked) this.preptime = 0
        } else if (pointat == "next") {
            var text = "jump to next level"
            if (clicked) {
                levelnumber = Math.min(levelnumber + 1, levels.length - 1)
                this.start()
                return
            }
        } else if (pointat == "previous") {
            var text = "jump to previous level"
            if (clicked) {
                levelnumber = Math.max(0, levelnumber - 1)
                this.start()
                return
            }
        } else if (pointat == "walkthrough") {
            var text = "view solution"
            if (clicked && walkthrough[levelnumber]) {
                this.start()
                this.playback = UFX.Playback(walkthrough[levelnumber], { sync: true })
                this.playback.playraw()
                return
            }
        }
        if (!this.playback && text) {
            var x = settings.sx / 2, y = settings.sy / 2
            drawwords(text, x, y, settings.font1, "white", "black")
        }
    }
    
    if (settings.showpoints) {
        UFX.draw("b")
        this.points.forEach(function (point) {
            UFX.draw("o", point[0], point[1], 2)
        })
        UFX.draw("fs red f")
    }
    // Draw start and goal arrows
    UFX.draw("[ t", this.level.startx, 0,
        "( m 0 6 l 8 4 l 4 40 l 16 36 l 0 60 l -16 36 l -4 40 l -8 4 ) lw 2 fs red ss orange f s ]")
    UFX.draw("[ t", this.level.endx, settings.sy - 70,
        "( m 0 6 l 8 4 l 4 40 l 16 36 l 0 60 l -16 36 l -4 40 l -8 4 ) lw 2 fs red ss orange f s ]")
//    var x1 = this.level.endx, w = this.level.goalwidth, y = settings.sy
//    UFX.draw("b fs red fr", x1 - w/2, y - 20, w, 20)
    
    if (this.winmode || this.mode === "act") {
        // Draw balls
        this.balls.forEach(function (ball) {
            UFX.draw("[ t", ball.x, ball.y, "r", ball.theta, "b o 0 0", ball.R,
                "fs rgb(128,0,0) f ss rgb(255,128,128) lw 1.5 s",
                "[ z", ball.R/25., 2*ball.R/25., "b o 7 2 4 o -7 2 4 fs black f ]",
                "]")
        })
    }
    if (!this.winmode && !this.playback && this.mode === "act") {
        // Draw click to restart dialogue
        var text = this.skipclicks == 2 ? "click twice to restart" : "click to restart"
        var x = settings.sx / 2, y = 40
        drawwords(text, x, y, settings.font1, "white", "black", 1)
    }
    if (this.winmode || this.mode === "prepare") {
        // Draw remaining time meter
        var text = "" + Math.floor(this.preptime + 1), x = settings.sx - 40, y = 40
        if (this.winmode) text = "R"
        var d = (this.preptime - Math.floor(this.preptime)) * 6.28
        UFX.draw("b o", x, y, 30, "fs rgb(0,128,0) f")
        UFX.draw("( m", x, y, "a", x, y, 30, -1.57, -1.57-d, "fs rgb(128,0,0) ) f")
        UFX.draw("b o", x, y, 30, "m", x, y - 35, "l", x, y + 35, "m", x-35, y, "l", x + 35, y, "ss gray lw 2 s")
        context.font = settings.timefont
        UFX.draw("b textalign center textbaseline middle fs white ss black lw 1")
        context.fillText(text, x, y)
        context.strokeText(text, x, y)
        // Draw controls
        context.font = settings.buttonfont
        UFX.draw("fs #844 ss gray [ t 40 40 b o 0 0 30 f s fs white ss black fst0 \u21B7 ]")
        UFX.draw("fs #484 ss gray [ t 40 110 b o 0 0 30 f s fs white ss black fst0 \u21B6 ]")
        UFX.draw("fs #448 ss gray [ t 40 180 b o 0 0 30 f s fs white ss black fst0 ? ]")
    }
        
    // dream sequence
    if (this.playback) {
        if (!this.walkgrad) {
            this.walkgrad = UFX.draw.radgrad(settings.sx/2, settings.sy/2, 0,
                settings.sx/2, settings.sy/2, Math.sqrt(settings.sx*settings.sx + settings.sy*settings.sy)/2,
                0, "rgba(255,255,255,0)", 0.6, "rgba(255,255,255,0.2)", 1, "rgba(255,255,255,0.7)")
        }
        UFX.draw("fs", this.walkgrad, "fr 0 0", settings.sx, settings.sy)
    }

    // Draw scrolling title
    if (this.titlex > -1000) {
        this.titlex -= (Math.abs(this.titlex) < 100 ? 200 : 2000) * dt
        var text = "Level " + (levelnumber + 1), x = settings.sx / 2 + this.titlex, y = settings.sy / 2
        context.font = settings.titlefont
        if (this.winmode) text = "You win!"
        if (this.playback) {
            text = "Walkthrough"
            context.font = settings.walkfont
        }
        if (levelnumber == 0) {
            UFX.draw("b textalign center textbaseline middle fs orange ss yellow lw 3")
            context.fillText(text, x, y)
            context.strokeText(text, x, y)
        } else {
            drawwords(text, x, y, context.font, "orange", "yellow", 4)
        }
    }

    // Fade from white
    if (this.fadealpha > 0) {
        UFX.draw("[ alpha", this.fadealpha, "fs white fr 0 0", settings.sx, settings.sy, "]")
        this.fadealpha -= 2 * dt
    }

}


