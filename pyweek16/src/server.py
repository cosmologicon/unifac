import json, logging, tornado.ioloop, tornado.websocket, tornado.web
import settings

log = logging.getLogger(__name__)

class GameHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		log.debug("WebSocket opened")
	
	def on_message(self, message):
		log.debug("Message received: %s" % message)
		self.write_message(json.dumps("response"))
		self.close()
		
	def on_close(self):
		log.debug("WebSocket closed")


if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameHandler),
	])
	application.listen(settings.port)
	tornado.ioloop.IOLoop.instance().start()

