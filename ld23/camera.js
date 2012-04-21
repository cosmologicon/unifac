
var camera = {
    x: 0,
    y: 0,
    targetx: 0,
    targety: 0,
    zoom: 1,
    
    lookat: function (p) {
        this.x = this.targetx = p[0]
        this.y = this.targety = p[1]
    },
    settarget: function (p) {
        this.targetx = p[0]
        this.targety = p[1]
    },
    think: function (dt) {
        var f = 1 - Math.exp(-4 * dt)
        var dx = this.targetx - this.x, dy = this.targety - dy
        this.x = Math.abs(dx) < 1 ? this.targetx : this.x + f * (this.targetx - this.x)
        this.y = Math.abs(dy) < 1 ? this.targety : this.y + f * (this.targety - this.y)
    },
    
    
}



