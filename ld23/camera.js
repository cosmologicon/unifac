
var camera = {
    x: 0,
    y: 0,
    targetx: 0,
    targety: 0,
    zoom: 1,
    ymin: 40,
    
    lookat: function (p) {
        this.x = this.targetx = p[0]
        this.y = this.targety = p[1]
    },
    settarget: function (p, ymin) {
        if (typeof ymin !== "number") ymin = this.ymin
        this.targetx = p[0]
        this.targety = Math.max(p[1], ymin)
    },
    think: function (dt) {
        var f = 1 - Math.exp(-2.5 * dt)
        var dx = this.targetx - this.x, dy = this.targety - this.y
        dx = ((dx + tau/2) % tau + tau) % tau - tau/2
        if (this.targety > 1 + this.ymin) {
            var r = gamestate.worldr
            var px = (this.y + r) * Math.sin(this.x), py = (this.y + r) * Math.cos(this.x)
            var tx = (this.targety + r) * Math.sin(this.targetx), ty = (this.targety + r) * Math.cos(this.targetx)
            px += f * (tx - px)
            py += f * (ty - py)
            this.x = Math.atan2(px, py)
            this.y = Math.sqrt(px * px + py * py) - r
        } else if (Math.abs(dx) < 0.01 && Math.abs(dy) < 1) {
            this.x = this.targetx
            this.y = this.targety
        } else {
            this.x += f * dx
            this.y += f * dy
        }
        this.zoom = Math.max(0.4 * settings.sy / (this.y + gamestate.worldr), 0.1)
    },
}



