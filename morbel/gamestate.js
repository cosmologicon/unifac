var gamestate = {
    stage: 0,
    getpeaks: function () {
        if (this.stage == 0) {
            return [[0, 500, 260], [700, 200, 120]]
        } else if (this.stage == 1) {
            return [[0, 400, 220], [600, 240, 140], [-600, 200, 160]]
        }
    },
    getdevices: function () {
        if (this.stage == 0) {
            return []
        } else if (this.stage == 1) {
            return [new Device(-600), new Device(380)]
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
            console.log(morbels.length)
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
        }
    },
}

