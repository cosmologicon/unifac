// Controls the camera and the background

var vista = {
    cx: 0, cy: 0,  // Center of the viewport in world coordinates
    tx: 0, ty: 0,  // Target coordinates
    z: 1,  // zoom factor
    
    screenpos: function (p) {
        return [settings.sx/2 + (p[0] - this.cx) / this.z,
                settings.sy/2 - (p[1] - this.cy) / this.z]
    },
    worldpos: function (p) {
        return [this.cx + this.z * (p[0] - settings.sx/2),
                this.cy - this.z * (p[1] - settings.sy/2)]
    },
    draw: function () {
        context.strokeStyle = "orange"
        for (var y = 0 ; ; y += 50) {
            var py = this.screenpos([0, y])[1]
            if (py < 0) break
            context.beginPath()
            context.moveTo(0, py)
            context.lineTo(settings.sx, py)
            context.stroke()
        }
        for (var x = Math.floor(this.worldpos([0, 0])[0] / 50) * 50 ; ; x += 50) {
            var p = this.screenpos([x, 0])
            if (p[0] > settings.sx) break
            context.beginPath()
            context.moveTo(p[0], 0)
            context.lineTo(p[0], p[1])
            context.stroke()
        }
    },
    think: function (dt) {
        var f = 1 - Math.exp(-4 * dt)
        this.cx += f * (this.tx - this.cx)
        this.cy += f * (this.ty - this.cy)
    },
    scootch: function (dx, dy) {
        this.tx += dx
        this.ty += dy
    },
    settarget: function (p) {
        this.tx = p[0]
        this.ty = p[1]
    },
}


