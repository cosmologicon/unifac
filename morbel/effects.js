var DiesAfter = {
    init: function (tlive) {
        this.tlive = tlive || 0.4
    },
    think: function (dt) {
        this.t += dt
        if (this.t > this.tlive) this.alive = false
    },
}

function Discharge(x, y) {
    this.t = 0
    this.x = x
    this.y = y
    this.alive = true
    this.think(0)
    playsound("zot")
}
Discharge.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(AlwaysVisible)
    .addcomp(DiesAfter, 0.4)
    .addcomp({
        draw: function () {
            for (var j = 0 ; j < 6 ; ++j) {
                UFX.draw("[ r", UFX.random(100), "b m 0 0")
                for (var h = 10 ; h < 50 ; h += 10) {
                    UFX.draw("l", UFX.random(-h/4, h/4), h)
                }
                UFX.draw("lw 1 ss rgba(255,255,200) s ]")
            }
        },
    })

function Splat(x, y) {
    this.t = 0
    this.x = x
    this.y = y
    this.alive = true
    this.think(0)
    playsound("splatter")
}
Splat.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(AlwaysVisible)
    .addcomp(DiesAfter, 0.4)
    .addcomp({
        draw: function () {
            UFX.draw("z 1 0.5 b o 0 0", this.t * 100, "lw 5 ss purple s")
        },
    })

function Windmill(x, y) {
    this.t = 0
    this.x = x
    this.y = y
    this.alive = true
    this.think(0)
}
Windmill.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(AlwaysVisible)
    .addcomp(DiesAfter, 2)
    .addcomp({
        draw: function () {
            var A = 10 * this.t * this.t
            UFX.draw("t 0", this.t * 70 + 16, "r", A, "t 0 -16")
        },
    })
    .addcomp(DrawGear)
    .addcomp({
        think: function (dt) {
            var x = this.x
            devices.forEach(function (device) {
                var dx = device.x - x
                if (Math.abs(dx) < 120) {
                    device.x += 4000 * dt / (40 + Math.abs(dx)) * (dx > 0 ? 1 : -1)
                    device.y = getheight(device.x)
                }
            })
        },
    })


function BirdSplat(x, y, dx, dy) {
    this.t = 0
    this.x = x
    this.y = y
    var d = Math.sqrt(dx * dx + dy * dy)
    this.vx = dx / d * 200
    this.vy = dy / d * 200
    this.alive = true
    this.think(0)
    playsound("pshow")
}
BirdSplat.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(AlwaysVisible)
    .addcomp(DiesAfter, 1.2)
    .addcomp({
        think: function (dt) {
            this.x += this.vx * dt
            this.vy -= 200 * dt
            this.y += this.vy * dt
        },
        draw: function () {
            UFX.draw("r", 15 * this.t)
        },
    })
    .addcomp(DrawBird)
    .addcomp({
        think: function (dt) {
            if (!this.alive) effects.push(new Discharge(this.x, this.y))
        },
    })

