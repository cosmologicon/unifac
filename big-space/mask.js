// Shroud mask

var mask = {
    factor: 8,
    surf: undefined,

    
    make: function (xs, ys, rs) {
        var can = document.createElement("canvas")
        var con = can.getContext("2d")
        var px = can.width = settings.sx / this.factor
        var py = can.height = settings.sy / this.factor
        con.fillStyle = "white"
        con.fillRect(0, 0, px, py)
        for (var j = 0 ; j < xs.length ; ++j) {
            var x = xs[j]/this.factor, y = ys[j]/this.factor, r = rs[j]/this.factor
            var grad = con.createRadialGradient(x, y, 0, x, y, r)
            grad.addColorStop(0, "black")
            grad.addColorStop(0.65, "black")
            grad.addColorStop(1, "rgba(0,0,0,0)")
            con.fillStyle = grad
            con.fillRect(0, 0, px, py)
        }
        var idata = con.getImageData(0, 0, px, py)
        var data = idata.data
        for (var j = 0 ; j < 4*px*py ; j += 4) {
            data[j+3] = data[j]
            data[j+1] = 24
            data[j+2] = 24
            data[j] = 24
        }
        con.putImageData(idata, 0, 0)
        this.surf = document.createElement("canvas")
        this.surf.width = settings.sx
        this.surf.height = settings.sy
        var c = this.surf.getContext("2d")
        c.scale(this.factor, this.factor)
        c.drawImage(can, 0, 0)
    },

    draw: function () {
        context.drawImage(this.surf, 0, 0)
    },

}


