import logging

DEBUG = True
LOCALPLAY = True

host = "ws://localhost" if LOCALPLAY else "ws://universefactory.net"
port = 8516
url = "%s:%s" % (host, port)

loginname = None
loginfile = "login-%s.json" if loginname else "login.json"
resetlogin = True


screenx, screeny = 854, 480
hudx = 260
windowx = screenx - hudx

zooms = 24, 32, 40, 48, 60, 80

mindrag = 20

colors = (255,0,0), (0,0,255), (128, 0, 128)

# for d in `ls pyweek16/data/tile-320` ; do convert pyweek16/data/tile-320/$d -scale 25% pyweek16/data/tile-80/$d ; done
tileunit = 80
# convert pyweek16/data/tile-320/coin.png -scale 50% pyweek16/data/tile-80/resource.png


# Game mechanics - don't mess with these unless you're running your own server! It will break your game!
sectorsize = 40
horizonbuffer = 80  # Number of tiles beyond the edges of the fog to build
penumbra = 4   # Width of the fog fade line
watchradius = 60
watchstick = 40

devicesize = {
	"coin": 1,
	"wall": 1,
	"mine": 1,
	"shield": 1,
	"adjmine": 1,
	"1blast0": 1,
	"1blast1": 1,
	"1blast2": 1,
	"1blast3": 1,
	"1dshield0": 1,
	"1dshield1": 1,
	"1dshield2": 1,
	"1dshield3": 1,
	"4laser": 1,
	"2laser0": 1,
	"2laser1": 1,
	"1laser0": 1,
	"1laser1": 1,
	"1laser2": 1,
	"1laser3": 1,
}
eradius = {
	"4laser": 1,
	"2laser0": 2,
	"2laser1": 2,
	"1laser0": 4,
	"1laser1": 4,
	"1laser2": 4,
	"1laser3": 4,
	"adjmine": 1,
	"1blaster0": 2,
	"1blaster1": 2,
	"1blaster2": 2,
	"1blaster3": 2,
	"shield": 1,
	"1dshield0": 3,
	"1dshield1": 3,
	"1dshield2": 3,
	"1dshield3": 3,
}
devicexp = {
	"shuffle": 1,
	"wall": 1,

	"mine": 2,
	"adjmine": 2,
	"1blast0": 2,
	"1blast1": 2,
	"1blast2": 2,
	"1blast3": 2,

	"4laser": 3,
	"2laser0": 3,
	"2laser1": 3,
	"1laser0": 3,
	"1laser1": 3,
	"1laser2": 3,
	"1laser3": 3,

	"shield": 1,
	"1dshield0": 3,
	"1dshield1": 3,
	"1dshield2": 3,
	"1dshield3": 3,
}
devicecost = {
	"shuffle": 1,
	"wall": 3,

	"mine": 3,
	"adjmine": 5,
	"1blast0": 5,
	"1blast1": 5,
	"1blast2": 5,
	"1blast3": 5,

	"4laser": 6,
	"2laser0": 5,
	"2laser1": 5,
	"1laser0": 3,
	"1laser1": 3,
	"1laser2": 3,
	"1laser3": 3,

	"shield": 5,
	"1dshield0": 6,
	"1dshield1": 6,
	"1dshield2": 6,
	"1dshield3": 6,
}
devicereload = {
	"1blast0": 3,
	"1blast1": 3,
	"1blast2": 3,
	"1blast3": 3,

	"4laser": 1,
	"2laser0": 1,
	"2laser1": 1,
	"1laser0": 1,
	"1laser1": 1,
	"1laser2": 1,
	"1laser3": 1,
}
alwaysvulnerable = set([
	"shield",
	"1dshield0",
	"1dshield1",
	"1dshield2",
	"1dshield3",
])
ds = (-1,0), (0,-1), (1,0), (0,1)
regions = {
	"shield": list(ds),
	"1dshield0": [(0,-y) for y in (1,2,3)],
	"1dshield1": [(x,0) for x in (1,2,3)],
	"1dshield2": [(0,y) for y in (1,2,3)],
	"1dshield3": [(-x,0) for x in (1,2,3)],
	"4laser": list(ds),
	"2laser0": [(0,y) for y in (-1,1,-2,2)],
	"2laser1": [(x,0) for x in (-1,1,-2,2)],
	"1laser0": [(0,-y) for y in (1,2,3,4)],
	"1laser1": [(x,0) for x in (1,2,3,4)],
	"1laser2": [(0,y) for y in (1,2,3,4)],
	"1laser3": [(-x,0) for x in (1,2,3,4)],
	"mine": [(0,0)],
	"adjmine": [(0,0)] + list(ds),
}

basesdist = 2, 2, 2, 2, 3, 3, 4
basetdist = "resource ops scan supply".split() * 6 + ["record"]
basexp = 0, 0, 1, 4, 10
basecoins = 0, 0, 20, 40, 60
baserange = 0, 0, 10, 15, 20
questT = {
	"easy": 40,
	"medium": 60,
	"hard": 80,
	"boss": 200,
}
questr = {
	"easy": 5,
	"medium": 7,
	"hard": 9,
	"boss": 12,
}
questn = {
	"easy": 6,
	"medium": 15,
	"hard": 40,
	"boss": 100,
}

bosscode = "12345"


if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

