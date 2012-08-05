
function Level(startx, endx, preptime) {
    this.startx = startx
    this.endx = endx
    this.preptime = preptime
    this.goalwidth = 100
    this.blocks = []
    for (var j = 3 ; j < arguments.length ; ++j) {
        this.blocks.push(arguments[j])
    }
}
Level.prototype = {
    points: function () {
        var ps = []
        for (var j = 0 ; j < this.blocks.length ; ++j) {
            var block = this.blocks[j]
            for (var k = 0 ; k < block.length ; ++k) {
                var k2 = (k + 1) % block.length
                var x0 = block[k][0], y0 = block[k][1]
                var x1 = block[k2][0], y1 = block[k2][1]
                var dx = x1 - x0, dy = y1 - y0
                var d = Math.sqrt(dx * dx + dy * dy)
                var n = Math.floor(d / settings.psep) + 1
                for (var h = 0 ; h < n ; ++h) {
                    ps.push([x0 + h * dx / n, y0 + h * dy / n])
                }
            }
        }
        return ps
    },
    trace: function (context) {
        UFX.draw(context, "b")
        for (var j = 0 ; j < this.blocks.length ; ++j) {
            var block = this.blocks[j]
            UFX.draw(context, "m", block[block.length - 1])
            for (var k = 0 ; k < block.length ; ++k) {
                UFX.draw(context, "l", block[k])
            }
        }
    },
}

var levels = [
    new Level(400, 400, 10, [[400, 300], [500, 400], [400, 500], [300, 400]]),
    new Level(300, 500, 20, [[100, 400], [500, 300], [220, 600]]),
]
