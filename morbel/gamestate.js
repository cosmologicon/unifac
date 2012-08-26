var gamestate = {
    stage: 1,
    getpeaks: function () {
        if (this.stage == 0) {
            return [[0, 500, 260], [700, 200, 120]]
        } else if (this.stage == 1) {
            return [[0, 400, 220], [600, 240, 140], [-600, 200, 160]]
        } else if (this.stage == 2) {
            return [[0, 300, 180], [1100, 400, 240], [-900, 350, 220]]
        } else if (this.stage == 3) {
            return [[0, 600, 320]]
        } else if (this.stage == 4) {
            return [[300, 400, 180], [1700, 200, 130], [2400, 500, 280]]
        } else if (this.stage == 6) {
            return [[0, 400, 300]]
        } else if (this.stage == 7) {
            return [[0, 300, 260]]
        }
    },
    getdevices: function () {
        if (this.stage == 0) {
            return []
        } else if (this.stage == 1) {
            return [new Device(-600), new Device(380)]
        } else if (this.stage == 2) {
            return [new Device(-1100), new Device(1100)]
        } else if (this.stage == 3) {
            return [new Tower(0)]
        } else if (this.stage == 4) {
            return [new Device(330), new Device(2300)]
        } else if (this.stage == 6) {
            return []
        } else if (this.stage == 7) {
            return []
        }
    },
    generatemorbels: function (dt) {
        if (this.stage == 0) {
            // no morbels in stage 0
        } else if (this.stage == 1) {
            morbels = morbels.filter(function (m) { return Math.abs(m.x) < 1200 })
            if (morbels.length < 8 && UFX.random(2) < dt) {
                morbels.push(new Hopper(UFX.random.choice([-800, 800])))
            }
        } else if (this.stage == 2) {
            morbels = morbels.filter(function (m) { return Math.abs(m.x) < 1800 })
            if (morbels.length < 32 && UFX.random(2) < dt) {
                morbels.push(new Hopper(UFX.random.choice([-1200, -600, 800, 1700])))
            }
            if (UFX.random(2) < dt) {
                morbels.push(new Flopper(UFX.random.choice([-600, 700])))
            }
        } else if (this.stage == 3) {
            morbels = morbels.filter(function (m) { return Math.abs(m.x) < 1800 })
            if (morbels.length < 18 && UFX.random(2) < dt) {
                morbels.push(new Flapper(UFX.random(-500, 500), UFX.random(200, 400)))
            }
        } else if (this.stage == 4) {
            morbels = morbels.filter(function (m) { return m.x > -400 && m.x < 3200 })
            while (morbels.length < 24) {
                var x = UFX.random(-400, 3200)
                if (getheight(x) < -20) {
                    morbels.push(new Whipper(x))
                }
                if (UFX.random() < 0.1) {
                    morbels.push(new Flopper(1000))
                }
            }
        } else if (this.stage == 6) {
            if (!morbels.length) {
                morbels.push(new Yapper(-200, "So you're God, huh? I figured you'd be taller."))
                morbels.push(new Yapper(200, "Wow you're more than a whole day old? You're ancient!"))
            }
        }


/*    if (morbels.length < 10 && UFX.random() < dt) {
        var x = UFX.random(camera.xmin, camera.xmax)
        if (getheight(x) < 0) {
//            morbels.push(new Hopper(x))
//            morbels.push(new Flopper(x))
//            morbels.push(new Gripper(x))
            morbels.push(new Whipper(x))
//            morbels.push(new Flapper(x, UFX.random(200, 300)))
//            morbels.push(new Yapper(x))
        }
    }*/


    },
    checkwin: function () {
        if (this.stage == 0) {
        } else if (this.stage == 1) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 2) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 4) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 7) {
            return !dialogue.active
        }
    },
}

