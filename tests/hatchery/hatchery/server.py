import tornado.ioloop
import tornado.web
from tornado import websocket
import settings
import json

sockets = []

class GameWebSocket(websocket.WebSocketHandler):
    def open(self):
    	sockets.append(self)
        print "Socket opened"

    def on_message(self, message):
    	print "Message received:", message

    def on_close(self):
        print "Socket closed"
        sockets.remove(self)


dt = 200
nframe = 0
def think():
	global nframe
	nframe += 1
	for socket in sockets:
		socket.write_message(json.dumps({"nframe": nframe}))



if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameWebSocket),
	])
	application.listen(settings.port)
	thinker = tornado.ioloop.PeriodicCallback(think, dt)
	thinker.start()
	tornado.ioloop.IOLoop.instance().start()

