

function Device(x) {
    this.x = x
    this.y = getheight(x)
    this.charges = 0
    this.alive = true
    this.think(0)
    this.h = 30
}
Device.prototype = UFX.Thing()
    .definemethod("think")
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(DisappearsUnderwater)
    .addcomp(StandsUpward)
    .addcomp({
        think: function () {
            if (this.y < -5) this.charge(3)
        },
        charge: function (n) {
            n = n || 1
            if (this.charges < 3) playsound("poweron")
            this.charges = Math.min(this.charges + n, 3)
        },
        draw: function () {
            UFX.draw("( m -20 60 l 20 60 l 30 -30 l -30 -30 ) fs rgb(64,64,64) ss gray lw 2 f s")
            for (var j = 0 ; j < 3 ; ++j) {
                UFX.draw("b o", (j-1)*15, "70 6 fs", (this.charges > j ? "green" : "red"), "f")
            }
        },
    })


function Tower(x) {
    this.x = x
    this.y = getheight(x)
    this.charges = 0
    this.alive = true
    this.think(0)
    this.h = 160
}
Tower.prototype = UFX.Thing()
    .definemethod("think")
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(DisappearsUnderwater)
    .addcomp(StandsUpward)
    .addcomp({
        charge: function (n) {
            n = n || 1
            if (this.charges < 3) playsound("poweron")
            this.charges = Math.min(this.charges + n, 3)
        },
        draw: function () {
            UFX.draw("fs rgb(64,64,64) ss gray lw 2")
            UFX.draw("( m -3 110 l -1 160 l 1 160 l 3 110 ) f s")
            UFX.draw("( m -8 40 l -8 120 l 8 120 l 8 40 ) f s")
            UFX.draw("( m -10 80 l 10 80 l 14 -20 l -14 -20 ) f s")
            for (var j = 2 ; j >= 0 ; --j) {
                var r = Math.sqrt(j+1) * 9
                UFX.draw("b o 0 160", r, "lw 1 fs", (this.charges > j ? "green" : "rgb(100,0,0)"), "f s")
            }
        },
    })


function Glower(x) {
    this.x = x
    this.y = getheight(x)
    this.glowing = true
    this.alive = true
    this.think(0)
}
Glower.prototype = UFX.Thing()
    .definemethod("think")
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(DisappearsUnderwater)
    .addcomp(StandsUpward)
    .addcomp({
        think: function (dt) {
            this.glowing = this.y > -5
        },
        draw: function () {
            var s = Math.floor(64 + 90 + 90 * Math.sin(Date.now() / 1000))
            var color = this.glowing ? "rgb(" + s + ",64,64)" : "rgb(64,64,64)"
            UFX.draw("( m -20 60 l 20 60 l 30 -30 l -30 -30 ) fs", color, "ss gray lw 2 f s")
//            for (var j = 0 ; j < 3 ; ++j) {
//                UFX.draw("b o", (j-1)*15, "70 6 fs", (this.charges > j ? "green" : "red"), "f")
//            }
        },
    })
    
function Barrier(x) {
    this.x = x
    this.y = getheight(x)
    this.alive = true
    this.pleft = You.x < this.x
    this.think(0)
    this.h = 0
}
Barrier.prototype = UFX.Thing()
    .definemethod("charge")
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(DisappearsUnderwater)
    .addcomp({
        tilt: function () { return 0 },
        think: function (dt) {
            if (You.y < 100 + this.y) {
                if (this.pleft) {
                    You.x = Math.min(You.x, this.x - 12)
                } else {
                    You.x = Math.max(You.x, this.x + 12)
                }
            } else {
                this.pleft = You.x < this.x
            }
        },
        draw: function () {
            UFX.draw("( m -4 -20 l -4 100 l 4 100 l 4 -20 ) fs rgb(24,24,24) ss gray lw 1 f s")
        },
    })





