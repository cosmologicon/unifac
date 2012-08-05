
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
    new Level(300, 600, 6,  // triangle you have to reverse
        [[400, 350], [400, 550], [200, 550]]
    ),

    new Level(400, 400, 6,  // Diamond in the way
        [[400, 300], [500, 400], [400, 500], [300, 400]]
    ),

    new Level(200, 540, 8,  // two opposing triangles - move the one on the right
        [[100, 220], [300, 360], [100, 360]],
        [[500, 320], [300, 460], [500, 460]]
    ),

    new Level(300, 500, 10,  // oddly shaped triangle
        [[100, 400], [500, 300], [220, 600]]
    ),

    new Level(400, 400, 20,  // two long rectangles - make a hole in each
        [[40, 160], [760, 160], [760, 240], [40, 240]],
        [[40, 460], [760, 460], [760, 540], [40, 540]]
    ),

    new Level(100, 700, 10,  // long triangle to tunnel through
        [[20, 350], [20, 550], [780, 550]]
    ),

    new Level(300, 440, 6,  // square you have to carve a ramp out of 
        [[200, 200], [400, 200], [400, 400], [200, 400]]
    ),

    new Level(200, 600, 12,  // pyramid you have to split in two ways
        [[400, 480], [560, 580], [240, 580]]
    ),
]
