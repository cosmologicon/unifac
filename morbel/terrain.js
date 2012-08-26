

var nheight = 1024, twidth = 10
var sealevel = 0
var altx0 = nheight * twidth
var hnoise = UFX.noise.wrap2d([nheight, 1], [32, 4])


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
hnoise = fractalize(hnoise)

function terraininit() {
    var peaks = gamestate.getpeaks()
    heights = []
    for (var j = 0 ; j < nheight ; ++j) {
        var h = -100
        for (var k = 0 ; k < peaks.length ; ++k) {
            var peak = peaks[k]
            var x0 = peak[0] / twidth, w = peak[1], h0 = peak[2]
            var dx = x0 - j
            while (dx < -nheight / 2) dx += nheight
            while (dx > nheight / 2) dx -= nheight
            var s = dx / w * twidth
            h += h0 * Math.exp(-s * s)
        }
        h += hnoise[j] * 40
        if (h < 0) h = -5 + h
        if (h > 0) h += 5
        if (h < -40) h = -40
        heights.push(h)
    }
}



function getheight(x, hmap) {
    hmap = hmap || heights
    x = (x % altx0 + altx0) % altx0
    var n0 = Math.floor(x / twidth) % nheight
    var n1 = (n0 + 1) % nheight
    var d = x / twidth - n0
    return hmap[n0] * (1-d) + hmap[n1] * d
}
function getgrad(x) {
    x = (x % altx0 + altx0) % altx0
    var n0 = Math.floor(x / twidth) % nheight
    var n1 = (n0 + 1) % nheight
    return (heights[n0] - heights[n1]) / twidth
}


// the island that's above sea level at coordinate x
function Island(x, hmap, zoom) {
    this.hmap = hmap
    this.zoom = zoom
    var n0 = Math.floor(x / twidth + 0.5)
    while (getheight((n0 - 1) * twidth, hmap) > 0) n0 -= 1
    var n1 = n0
    while (getheight((n1 + 1) * twidth, hmap) > 0) n1 += 1
    this.n0 = n0  // min index that's above sea level
    this.n1 = n1  // max index that's above sea level
    var d = getheight(n0*twidth, hmap) / (getheight(n0*twidth, hmap)-getheight((n0-1)*twidth, hmap))
    this.xmin = ((n0-1)*d + n0*(1-d)) * twidth
    d = getheight(n1*twidth, hmap) / (getheight(n1*twidth, hmap)-getheight((n1+1)*twidth, hmap))
    this.xmax = ((n1+1)*d + n1*(1-d)) * twidth
    this.x = [this.xmin]
    this.y = [0]
    for (var n = n0 ; n <= n1 ; ++n) {
        var x = n * twidth, y = getheight(x, hmap)
        this.x.push(x)
        this.y.push(y)
    }
    this.x.push(this.xmax)
    this.y.push(0)
    this.n = this.x.length
}
Island.prototype = {
    isvisible: function () {
        return this.xmax > camera.xmin && this.xmin < camera.xmax
    },
    trace: function (pfac, nfac) {
        var jmin = 0, jmax = this.n
        while (jmin + 1 < jmax && this.x[jmin+1] < camera.xmin - 4*twidth) jmin += 1
        while (jmax > jmin + 1 && this.x[jmax-1] > camera.xmax + 4*twidth) jmax -= 1
        if (jmin + 1 >= jmax) return
        UFX.draw("m", this.x[jmin], this.y[jmin])
        for (var j = jmin + 1 ; j < jmax ; ++j) {
            UFX.draw("l", this.x[j], this.y[j] * pfac)
        }
        for (var j = jmax - 1 ; j >= jmin ; --j) {
            UFX.draw("l", this.x[j], -this.y[j] * nfac)
        }
        UFX.draw("l", this.x[jmin+1], this.y[jmin+1] * pfac)
    },
    draw: function () {
        UFX.draw("[ b")
        this.trace(1, settings.hfac)
        UFX.draw("clip fs rgb(120,60,0) f ] ss rgb(180,90,0) lw 6 s")
    },
    drawfootprint: function () {
        this.trace(settings.hfac, settings.hfac)
    },
}

function drawwaves () {
    UFX.draw("b")
    islands.forEach(function (island) {
        if (island.isvisible) {
            island.trace(settings.hfac, settings.hfac)
        }
    })
    context.miterLimit = 100
    context.lineJoin = "miter"
    var d = 20
    var t = (Date.now() % 2000) / 2000
    UFX.draw("ss rgba(255,255,255," + 0.08 * (1-t) + ") lw", d*(3+t), "s")
    UFX.draw("ss rgba(255,255,255,0.08)")
    UFX.draw("lw", d*(2+t), "s lw", d*(1+t), "s lw", d*t, "s")
}

function explore(x0, x1) {
    while (x0 < exploredmin) {
        exploredmin -= twidth
        if (getheight(exploredmin) > 0) {
            var island = new Island(exploredmin, heights, 1)
            islands.push(island)
            exploredmin = island.xmin
        }
    }
    while (x1 > exploredmax) {
        exploredmax += twidth
        if (getheight(exploredmax) > 0) {
            var island = new Island(exploredmax, heights, 1)
            islands.push(island)
            exploredmax = island.xmax
        }
    }
}




