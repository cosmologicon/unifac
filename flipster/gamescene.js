var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.ball = {
        x: 200,
        y: 100,
        vx: 0,
        vy: 0,
        R: 40,
    }
    this.points = UFX.random.spread(40, 0.15, 600, 400, 0, 200)
}

GameScene.thinkargs = function (dt) {
    var clicked = false
    UFX.mouse.events().forEach(function (event) {
        if (event.type === "up") clicked = true
    })
    return [dt, UFX.mouse.pos, clicked]
}
GameScene.think = function (dt, mpos, clicked) {
    UFX.draw("fs blue fr 0 0", settings.sx, settings.sy)

    if (mpos) {
        UFX.draw("b o", mpos, 10, "ss white lw 1 s")
    }
    
    UFX.draw("b")
    this.points.forEach(function (point) {
        UFX.draw("o", point[0], point[1], 2)
    })
    UFX.draw("fs white f")
    
    if (clicked) {
        this.ball.x = mpos[0]
        this.ball.y = mpos[1]
        this.ball.vx = 0
        this.ball.vy = 0
    }
    this.ball.vy += 100 * dt
    this.ball.x += this.ball.vx * dt
    this.ball.y += this.ball.vy * dt
    
    var ball = this.ball
    this.points.forEach(function (point) {
        var x0 = point[0], y0 = point[1]
        var dx = x0 - ball.x, dy = y0 - ball.y
        if (dx * dx + dy * dy > ball.R * ball.R) return
        if (dx * ball.vx + dy * ball.vy <= 0) return
        var p = -1.5 * (ball.vx * dx + ball.vy * dy) / (dx * dx + dy * dy)
        ball.vx += p * dx
        ball.vy += p * dy
        var df = ball.R / Math.sqrt(dx * dx + dy * dy) - 1
        if (df > 0) {
            ball.x -= df * dx
            ball.y -= df * dy
        }
    })
    
    UFX.draw("b o", this.ball.x, this.ball.y, this.ball.R, "fs red f ss black lw 1.5 s")
    

}


