var dialogue = {
    script: [
        [
            "Day 1",
            "My name is Ajax Omari. I am a terraformer.",
            "While performing a routine terraforming on planet Horus 14045b, my ship was struck by an eletrical storm and fell into the ocean. I had to eject.",
            "My life support can hold out for some time, but without a ship, I don't see how I'm going anywhere.",
            "For now, I find myself on a land mass with one of the meteorological dissipation devices I installed before losing my ship.",
            "It's currently inactive, but If I can activate it, I should be safe from the lightning for now.",
        ],
        [
            "Day 2",
            "My ship still fails to respond to pings, even though my transponder signal should be able to penetrate many kilometers of fluid.",
            "Scans suggest that the ocean on this world is made of a previously unknown substance, which must cause massive electromagnetic interference.",
        ],
        [
            "Day 3",
            "Today, something came out of the ocean.",
            "This planet was certified devoid of life, and indeed the object doesn't register on any lifeform tests.",
            "You'd never know it wasn't alive to look at it, though.",
            "Whatever it is, it carries enough electromotive force to charge the terraforming devices I deployed.",
        ],
        [
            "Day 4",
            "Continued scans confirm that the objects coming from the ocean are made of the same material as the ocean itself.",
            "The computer refers to it as a mimeo-organic bio-electric plasmino.",
            "I've started calling them Morbels for short. Seems appropriate.",
        ],
    ],
    init: function () {
        this.jline = 0
        this.t = 0
        this.active = true
        this.alpha = 1
        this.settext()
    },
    settext: function () {
        var text = this.script[gamestate.stage][this.jline]
        var llen = 60
        this.texts = [text]
        while (this.texts[this.texts.length - 1].length > llen) {
            var t = this.texts[this.texts.length - 1]
            var a = t.lastIndexOf(" ", llen)
            this.texts[this.texts.length - 1] = t.substr(0, a)
            this.texts.push(t.substr(a))
        }
    },
    think: function (dt) {
        if (!this.active) return
        this.t += dt
        if (this.t > 2) {
            this.alpha -= 4 * dt
            if (this.alpha < 0) {
                this.alpha = 0
                this.t = 0
                this.jline += 1
                if (this.jline < this.script[gamestate.stage].length) {
                    this.settext()
                }
            }
        } else {
            this.alpha = Math.min(this.alpha + 4 * dt, 1)
        }
        if (this.jline >= this.script[gamestate.stage].length) {
            this.active = false
        }
    },
    draw: function () {
        if (!this.active) return
        context.save()
        UFX.draw("fs white ss black lw 1 alpha", this.alpha, "textalign center textbaseline middle")
        if (this.jline == 0) {
            context.clearRect(0, 0, settings.sx, settings.sy)
            context.translate(settings.sx / 2, settings.sy / 2)
            context.font = settings.fonts.stagetitle0
            context.fillText("CASTAWAY LOG", 0, -70)
            context.font = settings.fonts.stagetitle1
            context.fillText(this.texts[0], 0, 10)
        } else {
            context.translate(settings.sx / 2, settings.sy * 1.05)
            context.font = settings.fonts.dialogue
            this.texts.forEach(function (text, jtext, texts) {
                var y = (-texts.length + jtext) * 30
                context.strokeText(text, 0, y)
                context.fillText(text, 0, y)
            })
        }
        context.restore()
    },

}


