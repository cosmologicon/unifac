import json, logging, tornado.ioloop, tornado.websocket, tornado.web, math
import settings, util, serverstate, player, update

log = logging.getLogger(__name__)

clienthandlers = {}

class GameHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		log.debug("WebSocket opened")
		self.username = None
	
	def on_message(self, message):
#		log.debug("Message received: %s" % message)
		try:
			message = parsemessage(message)
			mtype, args = message[0], message[1:]
			if mtype == "login":
				self.on_login(*args)
				return
			elif not self.username:
				return
			if mtype == "watch":
				self.on_watch(*args)
			elif mtype == "rotate":
				self.on_rotate(*args)
			elif mtype == "deploy":
				self.on_deploy(*args)
			elif mtype == "qrequest":
				self.on_qrequest(*args)
			elif mtype == "qaccept":
				self.on_qaccept(*args)
			elif mtype == "unlock":
				self.on_unlock(*args)
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
		self.you = serverstate.users[username]
		self.send("you", self.you.getstate())
		self.username = username
		if self.you.trained == 0:
			self.send("train", 0)
			self.you.trained = 1
		clienthandlers[username] = self
		serverstate.activeusers.add(username)
		state = serverstate.setwatch(username, 0, 0)
		self.send("state", state)
		self.send("monsters", [m.getstate() for m in serverstate.monsters.values()])

	def on_watch(self, x, y):
		x, y = [int(math.floor(a)) for a in (x, y)]
		serverstate.glock.acquire()
		tile = serverstate.gridstate.getrawtile(x, y)
		if not tile or tile.fog:
			return
		state = serverstate.setwatch(self.username, x, y)
		serverstate.glock.release()
		if state:
			self.send("state", state)

	def on_rotate(self, (x,y), dA):
		x, y, dA = int(x), int(y), int(dA)
		if not serverstate.canrotate(self.username, (x, y)):
			return
		act = serverstate.rotate((x, y), dA)
		serverstate.handleactivation(act, self.username)
		senddelta(serverstate.getdelta())
		self.send("you", self.you.getstate())
		if self.you.trained == 1 and self.you.coins >= 5:
			self.send("train", 1)
			self.you.trained = 2

	def on_deploy(self, (x,y), device):
		x, y, device = int(x), int(y), str(device)
		serverstate.deploy(self.username, (x,y), device)
		senddelta(serverstate.getdelta())
		self.send("you", self.you.getstate())

	def on_unlock(self, dname):
		dname = str(dname)
		serverstate.unlock(self.username, dname)
		self.send("you", self.you.getstate())

	def on_qrequest(self, (x,y)):
		p = int(x), int(y)
		qinfo = serverstate.questinfo(self.username, p)
		if not qinfo:
			self.error("Invalid quest")
			return
		self.send("qinfo", qinfo)

	def on_qaccept(self, (x,y), solo):
		p = int(x), int(y)
		solo = bool(solo)
		qinfo = serverstate.questinfo(self.username, p)
		if not qinfo:
			self.error("Invalid quest")
		serverstate.initquest(self.username, p, solo, qinfo)

	def qupdate(self, q):
		self.send("qupdate", q.progress, q.T)

	def qfinish(self, q):
		if q.complete:
			self.send("message", "Node successfully unlocked")
		else:
			self.send("message", "Node unlocking unsuccessful")
		self.send("you", self.you.getstate())

	def send(self, *args):
		self.write_message(json.dumps(args))
	
	def error(self, message=None):
		self.send("error", message)

def parsemessage(message):
	return json.loads(message)

def send(who, *args):
	if who not in clienthandlers:
		return
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
	serverstate.resetupdate()
	serverstate.think(0.5)
	if update.monsterdelta:
		sendall("monsters", update.monsterdelta)
	if update.effects:
		sendall("effects", update.effects)
	for q in update.quests:
		if q.who in clienthandlers:
			clienthandlers[q.who].qfinish(q)
	for q in serverstate.quests:
		if q.who in clienthandlers:
			clienthandlers[q.who].qupdate(q)
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

