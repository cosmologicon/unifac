
story = []
tip = []


story[0] = [
    "Once upon a time in deep space there was a world named Tondie. Tondie was a friendly world, but very small. It was so small, in fact, that only one creature lived on Tondie. Her name was Zupe.",
    "Tondie and Zupe were the very best of friends, and not only because they didn't know anyone else. The fact is that they needed each other.",
    "Zupe needed a place to stand, after all. And Tondie needed Zupe to protect it from the gray creatures from space that would come to hurt it."
]
tip[0] = [
    "Control Zupe with the arrow keys or WASD. You can double-jump in the air, and kick by pressing down, space, or enter.",
    "Kicking takes time to recharge. You can see the meter in the upper-right. You can destroy the invaders by kicking them, or jumping on them.",
    "Zupe can't be hurt, but Tondie can!",
]

story[1] = [
    "Zupe wanted to protect Tonide, of course, but it was also great fun! She soon discovered clever ways to help her ward off the invaders."
]
tip[1] = [
    "Structure unlocked: Tower. Place a tower to reach new heights!"
]

story[2] = [
    "Zupe discovered a kind of structure that would heal Tondie's wounds. It was very important to her that she keep her best friend feeling happy."
]
tip[2] = [
    "Structure unlocked: Healer. Recovers Tondie's health over time.",
    "Tip: If you're eager for the next wave, you can enter fast-forward mode by holding down Backspace."
]

story[3] = [
    "One day, Zupe made the most amazing discovery of all. By collecting enough, she could actually make Tondie grow in size! There would be so much room for activities!",
    "Tondie was a little nervous about the idea at first, but finally agreed that it would be a good idea. So Zupe worked hard to collect enough."
]
tip[3] = [
    "To grow Tondie, keep the health above 90/100 and collect $400.",
    "Tip: If you want to get a wide view, hold down Shift."
]

story[4] = [
    "Tondie was amazed at how it felt to be larger. It never felt so strong! Tondie asked Zupe to please collect even more so that Tondie could grow again.",
    "They both agreed that this was the most fun they'd ever had together."
]
tip[4] = [
    "You can now purchase upgrades for your abilities and the structures you've built. You can grow Tondie again when you collect $600."
]



story[5] = [
    "Tondie was getting very big indeed, and the invaders seemed to be getting more and more fierce. Fortunately, Zupe's ingenuity persisted."
]
tip[5] = [
    "Structure unlocked: Bubbler. Creates bubbles to give you a boost when you need it."
]

story[6] = [
    "Tondie was finally starting to feel like a real planet. This had never happened before. It was a strange feeling, but Tondie knew this is what it wanted."
]
tip[6] = [
    "Structure unlocked: Launcher. Bounce off this to get a mighty boost."
]

story[7] = [
    "Zupe asked Tondie if it thought it was big enough now. When Tondie answered, Zupe almost didn't recognize it.",  
    "Instead of the voice of her friend, Zupe heard only a deep growl... MOOOOOREEEE PLEEEASE.",
    "She was surprised, but continued on her quest for more.",
]
tip[7] = [
    "Structure unlocked: Bomb Silo. This will launch a powerful bomb into orbit. Hit it when you're in a pinch."
]

story[8] = [
    "Tondie now grew so large that the Lord of all Invaders became jealous. The Invader's capital ship was dispatched to cut Tondie back down to size.",
    "Zupe knew that this was her ultimate test. If they defeated the capital ship, they would never be bothered again.",
    "Tondie said nothing."
]
tip[8] = [
    "Good luck!"
]

story[9] = [
    "We did it, Tondie! yelled Zupe. We'll be safe forever now!",
    "But Tondie didn't say anything.",
    "Tondie was no longer the tiny world that Zupe knew. Tondie was a full planet now. And planets live differently than you and I.",
    "Planets don't feel the passage of time, or the course of events on their surface.",
    "Planets don't have friends.",
    "",
    "News spread throughout the galaxy of the planet where the Lord of the Invaders was defeated.",
    "Before long, Zupe was not the only one living on Tondie. She saw many weary people come to this world of peace and happiness.",
    "Tondie might never be her friend again, but it would forever be her home.",
]
tip[9] = [
    "Thanks for playing!",
    "Please enjoy this unlimited kick ability. Use it wisely. Or just screw around and keep hitting space. Your call."
]


for (var j = 10 ; j < 20 ; ++j) {
    story[j] = ["Welcome to chapter " + j]
    tip[j] = []
}


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



