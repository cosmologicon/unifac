// Game objects - will probably separate this out when I get an idea what's actually
// going to be in the game

// Coordinates explained:
//   X = angle with respect to north pole
//   y = height above surface
//   vx = speed with respect to x, which is X * (r + y)

var ClipsToCamera = {
    init: function (r) {
        this.clipr = r || 0
        this.setmethodmode("draw", "any")
    },
    draw: function () {
        return !camera.isvisible(this.X, this.y, this.clipr)
    },
}

var Lives = {
    init: function () {
        this.alive = true
    },
    die: function () {
        this.alive = false
    },
}
// For objects that have transitions in/out - don't want to disappear immediately
var AppearsDisappears = {
    init: function (tappear, tdisappear) {
        this.alive = true
        this.tappear = typeof tappear == "number" ? tappear : 0.5
        this.tdisappear = typeof tdisappear == "number" ? tdisappear : tappear
        this.appearing = true
        this.disappering = false
        this.fappear = 0
    },
    think: function (dt) {
        if (this.appearing) {
            this.fappear = this.tappear ? this.fappear + dt / this.tappear : 1
            if (this.fappear >= 1) {
                this.fappear = 1
                this.appearing = false
                if (this.onappear) this.onappear()
            }
        } else if (this.disappearing && this.alive) {
            this.fappear = this.tdisappear ? this.fappear - dt / this.tdisappear : 0
            if (this.fappear <= 0) {
                this.fappear = 0
                this.alive = false
            }
        }
    },
    die: function () {
        this.appearing = false
        this.disappearing = true
    },
}

var WorldBound = {
    init: function (X, y) {
        this.X = X || 0
        this.y = y || 0
        this.vx = 0
        this.vy = 0
        this.facingright = true
    },
    think: function () {
        this.oldX = this.X
        this.oldy = this.y
        this.xfactor = Math.max(gamestate.worldr + this.y, 1)
    },
    draw: function () {
        if (Twondy.wobblet) {
            var theta = this.x + Twondy.phi
            var C = Math.cos(theta), S = Math.sin(theta)
            var r = gamestate.worldr
            context.rotate(Twondy.beta + Twondy.phi)
            context.translate(r * (Twondy.cprimex + Twondy.a * S), r * (Twondy.cprimey + Twondy.b * C))
            context.rotate(-Math.atan2(Twondy.b * S, Twondy.a * C))
            context.translate(0, this.y)
        } else {
            context.rotate(-this.X)
            context.translate(0, this.xfactor)
        }
    },
}

// States for a state machine
var HasStates = {
    init: function (methodnames) {
        // Or, how I learned to stop worrying and love JavaScript function notation
        var methods = {}
        methodnames.forEach(function (methodname) {
            methods[methodname] = function () {
                return this.state && this.state[methodname].apply(this, arguments)
            }
        })
        this.addcomp(methods)
    },
    // Call this to set the state immediately.
    // For state changes that should be set at the end of the think cycle, assign to this.nextstate
    setstate: function (state) {
        if (this.state && this.state.exit) {
            this.state.exit.call(this)
        }
        if (state instanceof Array) {
            this.state = state[0]
            if (this.state.enter) {
                this.state.enter.apply(this, state.slice(1))
            }
        } else {
            this.state = state
            if (this.state && this.state.enter) {
                this.state.enter.call(this)
            }
        }
        this.think(0)
    },
    // this.nextstate can either be a state object or an Array of [stateobj, arg1, arg2], where
    //   the args will be passed to stateobj.enter.
    updatestate: function () {
        if (this.nextstate) {
            this.setstate(this.nextstate)
            this.nextstate = null
        }
    },
}

// Has a velocity and an acceleration, and updates position based on that
var BasicMotion = {
	init: function () {
		this.vx = this.vx || 0
		this.vy = this.vy || 0
		this.ax = this.ax || 0
		this.ay = this.ay || 0
	},
	think: function (dt) {
		this.X += (this.vx + 0.5 * this.ax * dt) * dt / this.xfactor
		this.y += (this.vy + 0.5 * this.ay * dt) * dt
		this.vx += this.ax * dt
		this.vy += this.ay * dt
		// Last ax and ay are the acceleration for the purposes of animation
		this.lastax = this.ax ; this.lastay = this.ay
		this.ax = this.ay = 0
	},
}

var IsBall = {
    init: function (size, color) {
        this.ballsize = size || 10
        this.ballcolor = color || "orange"
    },
    draw: function () {
        context.beginPath()
        context.arc(0, 0, this.ballsize, 0, tau)
        context.strokeStyle = this.ballcolor
        context.lineWidth = 1
        context.stroke()
    }
}

var IsBox = {
    init: function (size, color) {
        this.boxsize = size || 10
        this.boxcolor = color || "purple"
    },
    draw: function () {
        context.strokeStyle = this.boxcolor
        context.strokeRect(-this.boxsize/2, 0, this.boxsize, this.boxsize)
    }
}

var IsBlob = {
    init: function (size, color0, color1) {
        this.blobsize = size || 10
        this.blobcolor0 = color0 || "purple"
        this.blobcolor1 = color1 || "purple"
        this.tspin = 0
    },
    think: function (dt) {
        this.tspin += dt
    },
    draw: function () {
        context.rotate(this.tspin)
        context.strokeStyle = "black"
        context.lineWidth = 1
        var s = this.blobsize
        function circ(x, y, r) {
            context.beginPath()
            context.arc(x*s, y*s, r*s, 0, tau)
            context.stroke()
            context.fill()
        }
        context.fillStyle = this.blobcolor0
        circ(0, 0.8, 0.5)
        circ(0, -0.8, 0.5)
        context.fillStyle = this.blobcolor1
        circ(0, 0, 0.8)
        context.fillStyle = this.blobcolor0
        circ(0.8, 0, 0.5)
        circ(-0.8, 0, 0.5)
        
        
    },
}

var Wobbles = {
    init: function (wspeed, wmag) {
        this.wobblet = 0
        this.wspeed = wspeed || 4
        this.wmag = wmag || 0.3
    },
    wobble: function () {
        this.wobblet = 0
    },
    think: function (dt) {
        this.wobblet += dt
    },
    draw: function () {
        var w = this.wobblet * this.wspeed
        if (w < 50) {
            var s = 1 + this.wmag * Math.sin(w) * Math.exp(-0.1 * w)
            context.scale(s, 1/s)
        }
    },
}

var Drifts = {
    init: function (vx, vy) {
        this.vx = vx || 0
        this.vy = vy || 0
    },
    think: function (dt) {
        this.X += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
}


var SeeksOrbit = {
    init: function (ymax) {
        this.ymax = ymax || 200
    },
    think: function (dt) {
        this.X += this.vx * dt / this.xfactor
        if (this.y < this.ymax) {
            this.y += this.vy * dt
            if (this.y >= this.ymax) {
                this.y = this.ymax
                this.vy = 0
            }
        } else if (this.y > this.ymax) {
            this.y -= this.vy * dt
            if (this.y <= this.ymax) {
                this.y = this.ymax
                this.vy = 0
            }
        }
        if (this.y != this.ymax) {
            this.vy += 40 * dt
        }
    },
}


var Crashes = {
    think: function (dt) {
        this.alive = this.alive && this.y > 0
    },
}

var FadesUpward = {
    init: function (ymax) {
        this.ymax = ymax
    },
    think: function (dt) {
        this.alive = this.alive && this.y < this.ymax
    },
    draw: function () {
        var a = Math.max(0, Math.min(1, (this.ymax - this.y) / 50))
        context.globalAlpha *= a
    },
}

var FadesOutward = {
    init: function (smax, vs, s0, color) {
        this.smax = smax
        this.vs = vs || 400
        this.s = s0 || 0
        this.color = color || "blue"
    },
    think: function (dt) {
        this.s += this.vs * dt
        if (this.s > this.smax) this.alive = false
    },
    draw: function () {
        var a = Math.max(0, Math.min(1, 1 - (this.smax - this.s) / this.smax / 3))
        context.strokeStyle = this.color
        context.fillStyle = this.color
        context.lineWidth = 1.5
        context.beginPath()
        context.arc(0, 0, this.s, 0, tau)
        context.stroke()
        context.globalAlpha *= 0.3
        context.fill()
    },
}

var HitsWithin = {
    init: function (dhp) {
        this.dhp = dhp
    },
    hit: function (objs) {
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = getdX(this.X, objs[j].X) * this.xfactor
            var dy = this.y - objs[j].y
            if (dx * dx + dy * dy < this.s * this.s) {
                objs[j].takedamage(this.dhp)
            }
        }
    },
}


var GivesMoney = {
    init: function (money) {
        this.money = money || 1
    },
    benabbed: function (nabber) {
        if (this.alive) {
            this.alive = false
            gamestate.bank += this.money
            effects.push(new MoneyBox(this.money, this.X, this.y))
        }
    },
}

var ExplodesOnTouch = {
    benabbed: function (nabber) {
        if (this.alive) {
            this.alive = false
            ehitters.push(new Wave(this.X, this.y, 300, 500))
        }
    },
}


var GivesBoost = {
    init: function (boostvy) {
        this.boostvy = boostvy
    },
    benabbed: function (nabber) {
        if (this.alive && nabber.y > 0) {
            this.alive = false
            nabber.vy = Math.max(nabber.vy, 0) + this.boostvy
            nabber.jumps = 1
        }
    },
}

var HasHealth = {
    init: function (hp) {
        this.hp = hp || 1
    },
    die: function () {
        this.alive = false
    },
    takedamage: function (dhp) {
        this.hp -= dhp
        if (this.hp <= 0) this.die()
    }
}



function Token(X, y) {
    this.X = X
    this.y = y
    this.vx = UFX.random.choice([-50, 50])
    this.vy = -30
    this.alive = true
    this.think(0)
}
Token.prototype = UFX.Thing()
                     .addcomp(WorldBound)
                     .addcomp(IsBall, 5, "yellow")
                     .addcomp(Drifts)
                     .addcomp(Crashes)
                     .addcomp(GivesMoney)



function Bubble(X, y) {
    this.X = X
    this.y = y
    this.vx = UFX.random(-20, 20)
    this.vy = 20
    this.alive = true
    this.think(0)
}
Bubble.prototype = UFX.Thing()
                     .addcomp(WorldBound)
                     .addcomp(FadesUpward, 200)
                     .addcomp(Wobbles, 4, 0.3)
                     .addcomp(IsBall, 20, "#AAF")
                     .addcomp(Drifts)
                     .addcomp(GivesBoost, 360)


function Bomb(X, y) {
    this.X = X
    this.y = y
    this.vx = UFX.random.choice([-40, 40])
    this.vy = 60
    this.alive = true
    this.think(0)
}
Bomb.prototype = UFX.Thing()
                     .addcomp(WorldBound)
                     .addcomp(SeeksOrbit, 200)
                     .addcomp(IsBlob, 10, "pink")
                     .addcomp(ExplodesOnTouch)



function Wave (X0, y0, smax, vs) {
    this.X = X0
    this.y = y0
    if (smax) this.smax = smax
    if (vs) this.vs = vs
    this.alive = true
    this.think(0)
}
Wave.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(FadesOutward, 100, 200)
                    .addcomp(HitsWithin, 1)






