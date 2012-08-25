

var nheight = 16384, palt = 10
var altx0 = nheight * palt
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


function getheight(x) {
    x = (x % altx0 + altx0) % altx0
    var n0 = Math.floor(x / palt) % nheight
    var n1 = (n0 + 1) % nheight
    var d = x / palt - n0
    return heights[n0] * (1-d) + heights[n1] * d
}


function Island() {

}



