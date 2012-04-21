
var camera = {
    x: 0,
    y: 0,
    targetx: 0,
    targety: 0,
    zoom: 1,
    ymin: 40,
    mode: "play",   // can be "planet"
    chasezoom: false,
    
    lookat: function (p) {
        this.x = this.targetx = p[0]
        this.y = this.targety = p[1]
    },
    settarget: function (p) {
        this.targetx = p[0]
        if (this.mode === "play") {
            this.targety = Math.max(p[1], this.ymin)
        } else if (this.mode === "planet") {
            this.targety = p[1] - gamestate.worldr
            this.chasezoom = true
        }
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
        var z
        if (this.mode === "play") {
            z = Math.min(Math.max(0.4 * settings.sy / (this.y + gamestate.worldr), 0.1), 10)
        } else if (this.mode === "planet") {
            z = settings.sy / gamestate.worldr * 0.2
        }
        if (this.chasezoom) {
            var dz = Math.log(z / this.zoom)
            if (Math.abs(dz) < 0.01) {
                this.zoom = z
                if (this.mode === "play") {
                    this.chasezoom = false
                }
            } else {
                this.zoom *= Math.exp(2 * f * dz)
            }
        } else {
            this.zoom = z
        }

    },
    orient: function () {
        context.translate(settings.sx/2, settings.sy/2)
        context.scale(this.zoom, -this.zoom)
        context.translate(0, -this.y - gamestate.worldr)
        context.rotate(this.x)
    }
}



