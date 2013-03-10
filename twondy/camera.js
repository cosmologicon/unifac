
var camera = {
    X: 0,
    y: 0,
    targetX: 0,
    targety: 0,
    zoom: 1,
    ymin: 40,
    mode: "play",   // can be "planet"
    chasezoom: false,
    
    lookat: function (p) {
        this.X = this.targetX = p[0]
        this.y = this.targety = p[1]
    },
    settarget: function (p) {
        this.targetX = p[0]
        if (this.mode === "play") {
            this.targety = Math.max(p[1], this.ymin)
        } else if (this.mode === "planet") {
            this.targety = p[1] - gamestate.worldr
            this.chasezoom = true
        }
    },
    think: function (dt) {
        var f = 1 - Math.exp(-2.5 * dt)
        var dX = getdX(this.X, this.targetX), dy = this.targety - this.y
        if (this.targety > 1 + this.ymin) {
            var r = gamestate.worldr
            var px = (this.y + r) * Math.sin(this.X), py = (this.y + r) * Math.cos(this.X)
            var tx = (this.targety + r) * Math.sin(this.targetX), ty = (this.targety + r) * Math.cos(this.targetX)
            px += f * (tx - px)
            py += f * (ty - py)
            this.X = Math.atan2(px, py)
            this.y = Math.sqrt(px * px + py * py) - r
        } else if (Math.abs(dX) < 0.01 && Math.abs(dy) < 1) {
            this.X = this.targetX
            this.y = this.targety
        } else {
            this.X += f * dX
            this.y += f * dy
        }
        this.S = Math.sin(this.X)
        this.C = Math.cos(this.X)
        this.p0 = getpos(this.X, this.y)
        var z
        if (this.mode === "play") {
            z = Math.min(Math.max(0.4 * settings.sy / Math.max(1, this.y + gamestate.worldr), 0.1), 10)
        } else if (this.mode === "planet") {
            z = Math.min(settings.sy / Math.max(gamestate.worldr, 1) * 0.2, 10)
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
    // Convert world coordinates to screen coordinates
    // TODO: update this when we can have an x-offset plz thx
    worldtoscreen: function (X, y) {
        var p = getpos(X, y)
        var dx = p[0] - this.p0[0], dy = p[1] - this.p0[1]
        return [
            settings.sx / 2 + (dx * this.C + dy * -this.S) * this.zoom,
            settings.sy / 2 - (dx * this.S + dy * this.C) * this.zoom,
        ]
    },
    orient: function () {
        context.translate(settings.sx/2, settings.sy/2)
        context.scale(this.zoom, -this.zoom)
        context.translate(0, -this.y - gamestate.worldr)
        context.rotate(this.X)
    },
    // Is the position (X, y) within d units of a point that's currently visible?
    // TODO: needs work
    isvisible: function (X, y, d) {
        return true
        var p = getpos(X, y)
        var dx = p[0] - this.p0[0], dy = p[1] - this.p0[1]
        var r = (300 + d) / this.zoom
        return dx * dx + dy * dy < r * r
    },
    // Return the screen coordinates of the point that's closest to the given (cylindrical)
    // coordinates. The point must be at least d pixels from the edge, and null
    // will be returned if the point is already within this area.
    closestvisible: function (X, y, d) {
        d = d || 0
        var p = this.worldtoscreen(X, y)
        var px = p[0], cpx = clip(px, d, settings.sx - d)
        var py = p[1], cpy = clip(py, d, settings.sy - d)
        return px == cpx && py == cpy ? null : [cpx, cpy]
    }
}



