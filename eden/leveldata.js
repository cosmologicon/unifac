var leveldata = {
	// showcase defy 
	0: function () {
		blobs = [
			new Blob(100, -200, true),
			new Blob(-50, 100, false),
			new Blob(300, 200, true),
		]
		platforms = [
			new MultiPlatform(-220,160, -100,220, 100,220, 220,160),
			new MultiPlatform(0,380, 100,400, 350,370, 450,330, 480,200),
		]
		this.gems = [
		]
		this.turners = [
			new Turner(-200, 180, true, platforms[0]),
			new Turner(200, 180, false, platforms[0]),
			new Turner(100, 400, true, platforms[1]),
		]
		this.sincounts = {
			defy: 3,
			want: 0,
			rage: 0,
			gorge: 0,
			pride: 0,
			laze: 0,
		}
		this.xmin = -400 ; this.xmax = 600
		this.ymin = -100 ; this.ymax = 600
	},
	// showcase sins of excess
	1: function () {
		blobs = [
			new Blob(-300, -200, true),
			new Blob(-200, -400, false),
			new Blob(-100, -600, true),
			new Blob(0, -800, false),
			new Blob(100, -1000, true),
			new Blob(200, -1200, false),
			new Blob(0, -1400, true),
			new Blob(-100, -1600, false),
		]
		platforms = [
			new MultiPlatform(-450,390, -200,290, 10,200, 200,200, 310, 240),
		]
		this.gems = [
			new Gem(-800,0),
			new Gem(800,0),
		]
		this.turners = [
			new Turner(-400, 400, true, platforms[0]),
			new Turner(300, 200, false, platforms[0]),
		]
		this.sincounts = {
			defy: 0,
			want: 3,
			rage: 0,
			gorge: 3,
			pride: 3,
			laze: 0,
		}
		this.xmin = -1200 ; this.xmax = 1200
		this.ymin = -200 ; this.ymax = 600
	},
	// showcase rage
	2: function () {
		blobs = [
			new Blob(-400, -1000, true),
			new Blob(-300, -100, false),
			new Blob(120, -100, true),
			new Blob(300, -1000, false),
			new Blob(750, -1000, true),
			new Blob(850, -100, false),
		]
		platforms = [
			new MultiPlatform(-650,100, -640,300, -500,400, -300,480, -100,400, 100,270, 250,210, 410,300, 550,320,
				750,310, 910,270, 1010,180, 1090,-20),
		]
		this.gems = [
		]
		this.turners = [
			new Turner(-40, 350, false, platforms[0]),
			new Turner(40, 300, true, platforms[0]),
			new Turner(510, 350, false, platforms[0]),
			new Turner(600, 350, true, platforms[0]),
		]
		this.sincounts = {
			defy: 5,
			want: 0,
			rage: 5,
			gorge: 1,
			pride: 0,
			laze: 5,
		}
		this.xmin = -900 ; this.xmax = 1300
		this.ymin = -200 ; this.ymax = 700
	},
	// have to disable the defy sins to get them all together
	4: function () {
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
			new Turner(-450, 500, true, platforms[4]),
			new Turner(450, 500, false, platforms[5]),
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
	// Cross underneath with want and drop out the middle
	3: function () {
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
	// Multi-level rolling hills
	5: function () {
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
	// Nothing special, just one big level
	6: function () {
		blobs = [
			new Blob(-350,-200, false),
			new Blob(-300,-500, false),
			new Blob(-250,-800, false),
			new Blob(400,-200, false),
			new Blob(500,-800, false),
			new Blob(720,-300, false),
			new Blob(-250,500, false),
			new Blob(250,500, false),
			new Blob(400,450, false),
			new Blob(-800,500, false),
			new Blob(850,500, false),
			new Blob(950,450, false),
			new Blob(-900,900, false),
			new Blob(-800,900, false),
			new Blob(900,1000, false),
		]
		platforms = [
			new MultiPlatform(-750,100, -560,70, -470,110, -380,120, -270,110),
			new MultiPlatform(190,10, 200,190, 280,250, 380,270, 550,220, 680,180, 800,200, 900,300),
			new MultiPlatform(-510,390, -450,600, -260,690, -110,650, 10,630, 130,690, 310,690, 450,600, 500,400),
			new MultiPlatform(-1000,300, -900,600, -750,750, -390,800, -250,1000),
			new MultiPlatform(320,960, 690,810, 930,650, 1010,550, 1090,380),
			new MultiPlatform(-1360,920, -1280,900, -1150,980, -1120,1100, -1000,1200, -890,1300, -720,1350, -570,1340, -300,1420,
				80,1400, 280,1380, 650,1240, 810,1290, 990,1400, 1100,1400, 1200,1250, 1210,1000),
		]
		this.gems = [
			new Gem(0,-20),
			new Gem(0,980),
		]
		this.turners = [
			new Turner(-700,100, true, platforms[0]),
			new Turner(-350,150, false, platforms[0]),
			new Turner(850,250, false, platforms[1]),
			new Turner(-90,650, false, platforms[2]),
			new Turner(50,650, true, platforms[2]),
			new Turner(-500,850, false, platforms[3]),
			new Turner(500,900, true, platforms[4]),
			new Turner(-1250,900, true, platforms[5]),
			new Turner(-500,1350, false, platforms[5]),
			new Turner(-330,1400, true, platforms[5]),
		]

		this.sincounts = {
			defy: 2,
			want: 5,
			rage: 3,
			gorge: 2,
			pride: 4,
			laze: 3,
		}
		
		this.xmin = -1600 ; this.xmax = 1500
		this.ymin = -300 ; this.ymax = 1700
	},
}
