var wordcache = {}
function drawwords (text, x, y, font, color0, color1, lw) {
    lw = lw || 1
    var key = JSON.stringify([text, font, color0, color1, lw])
    if (!wordcache[key]) {
        var c = document.createElement("canvas")
        var con = c.getContext("2d")
        con.font = font
        var m = con.measureText(text)
        c.width = m.width
        c.height = 300
        console.log([text, c.width, c.height, x, y])
        con.font = font
        UFX.draw(con, "b textalign left textbaseline middle fs", color0, "ss", color1, "lw", lw)
        con.fillText(text, 0, 150)
        con.strokeText(text, 0, 150)
        wordcache[key] = c
    }
    var c = wordcache[key]
    context.drawImage(c, x - c.width/2, y - c.height/2)
//    context.drawImage(c, 0, 0)
}

