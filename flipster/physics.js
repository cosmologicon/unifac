

// At what time will the ball at position (x, y) with radius R collide with the point (x0, y0)
//   if its velocity is (vx, vy)?
function pcolltime(x0, y0, x, y, vx, vy, R) {
    var a = vx * vx + vy * vy
    var b = 2 * (x - x0) * vx + 2 * (y - y0) * vy
    var c = (x - x0) * (x - x0) + (y - y0) * (y - y0) - R * R
    var D = b * b - 4 * a * c
    if (D <= 0) return null
    var t = (-b - Math.sqrt(D)) / (2 * a)
    if (t < 0) return null
    return t
}





