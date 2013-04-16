import json, logging, tornado.ioloop, tornado.websocket, tornado.web
import settings, util, serverstate, player

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
			elif mtype == "deploy":
				self.on_deploy(*args)
			else:
				raise ValueError("Unrecognized message type %s" % mtype)
		except Exception:
			self.error("invalid message: %s" % message)
			log.exception("Exception processing message: %s" % message)

	def on_close(self):
		if self.username:
			serverstate.activeusers.remove(self.username)
			del clienthandlers[self.username]
		serverstate.removewatcher(self.username)
		log.debug("WebSocket closed %s" % self.username)

	def on_login(self, username, password):
		if not username:
			username, password = util.randomname(), util.randomname(12)
			serverstate.users[username] = player.Player({"username": username})
			serverstate.passwords[username] = password
			self.send("login", username, password)
		elif username not in serverstate.passwords or serverstate.passwords[username] != password:
			self.error("invalid login: %s %s" % (username, password))
			self.close()
			return
		self.send("you", serverstate.users[username].getstate())
		self.username = username
		clienthandlers[username] = self
		serverstate.activeusers.add(username)
		state = serverstate.setwatch(username, 0, 0)
		self.send("state", state)
		self.send("monsters", [m.getstate() for m in serverstate.monsters])

	def on_rotate(self, p, dA):
		act = serverstate.rotate(p, dA)
		serverstate.handleactivation(act, self.username)
		senddelta(serverstate.getdelta())
		self.send("you", serverstate.users[self.username].getstate())

	def on_deploy(self, p, device):
		serverstate.deploy(self.username, p, device)
		senddelta(serverstate.getdelta())
		self.send("you", serverstate.users[self.username].getstate())

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
	if not delta:
		return
	for client, gdelta in serverstate.breakdelta(delta).items():
		send(client, "delta", gdelta)

def closeall():
	for client in clienthandlers.values():
		if client.ws_connection:
			client.close()

def think():
	delta = serverstate.think(0.5)
	if delta:
		sendall("monsters", delta)
	senddelta(serverstate.getdelta())


if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameHandler),
	])
	application.listen(settings.port)
	ioloop = tornado.ioloop.IOLoop.instance()
	tornado.ioloop.PeriodicCallback(think, 500).start()
	try:
		ioloop.start()
	except KeyboardInterrupt:
		closeall()

