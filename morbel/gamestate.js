var gamestate = {
    stage: 3,
    getpeaks: function () {
        if (this.stage == 0) {
            return [[300, 500, 100], [-300, 300, 150], [-800, 300, 100]]
        } else if (this.stage == 1) {
            return [[0, 400, 220], [600, 240, 140], [-600, 200, 160]]
        } else if (this.stage == 2) {
            return [[0, 300, 180], [1100, 400, 240], [-900, 350, 220]]
        } else if (this.stage == 3) {
            return [[0, 600, 240], [1400, 400, 150], [2200, 400, 350]]
        } else if (this.stage == 4) {
            return [[300, 400, 180], [1700, 200, 130], [2400, 500, 280]]
        } else if (this.stage == 5) {
            return [[-300, 300, 140], [-300, 600, 100], [1100, 400, 200], [2000, 400, 200]]
        } else if (this.stage == 7) {
            return [[0, 300, 260]]
        }
    },
    getdevices: function () {
        if (this.stage == 0) {
            return [new Device(-150)]
        } else if (this.stage == 1) {
            return [new Device(-600), new Device(380)]
        } else if (this.stage == 2) {
            return [new Device(-1100), new Device(1100)]
        } else if (this.stage == 3) {
            return [new Tower(0), new Tower(2000)]
        } else if (this.stage == 4) {
            return [new Device(330), new Device(2300)]
        } else if (this.stage == 5) {
            return [new Device(-550), new Device(1550), new Barrier(-300), new Barrier(1200), new Barrier(1900)]
        } else if (this.stage == 7) {
            return []
        }
    },
    generatemorbels: function (dt) {
        if (this.stage == 0) {
            if (UFX.random(2) < dt) {
                var x = UFX.random(-1000, 1000)
                if (Math.abs(x - 150) > 350) {
                    morbels.push(new Zapper(x, 450))
                }
            }
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
            if (morbels.length < 20) dt = 5
            if (UFX.random(5) < dt) morbels.push(new Flopper(800))
            if (UFX.random(1) < dt) morbels.push(new Flapper(UFX.random(-1100, 2800), 600))
        } else if (this.stage == 4) {
            morbels = morbels.filter(function (m) { return m.x > -400 && m.x < 3200 })
            while (morbels.length < 24) {
                var x = UFX.random(-400, 3200)
                if (getheight(x) < -20) {
                    morbels.push(new Whipper(x))
                }
            }
        } else if (this.stage == 5) {
            morbels = morbels.filter(function (m) { return m.x > -1100 && m.x < 2600 })
            if (morbels.length < 12) dt = 5
            if (UFX.random(5) < dt) morbels.push(new Gripper(2300))
            if (UFX.random(5) < dt) morbels.push(new Gripper(-800))
            if (UFX.random(2) < dt) morbels.push(new Gripper(200))
            if (UFX.random(5) < dt) morbels.push(new Gripper(600))
            if (UFX.random(10) < dt) morbels.push(new Whipper(600))
            if (UFX.random(10) < dt) morbels.push(new Whipper(2300))
            if (UFX.random(5) < dt) morbels.push(new Hopper(-800))
            if (UFX.random(5) < dt) morbels.push(new Hopper(200))
            if (UFX.random(5) < dt) morbels.push(new Hopper(600))
            if (UFX.random(5) < dt) morbels.push(new Hopper(2300))
            if (UFX.random(5) < dt) morbels.push(new Flopper(400))
            if (UFX.random(4) < dt) morbels.push(new Flapper(UFX.random(-1100, 2600), 600))
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
            return devices[0].charges >= 3
        } else if (this.stage == 1) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 2) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 3) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 4) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 7) {
            return !dialogue.active
        }
    },
}

