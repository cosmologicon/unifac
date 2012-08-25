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
    .addcomp({
        think: function (dt) {
            this.t += dt
            if (this.t > 0.4) this.alive = false
        },
        draw: function () {
            UFX.draw("b o 0 0", this.t * 300, "lw 0.5 ss white s")
        },
    })

