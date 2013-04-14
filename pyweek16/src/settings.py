import logging

DEBUG = True
LOCALPLAY = True

host = "ws://localhost" if LOCALPLAY else "ws://universefactory.net"
port = 8516
url = "%s:%s" % (host, port)

loginname = None
loginfile = "login-%s.json" if loginname else "login.json"


# Game mechanics - don't mess with these unless you're running your own server!
# It WILL break your game!
sectorsize = 40




if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

