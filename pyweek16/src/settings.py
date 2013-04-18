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
hudx = 240
windowx = screenx - hudx

zooms = 24, 32, 40, 48, 60, 80

mindrag = 20

colors = (255,0,0), (0,0,255), (128, 0, 128)

# for d in `ls pyweek16/data/tile-320` ; do convert pyweek16/data/tile-320/$d -scale 25% pyweek16/data/tile-80/$d ; done
tileunit = 80



# Game mechanics - don't mess with these unless you're running your own server!
# It WILL break your game!
sectorsize = 40
horizonbuffer = 80  # Number of tiles beyond the edges of the fog to build
penumbra = 4   # Width of the fog fade line
watchradius = 60
watchstick = 40

devicesize = {
	"eye": 2,
	"base": 3,
	"coin": 1,
	"power": 1,
	"wall": 1,
	"4laser": 1,
	"2laser0": 1,
	"2laser1": 1,
	"1laser0": 1,
	"1laser1": 1,
	"1laser2": 1,
	"1laser3": 1,
}
horizon = {
	"eye": 10,
}
eradius = {
	"eye": horizon["eye"] + penumbra,
	"4laser": 3,
	"2laser0": 3,
	"2laser1": 3,
	"1laser0": 3,
	"1laser1": 3,
	"1laser2": 3,
	"1laser3": 3,
}
devicecost = {
	"power": 1,
	"wall": 1,
	"4laser": 0,
	"2laser0": 0,
	"2laser1": 0,
	"1laser0": 0,
	"1laser1": 0,
	"1laser2": 0,
	"1laser3": 0,
}
devicereload = {
	"4laser": 0.5,
	"2laser0": 0.5,
	"2laser1": 0.5,
	"1laser0": 0.5,
	"1laser1": 0.5,
	"1laser2": 0.5,
	"1laser3": 0.5,
}
# devices that remain active when they've been activated once.
permanent = set([
	"eye",
])

alwaysvulnerable = set([
	"shield",
])
regions = {
	"shield": [(-1,0), (0,-1), (1,0), (0,1)],
	"4laser": [(-1,0),(-2,0),(-3,0),(0,-1),(0,-2),(0,-3),(1,0),(2,0),(3,0),(0,1),(0,2),(0,3)],
	"2laser0": [(-1,0),(-2,0),(-3,0),(1,0),(2,0),(3,0)],
	"2laser1": [(0,-1),(0,-2),(0,-3),(0,1),(0,2),(0,3)],
	"1laser0": [(0,-1),(0,-2),(0,-3)],
	"1laser1": [(1,0),(2,0),(3,0)],
	"1laser2": [(0,1),(0,2),(0,3)],
	"1laser3": [(-1,0),(-2,0),(-3,0)],
}


if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

