import logging

DEBUG = True

host = "ws://universefactory.net"
port = 8516
url = "%s:%s" % (host, port)



if DEBUG:
	logging.basicConfig(
		format = "%(asctime)s %(levelname)s %(filename)s:%(lineno)d | %(message)s",
		level=logging.DEBUG,
	)

