


function Device(x) {
    this.x = x
    this.y = getheight(x)
    this.charges = 0
    this.alive = true
    this.think(0)
}
Device.prototype = UFX.Thing()
    .definemethod("think")
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(DisappearsUnderwater)
    .addcomp(StandsUpward)
    .addcomp({
        charge: function () {
            this.charges = Math.min(this.charges + 1, 3)
        },
        draw: function () {
            UFX.draw("( m -20 60 l 20 60 l 30 -30 l -30 -30 ) fs rgb(64,64,64) ss gray lw 2 f s")
            for (var j = 0 ; j < 3 ; ++j) {
                UFX.draw("b o", (j-1)*15, "70 6 fs", (this.charges > j ? "green" : "red"), "f")
            }
        },
    })


