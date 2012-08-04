var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.ball = {
        x: 200,
        y: 100,
        vx: 0,
        vy: 0,
        R: mechanics.ballR,
        oldx: 200,
        oldy: 100,
    }
    this.points = UFX.random.spread(500, 0.15, settings.sx, 400, 0, 200)
    this.tstill = 0
}

GameScene.thinkargs = function (dt) {
    var clicked = false
    UFX.mouse.events().forEach(function (event) {
        if (event.type === "up") clicked = true
    })
    return [dt, UFX.mouse.pos, clicked]
}
GameScene.think = function (dt, mpos, clicked) {    
    
    if (mpos && clicked) {
        this.points.forEach(function (point) {
            var dx = point[0] - mpos[0], dy = point[1] - mpos[1]
            if (dx * dx + dy * dy > 100 * 100) return
            point[0] -= 2 * dx
        })
    }
    
    var oldx = this.ball.x, oldy = this.ball.y
    if (this.tstill > 0.5 || this.ball.y > settings.sy + 100) {
        this.ball.x = UFX.random(100, settings.sx - 100)
        this.ball.y = 40
        this.ball.vx = 0
        this.ball.vy = 0
    }
    this.ball.vy += mechanics.g * dt
    this.ball.x += this.ball.vx * dt
    this.ball.y += this.ball.vy * dt
    
    var ball = this.ball
    this.points.forEach(function (point) {
        var x0 = point[0], y0 = point[1]
        var dx = x0 - ball.x, dy = y0 - ball.y
        if (dx * dx + dy * dy > ball.R * ball.R) return
        if (dx * ball.vx + dy * ball.vy <= 0) return
        var p = -(1 + mechanics.elasticity) * (ball.vx * dx + ball.vy * dy) / (dx * dx + dy * dy)
        ball.vx += p * dx
        ball.vy += p * dy
        var df = ball.R / Math.sqrt(dx * dx + dy * dy) - 1
        if (df > 0) {
            ball.x -= df * dx
            ball.y -= df * dy
        }
    })
    
    var dx = this.ball.x - oldx, dy = this.ball.y - oldy
    if (dx * dx + dy * dy < 0.01) {
        this.tstill += dt
    } else {
        this.tstill = 0
    }


    UFX.draw("fs blue fr 0 0", settings.sx, settings.sy)
    if (mpos) {
        UFX.draw("b o", mpos, 100, "ss white lw 1 s")
    }

    UFX.draw("b")
    this.points.forEach(function (point) {
        UFX.draw("o", point[0], point[1], 2)
    })
    UFX.draw("fs white f")


    UFX.draw("b o", this.ball.x, this.ball.y, this.ball.R, "fs red f ss black lw 1.5 s")
    

}


