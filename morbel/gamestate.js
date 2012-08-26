var gamestate = {
    stage: 6,
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
        } else if (this.stage == 6) {
            return [[-2800, 200, 140], [-1700, 200, 250], [-1000, 350, 350], [100, 300, 200], [600, 300, 220], [1700, 400, 190], [2400, 400, 360]]
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
            return [new Device(330), new Tower(2300)]
        } else if (this.stage == 5) {
            return [new Device(-550), new Device(1550), new Barrier(-300), new Barrier(1200), new Barrier(1900)]
        } else if (this.stage == 6) {
            return [new Device(500), new Device (1600), new Tower(-1000), new Tower(2500), new Barrier(-1200), new Barrier(100)]
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
            if (morbels.length < 20) dt = 1
            if (UFX.random(5) < dt) morbels.push(new Flopper(800))
            if (UFX.random(1) < dt) {
                var x = UFX.random.choice([-200, 800, 1250, 1300, 1350, 3100, 3200])
                morbels.push(new Whipper(x))
            }
        } else if (this.stage == 5) {
            morbels = morbels.filter(function (m) { return m.x > -1100 && m.x < 2600 })
            if (morbels.length < 12) dt = 5
            if (UFX.random(12) < dt) morbels.push(new Gripper(2300))
            if (UFX.random(5) < dt) morbels.push(new Gripper(-800))
            if (UFX.random(2) < dt) morbels.push(new Gripper(200))
            if (UFX.random(5) < dt) morbels.push(new Gripper(600))
            if (UFX.random(10) < dt) morbels.push(new Whipper(600))
            if (UFX.random(15) < dt) morbels.push(new Whipper(2300))
            if (UFX.random(5) < dt) morbels.push(new Hopper(-800))
            if (UFX.random(5) < dt) morbels.push(new Hopper(200))
            if (UFX.random(5) < dt) morbels.push(new Hopper(600))
            if (UFX.random(5) < dt) morbels.push(new Hopper(2300))
            if (UFX.random(5) < dt) morbels.push(new Flopper(400))
            if (UFX.random(4) < dt) morbels.push(new Flapper(UFX.random(-1100, 2600), 600))
        } else if (this.stage == 6) {
            if (!morbels.length) {
                morbels.push(new Yapper(-2850, "So you're God, huh? I figured you'd be taller."))
                morbels.push(new Yapper(-1700, "Wow you're more than a whole day old? You're ancient!"))
                morbels.push(new Yapper(-700, "Wow you're more than a whole day old? You're ancient!"))
                morbels.push(new Yapper(300, "Wow you're more than a whole day old? You're ancient!"))
                morbels.push(new Yapper(1800, "Wow you're more than a whole day old? You're ancient!"))
                morbels.push(new Yapper(2700, "Wow you're more than a whole day old? You're ancient!"))
            }
            if (morbels.length < 50) dt = 1
            if (UFX.random(1) < dt) morbels.push(new Flapper(UFX.random(-2000, 500), 600))
            if (UFX.random(2) < dt) morbels.push(new Flapper(UFX.random(1200, 3000), 700))
            if (UFX.random(5) < dt) morbels.push(new Flopper(-400))
            if (UFX.random(5) < dt) morbels.push(new Flopper(1000))
            if (UFX.random(5) < dt) morbels.push(new Flopper(-2500))
            if (UFX.random(5) < dt) morbels.push(new Hopper(-2000))
            if (UFX.random(5) < dt) morbels.push(new Hopper(-400))
            if (UFX.random(5) < dt) morbels.push(new Hopper(-200))
            if (UFX.random(5) < dt) morbels.push(new Hopper(1000))
            if (UFX.random(5) < dt) morbels.push(new Hopper(1200))
            if (UFX.random(5) < dt) morbels.push(new Hopper(3000))
            if (UFX.random(20) < dt) morbels.push(new Whipper(-2000))
            if (UFX.random(20) < dt) morbels.push(new Whipper(-400))
            if (UFX.random(20) < dt) morbels.push(new Whipper(-200))
            if (UFX.random(20) < dt) morbels.push(new Whipper(1000))
            if (UFX.random(20) < dt) morbels.push(new Whipper(1200))
            if (UFX.random(20) < dt) morbels.push(new Whipper(3000))
            if (UFX.random(10) < dt) morbels.push(new Gripper(-2000))
            if (UFX.random(10) < dt) morbels.push(new Gripper(-400))
            if (UFX.random(10) < dt) morbels.push(new Gripper(-200))
            if (UFX.random(10) < dt) morbels.push(new Gripper(1000))
            if (UFX.random(10) < dt) morbels.push(new Gripper(1200))
        }
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
        } else if (this.stage == 5) {
            return devices[0].charges >= 3 && devices[1].charges >= 3
        } else if (this.stage == 6) {
            return devices[0].charges >= 3 && devices[1].charges >= 3 && devices[2].charges >= 3 && devices[3].charges >= 3
        } else if (this.stage == 7) {
            return !dialogue.active
        }
    },
}

