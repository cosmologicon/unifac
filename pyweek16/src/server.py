import json, logging, tornado.ioloop, tornado.websocket, tornado.web
import settings, util, serverstate

log = logging.getLogger(__name__)

clienthandlers = {}

class GameHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		log.debug("WebSocket opened")
		self.username = None
	
	def on_message(self, message):
		log.debug("Message received: %s" % message)
		try:
			message = parsemessage(message)
			mtype, args = message[0], message[1:]
			if mtype == "login":
				self.on_login(*args)
				return
			elif not self.username:
				return
			if mtype == "rotate":
				self.on_rotate(*args)
			else:
				raise ValueError("Unrecognized message type %s" % mtype)
		except Exception:
			self.error("invalid message: %s" % message)
			raise

	def on_close(self):
		if self.username:
			serverstate.activeusers.remove(self.username)
		serverstate.removewatcher(self.username)
		log.debug("WebSocket closed %s" % self.username)

	def on_login(self, username):
		if not username:
			username = util.randomname()
			serverstate.users.add(username)
			self.send("login", username)
		elif username not in serverstate.users:
			self.error("invalid login: %s" % username)
			self.close()
			return
		self.username = username
		clienthandlers[username] = self
		serverstate.activeusers.add(username)
		state = serverstate.setwatch(username, 0, 0)
		self.send("state", state)

	def on_rotate(self, p, dA):
#		log.debug("rotating", p, dA)
		serverstate.rotate(self.username, p, dA)
		senddelta(serverstate.getdelta())

	def send(self, *args):
		self.write_message(json.dumps(args))
	
	def error(self, message=None):
		self.send("error", message)

def parsemessage(message):
	return json.loads(message)

def send(who, *args):
	clienthandlers[who].write_message(json.dumps(args))

def sendall(*args):
	message = json.dumps(args)
	for clienthandler in clienthandlers.values():
		clienthandler.write_message(message)

def senddelta(delta):
	log.debug("sending yon delta %s", len(delta))
	for client, gdelta in serverstate.breakdelta(delta).items():
		send(client, "delta", gdelta)

def closeall():
	for client in clienthandlers.values():
		if client.ws_connection:
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

