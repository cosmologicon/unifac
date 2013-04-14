import json, logging, tornado.ioloop, tornado.websocket, tornado.web
import settings, util

log = logging.getLogger(__name__)

clienthandlers = {}
users = set()
activeusers = set()

class GameHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		log.debug("WebSocket opened")
	
	def on_message(self, message):
		log.debug("Message received: %s" % message)
		try:
			message = parsemessage(message)
			mtype, args = message[0], message[1:]
			if mtype == "login":
				self.on_login(*args)
			else:
				raise ValueError("Unrecognized message type %s" % mtype)
		except Exception as exc:
			log.exception(exc)
			self.error("invalid message: %s" % message)

	def on_close(self):
		activeusers.remove(self.username)
		log.debug("WebSocket closed")

	def on_login(self, username):
		if not username:
			username = util.randomname()
			users.add(username)
			self.send("login", username)
		elif username not in users:
			self.error("invalid login: %s" % username)
			self.close()
			return
		self.username = username
		clienthandlers[username] = self
		activeusers.add(username)

	def send(self, *args):
		self.write_message(json.dumps(args))
	
	def error(self, message=None):
		self.send("error", message)

def parsemessage(message):
	return json.loads(message)


def closeall():
	for client in clienthandlers.values():
		client.close()



if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameHandler),
	])
	application.listen(settings.port)
	ioloop = tornado.ioloop.IOLoop.instance()
	try:
		ioloop.start()
	except KeyboardInterrupt:
		closeall()

