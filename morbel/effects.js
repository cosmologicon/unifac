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
}
Discharge.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(AlwaysVisible)
    .addcomp(DiesAfter, 0.4)
    .addcomp({
        draw: function () {
            UFX.draw("b o 0 0", this.t * 300, "lw 0.5 ss white s")
        },
    })

function Splat(x, y) {
    this.t = 0
    this.x = x
    this.y = y
    this.alive = true
    this.think(0)
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



