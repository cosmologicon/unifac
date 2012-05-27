// Draw the world itself

var Twondy = {
    init: function () {
        this.s = 400
        this.texture = document.createElement("canvas")
        this.texture.width = this.texture.height = this.s
        var tcon = this.texture.getContext("2d")
        var idata = tcon.createImageData(this.s, this.s)
        var data = idata.data

        function nvalue(x, y, z) {
            return UFX.noise([x, y, z]) +
                   UFX.noise([2*x, 2*y, 2*z]) / 2. +
                   UFX.noise([4*x, 4*y, 4*z]) / 4. +
                   UFX.noise([8*x, 8*y, 8*z]) / 8.
        }

        for (var y = 0, j = 0 ; y < this.s ; ++y) {
            for (var x = 0 ; x < this.s ; ++x, j += 4) {
                var ax = (x - this.s/2.) / this.s*2, ay = (y - this.s/2.) / this.s*2
                var az = Math.sqrt(1 - Math.min(1, ax*ax + ay*ay))
                var d = Math.sqrt(Math.pow(ax-0.3,2) + Math.pow(ay-0.7,2))
                var v = Math.sin(6*nvalue(ax*3,ay*3,az*3) + (ax+ay+az)*7)
                var dv = (v - Math.sin(6*nvalue(ax*3+0.001,ay*3+0.001,az*3+0.001) + (ax+ay+az)*7)) * 1000
                var d = Math.sqrt(Math.pow(ax,2) + Math.pow(ay-1,2))
                var h = (-ax + ay + 2 * az) * 0.3 + 0.3
                if (v > 0) {
                    data[j] = 0
                    data[j+1] = Math.min(4000 * v, 255) * h * (1 + 0.01 * dv)
                    data[j+2] = 0
                } else {
                    data[j+2] = Math.min(-4000 * v, 255) * h * Math.max(Math.min(1, 2 + 2 * v), 0.3)
                    data[j] = 0
                    data[j+1] = 0
                }
                data[j+3] = 255
            }
        }
        tcon.putImageData(idata, 0, 0)
    },

    draw: function () {
        if (gamestate.worldsize < 1) return
        context.save()
        // Draw world
        var s = gamestate.worldr + 50 / Math.max(gamestate.worldr, 15)
        UFX.draw("z", s, s, "[ b o 0 0 1 clip")
        // Draw the background texture
        context.save()
        context.scale(2/this.s, 2/this.s)
        context.drawImage(this.texture, -this.s/2, -this.s/2)
        context.restore()
        // draw the eyes
        UFX.draw("[ lw 0.03 z 1 2 fs black b o 0.4 0.1 0.18 f b o -0.4 0.1 0.18 f ]")
        UFX.draw("fs white b o 0.35 0.3 0.05 f b o -0.45 0.3 0.05 f")
        // draw the border
        UFX.draw("] b o 0 0 1 ss black lw 0.01 s ]")
//        UFX.draw("b o 0 0 1 fs", this.stexture, "f lw 0.01 ss black s")
    },

}


