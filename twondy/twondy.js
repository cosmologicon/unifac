// Draw the world itself

var Twondy = {
    s: settings.twondytsize,
    init: function () {
        this.texture = document.createElement("canvas")
        this.texture.width = this.texture.height = this.s
        this.tcon = this.texture.getContext("2d")
        this.idata = this.tcon.createImageData(this.s, this.s)
        
        var px = 1/Math.sqrt(3), py = -px, pz = px // North pole unit vector
        var lx = -1/Math.sqrt(6), ly = 2*lx, lz = -lx // Light source unit vector
        
        this.lat = new Array(this.s * this.s)  // normal latitude
        this.hstripe = new Array(this.s * this.s)  // latitude-based height map
        this.gstripe = new Array(this.s * this.s)  // gradient of height map
        this.slat = new Array(this.s * this.s)   // shadow latitude
        this.hnoise = []                         // perlin noise-based height map
        this.hgrad = []                          // numerical graident of height map
        for (var a = 0 ; a < 5 ; ++a) {
            this.hnoise.push(new Array(this.s * this.s))
            this.hgrad.push(new Array(this.s * this.s))
        }

        var dg = 0.001  // numerical gradient factor
        for (var Y = 0, j = 0 ; Y < this.s ; ++Y) {
            var y = -(Y - this.s/2. + 0.5) / this.s * 2
            for (var X = 0 ; X < this.s ; ++X, ++j) {
                var x = (X - this.s/2. + 0.5) / this.s * 2
                var z = Math.sqrt(Math.max(1 - x*x - y*y, 0))
                var pr = px*x + py*y + pz*z
                var gx = x+(lr*x-lx)*dg, gy = y+(lr*y-ly)*dg, gz = z+(lr*z-lz)*dg
                var g = Math.sqrt(gx*gx + gy*gy + gz*gz)
                gx /= g ; gy /= g ; gz /= g

                this.lat[j] = Math.asin(Math.min(Math.max(pr, -1), 1))  // latitude
                this.hstripe[j] = Math.sin(9*this.lat[j])
                var gL = Math.asin(Math.min(Math.max(px*gx + py*gy + pz*gz, -1), 1))
                this.gstripe[j] = (Math.sin(9*gL) - this.hstripe[j]) / dg
                
                var lr = lx*x + ly*y + lz*z
                this.slat[j] = Math.asin(Math.min(Math.max(lr, -1), 1))
                for (var a = 0 ; a < 5 ; ++a) {
                    var f = 3 << a
                    var n = UFX.noise([f*(x+3), f*y, f*z]) / f
                    var m = UFX.noise([f*(gx+3), f*gy, f*gz]) / f
                    this.hnoise[a][j] = n
                    this.hgrad[a][j] = (m - n) / dg
                }
            }
        }
        this.settexture(0)
        

        // Wobble transformation parameters
        this.wobblet = 0
        this.a = 1  // Ellipse semi-x-axis (in units of worldr)
        this.b = 1  // Ellipse semi-y-axis (in units of worldr)
        this.beta = 0  // Overall rotation angle
        this.cprimex = 0  // Ellipse center in primed coordinates (units of worldr)
        this.cprimey = 0
        this.phi = 0  // Ellipse axial offset angle
    },

    settexture: function (h) {
        h = Math.min(Math.max(h, 0), 1)
        this.h = h
        var data = this.idata.data

        var fstripe = 0.1 * (1 - h) + 0.2
        var fshadow = 1.2
        var fnoise = [3*h, Math.max(4*h-1,0), Math.max(5*h-2,0), Math.max(6*h-3,0), Math.max(7*h-4,0)]
        var fgrad = 0.08 * h
        var fslat = 0.5
        var fbrown = 0.08 * h
        var fwhite = 0.02 * h
        var dshore = 0.02 * h
        var fdepth = Math.max(0.8 * h - 0.4, 0)
        var v0 = 0.04 * h
        for (var k = 0, j = 0 ; k < this.s * this.s ; ++k, j += 4) {
            var v = this.hstripe[k] * fstripe + v0
            for (var a = 0 ; a < 5 ; ++a) v += this.hnoise[a][k] * fnoise[a]
            var s = 1 - fshadow * (1.74 - this.slat[k]) / 3.14
            if (v > 0) {
                // Gradient factor
                var g = this.gstripe[k] * fstripe
                for (var a = 0 ; a < 5 ; ++a) g += this.hgrad[a][k] * fnoise[a]
                g = 1 + fgrad * g / (1 + fslat * Math.abs(this.slat[k]))
                // ice cap factor
                //var L = Math.abs(this.lat[k] / 1.73)
                //var w = L * L * fwhite
                data[j] = Math.min(8000 * (v + dshore) * fbrown, 255) * s * g
                data[j+1] = Math.min(8000 * (v + dshore), 255) * s * g
                data[j+2] = Math.min(8000 * (v + dshore) * fwhite, 255) * s * g
            } else {
                // Depth factor
                var d = 1 - Math.min(Math.max(-1*v-0.1, 0), fdepth)
                data[j] = 0
                data[j+1] = 0
                data[j+2] = Math.min(-8000 * (v - dshore), 255) * s * d
            }
            data[j+3] = 255
        }

        this.tcon.putImageData(this.idata, 0, 0)
    },
    
    beginwobble: function () {
        this.wobblet = 5
    },
    
    think: function (dt) {
        if (this.wobblet) {
            this.wobblet = Math.max(this.wobblet - dt, 0)
        }
        if (!this.wobblet) return

        var t = 5 - this.wobblet
        this.a = this.b = 1
        this.cprimex = this.cprimey = this.phi = this.beta = 0
        if (t < 1) {
        } else if (t < 2) {
            t -= 1
            this.a = 1 + 0.6 * Math.sqrt(t)
            this.b = 1 / this.a
            this.phi = 0.2 * Math.sin(16 * this.wobblet)
        } else if (t < 3) {
            t -= 2
            this.a = 1 + 0.6 * Math.cos(20 * t) * Math.exp(-8 * t)
            this.b = 1 / this.a
            this.phi = 0.2 * Math.sin(16 * this.wobblet)
        } else if (t < 4) {
            t -= 3
            this.a = 1 + 1.2 * Math.sqrt(t)
            this.b = 1 / this.a
            this.phi = 0.2
        } else if (t < 5) {
            t -= 4
            this.a = 1 + 1.2 * Math.cos(20 * t) * Math.exp(-8 * t)
            this.b = 1 / this.a
            this.phi = -0.2
            
/*            this.a = 1 + (t - 1) * (2 - t)
            this.b = 1/this.a
            this.cprimey = -this.b + 1
            this.phi = -5 * t*/
        } else if (t < 4) {
            t -= 3
            this.a = 1 + 0.2 * Math.cos(t * 20) * (1 - t)
            this.b = 1 / this.a
        }
    },

    draw: function () {
        if (gamestate.worldsize < 1) return
        context.save()
        // Overall scaling factor
        var s = gamestate.worldr + 50 / Math.max(gamestate.worldr, 15)
        UFX.draw("z", s, s)
        // Wobble transformation
        if (this.wobblet) {
            UFX.draw("r", this.beta + this.phi, "t", this.cprimex, this.cprimey,
                "z", this.a, this.b, "r", -this.phi)
        }
        // Draw world
        UFX.draw("[ b o 0 0 1 clip")
        // Draw the background texture
        context.save()
        context.scale(2/this.s, 2/this.s)
        context.drawImage(this.texture, -this.s/2, -this.s/2)
        context.restore()
        // draw the eyes
        var h = this.h, g = 1 - h, er = Math.max(0.08*g - 0.03, 0)
        h = 0 ; g = 1 ; er = 0.05
//        UFX.draw("[ b o 0", -2.3-this.h/2, "3 m 0 0 aa 0", -3.3+this.h/2, "3 0 6.3 clip")
        UFX.draw("[ lw 0.03 z 1", 2*g, "fs rgb(0,0," + Math.floor(100*h) + ") b o 0.4 0.1 0.18 f b o -0.4 0.1 0.18 f ]")
        UFX.draw("fs white b o 0.35", 0.3*g, er, "f b o -0.45", 0.3*g, er, "f")
        // draw the border
        UFX.draw("] b o 0 0 1 ss black lw 0.005 s ]")
//        UFX.draw("b o 0 0 1 fs", this.stexture, "f lw 0.01 ss black s")
    },

}


