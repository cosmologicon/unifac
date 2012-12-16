var leveldata = {
	0: function () {
		blobs = [
			new Blob(100, -200, true),
			new Blob(-50, 100, false),
		]
		platforms = [
			new MultiPlatform(-220,160, -100,220, 100,220, 220,160),
		]
		this.gems = [
		]
		this.turners = [
			new Turner(-200, 180, true, platforms[0]),
			new Turner(200, 180, false, platforms[0]),
		]
		this.sincounts = {
			defy: 10,
			want: 0,
			rage: 0,
			gorge: 0,
			pride: 0,
			laze: 0,
		}
		this.xmin = -400 ; this.xmax = 400
		this.ymin = -100 ; this.ymax = 400
	},
	3: function () {
		blobs = [
			new Blob(100, -200, true),
			new Blob(-50, 100, false),
			new Blob(80, 300, true),
			new Blob(-100, 400, false),
			new Blob(0, 700, true),
		]
		platforms = [
			new MultiPlatform(-220,160, -100,220, 100,220, 220,160),
			new MultiPlatform(-510,190, -400,300, -220,380),
			new MultiPlatform(220,380, 400,300, 510,190),
			new MultiPlatform(-260,520, -100,510, 100,510, 260,520),
			new MultiPlatform(-520,520, -390,650, -270,690, -100,700),
			new MultiPlatform(100,700, 270,690, 390,650, 520,520),
			new MultiPlatform(-900,400, -870,630, -810,830, -720,920, -600,970, -470,900, -440,800, -350,770, -280,800, -220,900, -100,990,
				100,990, 220,900, 280,800, 350,770, 440,800, 470,900, 600,970, 720,920, 810,830, 870,630, 900,400),
		]
		this.gems = [
		]
		this.turners = [
			new Turner(-200, 180, true, platforms[0]),
			new Turner(200, 180, false, platforms[0]),
			new Turner(-500, 200, true, platforms[1]),
			new Turner(500, 200, false, platforms[2]),
			new Turner(-200, 500, true, platforms[3]),
			new Turner(200, 500, false, platforms[3]),
			new Turner(-500, 500, true, platforms[4]),
			new Turner(500, 500, false, platforms[5]),
		]
		this.sincounts = {
			defy: 10,
			want: 0,
			rage: 1,
			gorge: 1,
			pride: 0,
			laze: 10,
		}
		this.xmin = -1100 ; this.xmax = 1100
		this.ymin = -100 ; this.ymax = 1200
	},
	2: function () {
		blobs = [
			new Blob(100, -200, false),
			new Blob(0, -600, true),
			new Blob(-100, -1000, false),
			new Blob(0, -1200, true),
		]
		platforms = [
			new MultiPlatform(-900, -200, -980, 0, -980, 200, -860, 380, -710, 400, -520, 400, -390, 260, -120, 120,
				120, 120, 390, 260, 520, 400, 710, 400, 860, 380, 980, 200, 980, 0, 900, -200),
		]
		this.gems = [
			new Gem(700, 0),
		]
		this.turners = [
			new Turner(250, 200, true, platforms[0]),
			new Turner(-250, 200, false, platforms[0]),
		]
		this.sincounts = {
			defy: 10,
			want: 10,
			rage: 0,
			gorge: 0,
			pride: 0,
			laze: 0,
		}
		this.xmin = -1200 ; this.xmax = 1200
		this.ymin = -300 ; this.ymax = 700
	},
	1: function () {
		blobs = [
			new Blob(950, 0, false),
			new Blob(1000, -100, true),
			new Blob(1650, 0, true),
			new Blob(1720, -300, false),
			new Blob(500, 400, true),
			new Blob(1600, 300, false),
			new Blob(1700, 300, false),
			new Blob(1100, 800, false),
		]
		platforms = [
			new MultiPlatform(1300, 100, 1680, 80, 1880, 120),
			new MultiPlatform(720, 290, 920, 180, 1110, 200, 1270, 300, 1450, 330),
			new MultiPlatform(1170, 590, 1700, 480, 1960, 350, 2100, 0),
			new MultiPlatform(50, 50, 280, 150, 380, 220, 400, 400, 620, 500, 820, 500, 920, 600, 940, 800, 1400, 1000, 1950, 900, 2020, 770, 2050, 580, 2200, 450),
		]
		this.gems = [
		]
		this.turners = [
			new Turner(1550, 50, true, platforms[0]),
			new Turner(1850, 100, false, platforms[0]),
			new Turner(750, 300, true, platforms[1]),
			new Turner(1450, 350, false, platforms[1]),
			new Turner(1350, 550, true, platforms[2]),
			new Turner(844, 500, false, platforms[3]),
		]

		this.sincounts = {
			defy: 4,
			want: 0,
			rage: 1,
			gorge: 2,
			pride: 3,
			laze: 4,
		}
		
		this.xmin = -100 ; this.xmax = 2300
		this.ymin = -100 ; this.ymax = 1100
	},
}
