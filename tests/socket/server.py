import tornado.ioloop
import tornado.web
from tornado import websocket
import shared
import json

goofballs = {}
secrets = {}

class EchoWebSocket(websocket.WebSocketHandler):
    def open(self):
    	g = shared.Goofball()
    	goofballs[g.name] = g
    	self.name = g.name
        self.write_message(json.dumps(g.getstate()))
        print "Goofball created:", self.name

    def on_message(self, message):
    	dx, dy = json.loads(message)
    	dx = 200 * cmp(dx, 0)
    	dy = 200 * cmp(dy, 0)
    	goofballs[self.name].move(dx, dy)
    	info = dict((g.name, g.getstate()) for g in goofballs.values())
        self.write_message(json.dumps(info))

    def on_close(self):
        print "Goofball removed:", self.name
        del goofballs[self.name]

application = tornado.web.Application([
    (r"/", EchoWebSocket),
])

dt = 50
def think():
	for name, goofball in goofballs.items():
		goofball.think(dt * 0.001)

if __name__ == "__main__":
	application.listen(shared.port)
	thinker = tornado.ioloop.PeriodicCallback(think, dt)
	thinker.start()
	tornado.ioloop.IOLoop.instance().start()

