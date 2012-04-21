
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



