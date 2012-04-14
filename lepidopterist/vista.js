// Controls the camera and the background

var vista = {
    cx: 0, cy: 0,  // Center of the viewport in world coordinates
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
            var py = this.worldpos([0, y])[1]
            if (py < 0) break
            context.moveTo(0, py)
            context.lineTo(settings.sx, py)
            context.stroke()
        }
        for (var x = Math.floor(this.worldpos([0, 0])[0] / 50) + 50 ; ; x += 50) {
            var p = this.worldpos([x, 0])
            if (p[0] > settings.sx) break
            context.moveTo(p[0], 0)
            context.lineTo(p[0], p[1])
            context.stroke()
        }
    },
}


