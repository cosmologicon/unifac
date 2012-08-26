
var ReactsNearYou = {
    init: function (dx, dy, excheight) {
        this.reactx = dx || 80
        this.reacty = dy || 50
        this.excheight = excheight || 20
    },
    nearyou: function () {
        return Math.abs(this.x - You.x) < this.reactx && Math.abs(this.y - You.y) < this.reacty
    },
    think: function (dt) {
        if (this.nearyou() && You.state === LandState) {
            this.exctime = 0.6
        } else {
            this.exctime = Math.max(this.exctime - dt, 0)
        }
    },
    draw: function () {
        if (this.nearyou()) {
            UFX.draw("[ t 0", this.excheight, "fs white textalign center textbaseline middle vflip")
            context.font = settings.fonts.exc
            context.fillText("!", 0, 0)
            UFX.draw("]")
        }
    },
}

var Discharges = {
    activate: function () {
        effects.push(new Discharge(this.x, this.y + 10))
        this.alive = false
        var x = this.x, y = this.y + 10
        devices.forEach(function (device) {
            var dx = x - device.x, dy = y - (device.y + 20)
            if (dx * dx + dy * dy < 120 * 120) {
                device.charge()
            }
        })
    },
}

var FlySplats = {
    activate: function () {
        effects.push(new BirdSplat(this.x, this.y, this.x - You.x, this.y - You.y))
        this.alive = false
    },
}


var LaunchesYou = {
    activate: function () {
        effects.push(new Discharge(this.x, this.y + 16))
        this.alive = false
        if (this.nearyou()) {
            var dx = You.x - this.x, dy = You.y - this.y + 40
            if (Math.abs(dy) < 0.1) dy = 1
            var f = mechanics.launchspeed / Math.sqrt(dx*dx + dy*dy)
            You.vx = f * dx
            You.vy = f * dy
            
        }
    },
}

var WhipsItGood = {
    activate: function () {
        effects.push(new Windmill(this.x, this.y + 16))
        this.alive = false
    },
}

var CarriesYou = {
    activate: function () {
        You.carrier = this
        You.nextstate = CarriedState
        this.carrybounced = false
        console.log("carrying")
    },
    bounce: function () {
        if (You.carrier === this) {
            if (this.carrybounced && getheight(this.x) > 0) {
                this.alive = false
                You.nextstate = LandState
                effects.push(new Splat(this.x, this.y))
            }
            this.carrybounced = true
        }
    },
}

var RandomlyDiesOnBounce = {
    init: function (dieprob) {
        this.dieprob = dieprob || 0.05
    },
    bounce: function () {
        if (You.carrier !== this && getheight(this.x) < 0) {
            if (UFX.random() < this.dieprob) {
                this.alive = false
            }
        }
    },
}


var FollowsYou = {
    init: function (vxmax) {
        this.vxmax = vxmax
    },
    think: function (dt) {
        if (this.nearyou()) {
            var d = You.x - this.x
            this.vx += dt * 50 * (d > 0 ? 1 : -1)
            this.vx = Math.min(Math.max(this.vx, -this.vxmax), this.vxmax)
        } else {
            this.vx *= Math.exp(-2 * dt)
        }
        this.x += this.vx * dt
    },
}

var DisappearsUnderwater = {
    draw: function () {
        if (this.y < 40) {
            UFX.draw("( m -1000", -this.y, "l 1000", -this.y, "l 0 1000 ) clip")
        }
    },
}

var Bounces = {
    bounce: function () {
        this.y = getheight(this.x)
        this.vy = UFX.random(200, 300)
        if (this.exctime) playsound("boing")
    },
    think: function (dt) {
        this.vy -= dt * mechanics.gravity
        this.y += this.vy * dt
        if (this.y < getheight(this.x)) {
            this.bounce()
        }
    },
    draw: function () {
        var s = 1 + this.vy / 1000
        UFX.draw("z", 1/s, s)
    },
}

var SwimsAbout = {
    bounce: function () {
        this.y = Math.max(getheight(this.x), -10)
        this.vy = UFX.random(200, 300)
    },
    think: function (dt) {
        this.vy -= dt * mechanics.gravity
        this.y += this.vy * dt
        this.x += this.vx * dt
        if (this.y < getheight(this.x) || this.y < -10) {
            this.bounce()
        }
    },
}

var FliesAbout = {
    init: function (fxmax, fymax) {
        this.fxmax = fxmax || 200
        this.fymax = fymax || 200
    },
    think: function (dt) {
        this.vx = Math.min(Math.max(this.vx + dt * 50 * (this.x > this.x0 ? -1 : 1), -this.fxmax), this.fxmax)
//        this.vy = Math.min(Math.max(this.vy + dt * 8 * (this.y > this.y0 ? -1 : 1), -this.fymax), this.fymax)*/
        if (this.ascending) {
            this.vy = Math.min(this.vy + dt * 15, 50)
            if (this.y - getheight(this.x) > 400) this.ascending = false
        } else {
            this.vy = Math.min(this.vy - dt * 5, -20)
            if (this.y - getheight(this.x) < 120) this.ascending = true
        }
        this.y += this.vy * dt
        this.x += this.vx * dt
    },
}

var WindsUpRandomly = {
    init: function (vxmax) {
        this.vxmax = vxmax || 160
    },
    think: function (dt) {
        if (this.resting) {
            this.vx *= Math.exp(-1 * dt)
            if (Math.abs(this.vx) < 1) this.vx = 0
            if (this.vx == 0 && UFX.random() * 0.6 < dt) {
                if (this.nearyou()) {
                    this.vx = You.x > this.x ? 1 : -1
                } else {
                    this.vx = UFX.random.choice([-1, 1])
                }
                this.resting = false
            }
        } else {
            this.vx += (this.vx > 0 ? 1 : -1) * 200 * dt
            this.vx = Math.min(Math.max(this.vx, -this.vxmax), this.vxmax)
            if (UFX.random() * 1.4 < dt) {
                this.resting = true
            }
        }
        this.x += this.vx * dt
        this.y = getheight(this.x)
    },
}


var TalksToYou = {
    init: function (text) {
        this.text = text || "yello"
    },
    activate: function () {
        this.talking = true
    },
    think: function (dt) {
        this.talking = this.talking && this.nearyou()
    },
    draw: function () {
        if (this.talking) {
            var texts = dialogue.wordwrap(this.text, 24)
            context.font = settings.fonts.yapper
            UFX.draw("fs white ss black lw 0.5 [ t 20 40 vflip textalign center textbaseline middle")
            texts.forEach(function (text, jline, texts) {
                var y = 24 * (-texts.length + jline)
                context.fillText(text, 0, y)
                context.strokeText(text, 0, y)
            })
            UFX.draw("]")
        }
    }
}


var AvoidsLand = {
    bounce: function () {
        if (getheight(this.x) > 0) {
            this.vx = -this.vx
        }
    },
}

var BouncesRandomDirections = {
    bounce: function () {
        if (this.nearyou()) {
            this.vx = this.vx * 0.8 + UFX.random(-15, 15)
        } else {
            this.vx = this.vx / 2 + UFX.random(-60, 60)
            if (getheight(this.x) > 0) this.vx += getgrad(this.x) * 35
        }
    },
}


var PointsForward = {
    draw: function () {
        if (!this.vx && !this.vy) return
        UFX.draw("r", Math.atan2(this.vy, this.vx))
    },
}

var PointsUpward = {
    draw: function () {
        if (!this.vx && !this.vy) return
        if (this.vx > 0) {
            UFX.draw("r", Math.atan2(this.vy, this.vx) * 0.5)
        } else {
            UFX.draw("hflip r", Math.atan2(this.vy, -this.vx) * 0.5)
        }
    },
}

var StandsUpward = {
    draw: function () {
        UFX.draw("r", -Math.atan2(0.5 * getgrad(this.x), 1))
    }
}

var DrawBall = {
    draw: function () {
        UFX.draw("b o 0 8 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
    },
}

var DrawFish = {
    draw: function () {
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        UFX.draw("( m -8 0 l -16 8 l -16 -8 ) fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
    }
}

var DrawBird = {
    draw: function () {
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        var A = this.ascending ? -1 * Math.abs(Math.sin(Date.now() / 200)) : 0
        UFX.draw("[ t 5 5 r", A, "( m 0 0 l 9 -5 l 15 7 ) f s ]")
        UFX.draw("[ hflip t 5 5 r", A, "( m 0 0 l 9 -5 l 15 7 ) f s ]")
    }
}

var DrawWheel = {
    draw: function () {
        UFX.draw("t 0 16 r", -this.x / 16)
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        UFX.draw("( m 0 8 l 8 16 l -8 16 ) f s")
        UFX.draw("( m 0 -8 l 8 -16 l -8 -16 ) f s")
        UFX.draw("( m 8 0 l 16 8 l 16 -8 ) f s")
        UFX.draw("( m -8 0 l -16 8 l -16 -8 ) f s")
    }
}

var DrawGear = {
    draw: function () {
        UFX.draw("t 0 16 r", -this.x / 16)
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        for (var j = 0 ; j < 3 ; ++j) {
            UFX.draw("[ r", j*2*Math.PI/3, "( m 0 6 l 0 22 l 8 14 ) f s ]")
        }
    }
}


var DrawGuy = {
    draw: function () {
        UFX.draw("fs rgb(100,0,100) ss rgb(160,0,160) lw 2")
        UFX.draw("( m -8 0 l 8 0 l 0 8 ) f s")
        UFX.draw("( m 3 7 l 0 16 l 10 20 ) f s")
        UFX.draw("( m -3 7 l 0 16 l -10 20 ) f s")
        UFX.draw("( m 5 36 l 8 48 l 20 46 ) f s")
        UFX.draw("( m -5 36 l -8 48 l -20 46 ) f s")
        UFX.draw("b o 0 30 8 f s")
    }
}


function Hopper(x) {
    this.x = x
    this.vx = 0
    this.bounce()
    this.alive = true
    this.think(0)
    
}
Hopper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(FollowsYou, 100)
    .addcomp(BouncesRandomDirections)
    .addcomp(DisappearsUnderwater)
    .addcomp(ReactsNearYou, 80, 100, 25)
    .addcomp(Discharges)
    .addcomp(Bounces)
    .addcomp(DrawBall)


function Flopper(x) {
    this.x = x
    this.vx = UFX.random.choice([-1, 1]) * UFX.random(80, 140)
    this.bounce()
    this.alive = true
    this.think(0)
}
Flopper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(SwimsAbout)
    .addcomp(AvoidsLand)
    .addcomp(DisappearsUnderwater)
    .addcomp(ReactsNearYou, 30, 30, 20)
    .addcomp(CarriesYou)
    .addcomp(RandomlyDiesOnBounce)
    .addcomp(PointsForward)
    .addcomp(DrawFish)


function Flapper(x, y) {
    this.x0 = this.x = x
    this.y0 = this.y = y
    this.vy = UFX.random(10, 20)
    this.vx = UFX.random.choice([-1, 1]) * UFX.random(80, 140)
    this.alive = true
    this.ascending = true
    this.think(0)
}
Flapper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(ReactsNearYou, 50, 120)
    .addcomp(FlySplats)
    .addcomp(HorizontalClipping)
    .addcomp(FliesAbout)
    .addcomp(PointsUpward)
    .addcomp(DrawBird)

function Gripper(x) {
    this.x = x
    this.y = getheight(this.x)
    this.vx = 0
    this.resting = true
    this.alive = true
    this.think(0)
}
Gripper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(WindsUpRandomly)
    .addcomp(DisappearsUnderwater)
    .addcomp(ReactsNearYou)
    .addcomp(LaunchesYou)
    .addcomp(DrawWheel)


function Whipper(x) {
    this.x = x
    this.y = getheight(this.x)
    this.vx = 0
    this.resting = true
    this.alive = true
    this.think(0)
}
Whipper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(WindsUpRandomly)
    .addcomp(DisappearsUnderwater)
    .addcomp(ReactsNearYou)
    .addcomp(WhipsItGood)
    .addcomp(DrawGear)


function Yapper(x, text) {
    this.x = x
    this.y = getheight(x)
    this.y0 = this.x0 = 0
    this.alive = true
    this.text = text
    this.think(0)
}
Yapper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(ReactsNearYou, 120, 100, 55)
    .addcomp(TalksToYou)
    .addcomp(StandsUpward)
    .addcomp(DrawGuy)


