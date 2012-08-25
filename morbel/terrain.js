

var nheight = 16384, twidth = 10
var sealevel = -0.2
var altx0 = nheight * twidth
var heights = UFX.noise.wrap2d([nheight, 1], [256,8])


// 1-dimensional fractalization
function fractalize(h) {
    if (h.length == 1) return h
    var hsub = []
    for (var i = 0 ; i < h.length ; i += 2) {
        hsub.push(h[i])
    }
    hsub = fractalize(hsub)
    for (var i = 0 ; i < h.length ; ++i) {
        h[i] += hsub[i % hsub.length] / 2.0
    }
    return h
}
heights = fractalize(heights)
for (var j = 0 ; j < heights.length ; ++j) {
    heights[j] -= sealevel
    heights[j] *= 200
}


function getheight(x) {
    x = (x % altx0 + altx0) % altx0
    var n0 = Math.floor(x / twidth) % nheight
    var n1 = (n0 + 1) % nheight
    var d = x / twidth - n0
    return heights[n0] * (1-d) + heights[n1] * d
}


// the island that's above sea level at coordinate x
function Island(x) {
    var n0 = Math.floor(x / twidth + 0.5)
    while (getheight((n0 - 1) * twidth) > 0) n0 -= 1
    var n1 = n0
    while (getheight((n1 + 1) * twidth) > 0) n1 += 1
    this.n0 = n0  // min index that's above sea level
    this.n1 = n1  // max index that's above sea level
    var d = getheight(n0*twidth) / (getheight(n0*twidth)-getheight((n0-1)*twidth))
    this.xmin = ((n0-1)*d + n0*(1-d)) * twidth
    d = getheight(n1*twidth) / (getheight(n1*twidth)-getheight((n1+1)*twidth))
    this.xmax = ((n1+1)*d + n1*(1-d)) * twidth
    this.x = [this.xmin]
    this.y = [0]
    for (var n = n0 ; n <= n1 ; ++n) {
        var x = n * twidth, y = getheight(x)
        this.x.push(x)
        this.y.push(y)
    }
    this.x.push(this.xmax)
    this.y.push(0)
    this.n = this.x.length
}
Island.prototype = {
    isvisible: function () {
        return this.xmax > camera.xmin || this.xmin < camera.xmax
    },
    trace: function (pfac, nfac) {
        UFX.draw("( m", this.x[0], this.y[0])
        for (var j = 1 ; j < this.n ; ++j) {
            UFX.draw("l", this.x[j], this.y[j] * pfac)
        }
        for (var j = this.n - 1 ; j >= 1 ; --j) {
            UFX.draw("l", this.x[j], -this.y[j] * nfac)
        }
        UFX.draw(")")
    },
    draw: function () {
        UFX.draw("[")
        this.trace(1, settings.hfac)
        UFX.draw("clip fs rgb(120,60,0) f ] ss rgb(180,90,0) lw 6 s")
    },
    drawfootprint: function () {
        this.trace(settings.hfac, settings.hfac)
        context.miterLimit = 100
        var d = 20
        var t = (Date.now() % 2000) / 2000
        UFX.draw("ss rgba(255,255,255," + 0.08 * (1-t) + ") lw", d*(3+t), "s")
        UFX.draw("ss rgba(255,255,255,0.08)")
        UFX.draw("lw", d*(2+t), "s lw", d*(1+t), "s lw", d*t, "s")
    },
}

function explore(x0, x1) {

}
var islands = [new Island(0)]




