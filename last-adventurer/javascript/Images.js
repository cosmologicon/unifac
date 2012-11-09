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


function getimage(name) {
    switch (name) {
        case "adv": // generic adventurer
            var img = new gamejs.Surface([600, 600])
            img.blit(getpiece("noggin-0"))
            img.blit(getpiece("peepers-0"))
            return gamejs.transform.scale(img, [100, 100])

        case "dana": return gamejs.transform.scale(getpiece("dana-0"), [100, 100])
        case "lisa": return gamejs.transform.scale(getpiece("lisa-0"), [100, 100])
        case "theo": return gamejs.transform.scale(getpiece("theo-0"), [100, 100])
        case "rosa": return gamejs.transform.scale(getpiece("rosa-0"), [100, 100])
        case "mort": return gamejs.transform.scale(getpiece("mort-0"), [100, 100])


        case "monster":
            var img = new gamejs.Surface([100, 100])
            gamejs.draw.circle(img, "green", [50, 25], 25)
            return img
        case "bomb0":
            var img = new gamejs.Surface([60, 60])
            gamejs.draw.circle(img, "#440000", [30, 16], 16)
            return img
        case "bomb1":
            var img = new gamejs.Surface([60, 60])
            gamejs.draw.circle(img, "#AAAA00", [30, 16], 16)
            return img

        case "lump": return gamejs.transform.scale(getpiece("lump-0"), [100, 100])
        case "largelump": return gamejs.transform.scale(getpiece("lump-0"), [180, 180])
        case "hugelump": return gamejs.transform.scale(getpiece("lump-0"), [240, 240])
        case "spike": return gamejs.transform.scale(getpiece("spike-0"), [100, 100])
        case "largespike": return gamejs.transform.scale(getpiece("spike-0"), [180, 180])
        case "hugespike": return gamejs.transform.scale(getpiece("spike-0"), [240, 240])

        case "crystal-0":
            return gamejs.transform.scale(getpiece("crystal-0"), [400, 400])

        case "zoltar-4":
            return gamejs.transform.scale(getpiece("zoltar-1"), [300, 300])
        case "zoltar-3":
            return gamejs.transform.scale(getpiece("zoltar-1"), [200, 200])
        case "zoltar-2":
            return gamejs.transform.scale(getpiece("zoltar-1"), [150, 150])
        case "zoltar-1":
            return gamejs.transform.scale(getpiece("zoltar-0"), [120, 120])

        case "skull":
            return gamejs.transform.scale(getpiece("skull-0"), [300, 300])

        case "birdy-0":
            return gamejs.transform.scale(getpiece("birdy-0"), [300, 300])
        case "birdy-1":
            return gamejs.transform.scale(getpiece("birdy-1"), [300, 300])
        case "birdy-2":
            return gamejs.transform.scale(getpiece("birdy-2"), [300, 300])
        case "birdy-3":
            return gamejs.transform.scale(getpiece("birdy-3"), [300, 300])

    }
}


exports.getadvimage = getadvimage
exports.getimage = getimage

