
story = []
tip = []


story[0] = [
    "Once upon a time in deep space there was a world named Tonde. Tonde was a friendly world, but very small. It was so small, in fact, that only one creature lived on Tonde. Her name was Zupe.",
    "Tonde and Zupe were the very best of friends, and not only because they didn't know anyone else. The fact is that they needed each other.",
    "Zupe needed a place to stand, after all. And Tonde needed Zupe to protect it from the gray creatures from space that would come to hurt it."
]
tip[0] = [
    "Control Zupe with the arrow keys or WASD. You can double-jump in the air, and kick by pressing down, space, or enter.",
    "Kicking takes time to recharge. You can see the meter in the upper-right. You can destroy the invaders by kicking them, or jumping on them.",
    "Zupe can't be hurt, but Tonde can!",
]

story[1] = [
    "Zupe wanted to protect Tonde, of course, but it was also great fun! She soon discovered clever ways to help her ward off the invaders."
]
tip[1] = [
    "Structure unlocked: Tower. Place a tower to reach higher heights!"
]


var CutScene = Object.create(GameScene)

CutScene.start = function () {
    this.story = story[gamestate.level]
    this.storyj = 0
    this.tip = tip[gamestate.level]
    this.tipj = -1
    CutSceneText.reset(this.story[this.storyj])
    this.t = 0
    GameScene.think(0)
    this.showingstory = true
    this.showingtip = false
}

CutScene.think = function (dt) {
    var that = this
    UFX.key.events().forEach(function (event) {
        if (event.type === "down" && (event.name === "enter" || event.name === "space")) {
            that.storyj += 1
            if (that.story[that.storyj]) {
                CutSceneText.reset(that.story[that.storyj])
            } else {
                that.showingstory = false
                that.showingtip = true
                that.tipj += 1
                if (that.tip[that.tipj]) {
                    TipText.reset(that.tip[that.tipj])
                } else {
                    UFX.scene.pop()
                }
            }
        }
    })
    this.t += dt
    if (this.showingstory) CutSceneText.think(dt)
    if (this.showingtip) TipText.think(dt)
}

CutScene.draw = function () {
    context.save()
    GameScene.draw()
    if (this.showingstory) CutSceneText.draw()
    if (this.showingtip) TipText.draw()
    context.restore()
}


var CutSceneText = {
    alpha: 0,
    t: 0,
    color0: "blue",
    reset: function (text) {
        this.alpha = 0
        this.t = 0
        this.texts = [text]
        while (this.texts[this.texts.length - 1].length > 26) {
            var t = this.texts[this.texts.length - 1]
            var a = t.lastIndexOf(" ", 26)
            this.texts[this.texts.length - 1] = t.substr(0, a)
            this.texts.push(t.substr(a))
        }
    },
    think: function (dt) {
        this.t += dt
        this.alpha = Math.min(Math.max(3 * this.t - 1, 0), 1)
    },
    draw: function () {
        context.fillStyle = "rgba(0, 0, 0, 0.8)"
        context.fillRect(0, 0, settings.sx, settings.sy)
        context.font = "40px Viga"
        context.fillStyle = this.color0
        context.strokeSTyle = "black"
        context.globalAlpha = this.alpha
        context.textAlign = "center"
        context.textBaseline = "middle"
        y = -21 * this.texts.length
        this.texts.forEach(function (text) {
            context.fillText(text, settings.sx/2, settings.sy/2 + y, settings.sx * 0.8)
            context.strokeText(text, settings.sx/2, settings.sy/2 + y, settings.sx * 0.8)
            y += 42
        })
    },
}

var TipText = Object.create(CutSceneText)
TipText.color0 = "gray"



