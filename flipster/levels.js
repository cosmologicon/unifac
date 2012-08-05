
function Level(startx, endx, preptime, goalwidth) {
    this.startx = startx
    this.endx = endx
    this.preptime = preptime
    this.goalwidth = goalwidth
    this.blocks = []
    for (var j = 4 ; j < arguments.length ; ++j) {
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
            UFX.draw(context, "l", block[0])
        }
    },
}

var levels = [
    new Level(300, 600, 6, 100,  // triangle you have to reverse
        [[400, 350], [400, 550], [200, 550]]
    ),

    new Level(400, 400, 6, 100,  // Diamond in the way
        [[400, 300], [500, 400], [400, 500], [300, 400]]
    ),

    new Level(700, 100, 6, 100,  // ramp you have to reverse
        [[750, 300], [750,500], [200, 500], [200, 450], [250, 450], [300, 400], [360, 400], [360, 450], [600, 450], [650,430], [700,400]]
    ),

    new Level(200, 540, 8, 100,  // two opposing triangles - move the one on the right
        [[100, 220], [300, 360], [100, 360]],
        [[500, 320], [300, 460], [500, 460]]
    ),

    new Level(300, 500, 10, 100,  // oddly shaped triangle
        [[100, 400], [500, 300], [220, 600]]
    ),

    new Level(200, 530, 24, 100,  // Diamond you have to place correctly
        [[600, 250], [700, 350], [600, 450], [500, 350]]
    ),

    new Level(400, 400, 20, 100,  // two long rectangles - make a hole in each
        [[40, 160], [760, 160], [760, 240], [40, 240]],
        [[40, 460], [760, 460], [760, 540], [40, 540]]
    ),

    new Level(100, 700, 10, 100,  // long triangle to tunnel through
        [[20, 350], [20, 550], [780, 550]]
    ),

    new Level(400, 400, 8, 100,  // two jagged concave hexagons
        [[20, 120], [440, 120], [440, 300], [280, 260], [280, 500], [20, 500]],
        [[780, 120], [520, 120], [520, 360], [360, 320], [360, 500], [780, 500]]
    ),

    new Level(300, 440, 6, 100,  // square you have to carve a ramp out of 
        [[200, 200], [400, 200], [400, 400], [200, 400]]
    ),

    new Level(150, 700, 3, 150,  // triangle you really have to launch way to the right from
        [[250, 350], [250, 550], [50, 550]]
    ),

    new Level(400, 400, 5, 100,  // slopes back and forth between two large blocks
        [[20, 120], [440, 120], [120, 240], [440, 360], [120, 480], [20, 480]],
        [[780, 120], [640, 120], [320, 240], [640, 360], [320, 480], [780, 480]]
    ),

    new Level(200, 600, 12, 100,  // pyramid you have to split in two ways
        [[400, 480], [560, 580], [240, 580]]
    ),

    new Level(650, 100, 14, 150,  // downward facing triangle
        [[550, 200], [750, 200], [650, 370]]
    ),

    new Level(-1000, 99999, 10000, 100,  // the end
[[250, 70], [302, 177], [421, 194], [335, 277], [355, 395], [250, 340], [144, 395], [164, 277], [78, 194], [197, 177]],
[[550, 220], [602, 327], [721, 344], [635, 427], [655, 545], [550, 490], [444, 545], [464, 427], [378, 344], [497, 327]]
    ),
]

