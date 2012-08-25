var camera = {
    targetx: -1,
    targety: 0,
    panfactor: 6.0,
    settarget: function (x, y) {
        this.targetx = x
        this.targety = y
    },
    think: function (dt) {
        if (this.targetx < 0) return
        var x = this.targetx - window.innerWidth / 2
        var y = this.targety - window.innerHeight / 2
        var x0 = document.body.scrollLeft
        var y0 = document.body.scrollTop
        var f = 1 - Math.exp(-this.panfactor * dt)
        window.scrollTo(x0 + (x - x0) * f, y0 + (y - y0) * f)
        var dx = document.body.scrollLeft - x0, dy = document.body.scrollTop - y0
        if (Math.abs(dx) + Math.abs(dy) < 3) {
            this.x = this.targetx
            this.y = this.targety
            this.targetx = -1
        }
    },

}


