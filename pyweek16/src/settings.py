import logging

DEBUG = True
LOCALPLAY = True

host = "ws://localhost" if LOCALPLAY else "ws://universefactory.net"
port = 8516
url = "%s:%s" % (host, port)

loginname = None
loginfile = "login-%s.json" if loginname else "login.json"
resetlogin = True


screenx, screeny = 480, 480
mindrag = 20

colors = (255,0,0), (0,0,255)



# Game mechanics - don't mess with these unless you're running your own server!
# It WILL break your game!
sectorsize = 40
horizonbuffer = 40  # Number of tiles beyond the edges of the fog to build
penumbra = 4   # Width of the fog fade line
watchradius = 40

devicesize = {
	"eye": 2,
	"base": 3,
}
horizon = {
	"eye": 10,
}
eradius = {
	"eye": horizon["eye"] + penumbra,
}
# devices that remain active when they've been activated once.
permanent = set([
	"eye",
])


if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

