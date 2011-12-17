// Loading images is a bit complicated when there are so darn many

var gamejs = require('gamejs')

// Get a piece of something (possibly filtered or flipped
var pieces = {}
function getpiece(name, filter, hflip) {
    var key = name + "|" + (filter || "") + "|" + (hflip ? "y" : "n")
    if (pieces[key]) return pieces[key]
    if (hflip) {
        var img = gamejs.transform.flip(getpiece(name, filter), true, false)
    } else {
        // TODO: figure out how to get this working with trusted domain and all that
        if (filter) {
            var img = getpiece(name).clone()
            var arr = new gamejs.surfacearray.SurfaceArray(img)
            var s = img.getSize()
            for (var x = 0 ; x < s[0] ; ++x) {
                for (var y = 0 ; y < s[1] ; ++y) {
                    var color = arr.get(x, y)
                    var a = color[3], b = color[2]  // images are blue by default
                    arr.set(x, y, [b*filter[0], b*filter[1], b*filter[2], 255])
                }
            }
            img = new gamejs.Surface(s)
            gamejs.surfacearray.blitArray(img, arr)
        } else {
            var img = gamejs.image.load("img/" + name + ".png")
        }
    }    
    pieces[key] = img
    return img
}

// Get an adventurer image
function getadvimage(spec) {
    var img = new gamejs.Surface([600, 600])

    var flipped = true
    
//    img.blit(getpiece("foots-0", null, flipped))
    img.blit(getpiece("noggin-0", null, flipped))
    img.blit(getpiece("peepers-0", null, flipped))
    return gamejs.transform.scale(img, [100, 100])
}


exports.getadvimage = getadvimage

