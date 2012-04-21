
SpringsYou = {
    interact: function (you) {
        if (you.vy < 0 && you.y > 0 && you.y < 40) {
            var dx = Math.abs(getdx(this.x, you.x))
            if (dx * this.xfactor < 20) {
                you.y = 40
                you.nextstate = SpringState
            }
        }
    },
}

BlowsBubbles = {
    think: function (dt) {
        if (UFX.random(10) < dt) {
            hitters.push(new Bubble(this.x, this.y + 30))
        }
    },

}


function Springboard (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Springboard.prototype = UFX.Thing()
                           .addcomp(WorldBound)
                           .addcomp(SpringsYou)
                           .addcomp(IsBox, 30)


function Bubbler (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Bubbler.prototype = UFX.Thing()
                           .definemethod("interact")
                           .addcomp(WorldBound)
                           .addcomp(BlowsBubbles)
                           .addcomp(IsBox, 30, "blue")



