import logging, random, sys

DEBUG = "--debug" in sys.argv
LOCALPLAY = "--local" in sys.argv
BOSS = "--boss" in sys.argv
ALLOWCHEAT = "--allowcheat" in sys.argv

host = "ws://localhost" if LOCALPLAY else "ws://universefactory.net"
port = 8516
bossport = 8616
url = "%s:%s" % (host, port)
bossurl = "%s:%s" % (host, bossport)
bosscode = None

serverstatedir = "serverstate"
serverstate0 = None
savetime = 3600

loginname = None
loginfile = "login-%s.json" if loginname else "login.json"
resetlogin = "--reset" in sys.argv


audio = "--noaudio" not in sys.argv
sound = "--nosound" not in sys.argv
music = "--nomusic" not in sys.argv

screenx, screeny = 854, 480
for arg in sys.argv:
	if arg.startswith("-r="):
		screenx, screeny = map(int, arg[3:].split("x"))
	if arg.startswith("-state0="):
		serverstate0 = arg[8:]
	if arg.startswith("--bosscode="):
		bosscode = arg[11:]
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
backgroundcoins = 100

devicesize = {
	"coin": 1,
	"wall": 1,
	"mine": 1,
	"shield": 1,
	"shuffle": 1,
	"adjmine": 1,
	"1blaster0": 1,
	"1blaster1": 1,
	"1blaster2": 1,
	"1blaster3": 1,
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
	"mine": 1,
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
	"wall": 2,

	"mine": 3,
	"adjmine": 8,
	"1blaster0": 20,
	"1blaster1": 20,
	"1blaster2": 20,
	"1blaster3": 20,

	"4laser": 20,
	"2laser0": 10,
	"2laser1": 10,
	"1laser0": 5,
	"1laser1": 5,
	"1laser2": 5,
	"1laser3": 5,

	"shield": 10,
	"1dshield0": 20,
	"1dshield1": 20,
	"1dshield2": 20,
	"1dshield3": 20,
}
devicecost = {
	"shuffle": 2,
	"wall": 3,

	"mine": 3,
	"adjmine": 5,
	"1blaster0": 5,
	"1blaster1": 5,
	"1blaster2": 5,
	"1blaster3": 5,

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
	"1blaster0": 3,
	"1blaster1": 3,
	"1blaster2": 3,
	"1blaster3": 3,

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
	"1blaster0": [(0,-y) for y in (1,2,3)],
	"1blaster1": [(x,0) for x in (1,2,3)],
	"1blaster2": [(0,y) for y in (1,2,3)],
	"1blaster3": [(-x,0) for x in (1,2,3)],
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
basetdist = "resource ops scan".split() * 4 + ["record"]
basexp = 0, 0, 3, 8, 20
basecoins = 0, 0, 20, 40, 60
baserange = 0, 0, 10, 15, 20
questT = {
	"easy": 30,
	"medium": 50,
	"hard": 50,
	"boss": 200,
#	"boss": 3,
}
questr = {
	"easy": 5,
	"medium": 7,
	"hard": 9,
	"boss": 12,
}
questn = {
	"easy": 7,
	"medium": 14,
	"hard": 28,
	"boss": 100,
}


if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

