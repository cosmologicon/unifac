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
