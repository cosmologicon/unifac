import json, logging, tornado.ioloop, tornado.websocket, tornado.web, math, zlib
import settings, util, serverstate, player, update

log = logging.getLogger(__name__)

clienthandlers = {}

if settings.BOSS and not settings.bosscode:
	bosscode = util.randomname(10, "0123456789")
	bosscode = "12345"
	log.info("BOSS CODE: %s", bosscode)

class GameHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		log.debug("WebSocket opened")
		self.username = None
	
	def on_message(self, message):
		#log.debug("Message received: %s" % message)
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
			elif mtype == "cheat":
				self.on_cheat()
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
		if settings.BOSS:
			if password != settings.bosscode:
				self.error("Incorrect boss code!")
				self.close()
				return
			username = util.randomname()
			serverstate.users[username] = player.maxedplayer(username)
		elif not username:
			username, password = util.randomname(), util.randomname(12)
			serverstate.users[username] = player.Player({"username": username})
			serverstate.passwords[username] = password
			self.send("login", username, password)
		elif username not in serverstate.passwords or serverstate.passwords[username] != password:
			self.error("invalid login: %s %s" % (username, password))
			self.close()
			return
		log.debug("Log in: %s", username)
		self.you = serverstate.users[username]
		self.send("you", self.you.getstate())
		if username not in serverstate.pwatch:
			serverstate.pwatch[username] = (0,0)
		self.send("watch", *serverstate.pwatch[username])
		self.username = username
		if self.you.trained == 0:
			self.send("train", 0)
			self.you.trained = 1
		clienthandlers[username] = self
		serverstate.activeusers.add(username)
		x, y = serverstate.pwatch[username]
		state = serverstate.setwatch(username, x, y, True)
		self.send("state", state)
		self.send("monsters", [m.getstate() for m in serverstate.monsters.values()])

	def on_watch(self, x, y, force=False):
		if settings.BOSS:
			x, y = 0, 0
		x, y = [int(math.floor(a)) for a in (x, y)]
		serverstate.glock.acquire()
		tile = serverstate.gridstate.getrawtile(x, y)
		if not tile or tile.fog:
			return
		state = serverstate.setwatch(self.username, x, y, force)
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
		if not serverstate.canrotate(self.username, (x, y)):
			return
		act = serverstate.deploy(self.username, (x,y), device)
		if act:
			serverstate.handleactivation(act, self.username)
		senddelta(serverstate.getdelta())
		self.send("you", self.you.getstate())

	def on_unlock(self, dname):
		if settings.BOSS:
			return
		dname = str(dname)
		serverstate.unlock(self.username, dname)
		self.send("you", self.you.getstate())

	def on_qrequest(self, (x,y)):
		if settings.BOSS:
			return
		p = int(x), int(y)
		qinfo = serverstate.questinfo(self.username, p)
		if not qinfo:
			self.error("Invalid quest")
			return
		if str(qinfo["p"]) in self.you.unlocked:
			self.send("message", "Node already unlocked")
			return
		if qinfo["t"] == "record" and self.you.story >= 3:
			self.send("message", "Record already complete")
			return
		self.send("qinfo", qinfo)

	def on_qaccept(self, (x,y), solo):
		if settings.BOSS:
			return
		p = int(x), int(y)
		solo = bool(solo)
		qinfo = serverstate.questinfo(self.username, p)
		if not qinfo:
			self.error("Invalid quest")
			return
		if str(qinfo["p"]) in self.you.unlocked:
			self.send("message", "Node already unlocked")
			return
		serverstate.initquest(self.username, p, solo, qinfo)

	def qupdate(self, q):
		self.send("qupdate", q.progress, q.T)

	def qfinish(self, q):
		if q.complete:
			if settings.BOSS:
				self.send("ending")
			elif q.qinfo["story"]:
				if self.you.story == 2:
					self.you.trained = 4
					self.send("unlockboss", settings.bosscode)
				self.send("cutscene", self.you.story)
				self.you.story += 1
			elif self.you.xp and self.you.trained == 2:
				self.send("train", 2)
				self.you.trained = 3
			self.you.unlocked[str(q.qinfo["p"])] = True
			self.send("message", "Node successfully unlocked")
		else:
			self.send("message", "Node unlocking unsuccessful")
		self.send("you", self.you.getstate())

	def on_cheat(self):
		log.debug("cheating %s %s", self.username, [q.who for q in serverstate.quests])
		if settings.ALLOWCHEAT:
			for q in serverstate.quests:
				if q.who in (None, self.username):
					q.progress += 20

	def send(self, *args):
		message = json.dumps(args)
		if len(message) > 1000:
			zmessage = "z" + zlib.compress(message)
			log.debug("Compressing %s %s", len(message), len(zmessage))
			message = zmessage
			
		self.write_message(message)
	
	def error(self, message=None):
		log.debug("Sending error message to %s: %s" % (self.username, message))
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
	if update.effects:
		sendall("effects", update.effects)
	if update.monsterdelta:
		sendall("monsters", update.monsterdelta)
	for q in update.quests:
		if q.who in clienthandlers:
			clienthandlers[q.who].qfinish(q)
	for q in serverstate.quests:
		if settings.BOSS and not q.who:
			for clienthandler in clienthandlers.values():
				clienthandler.qupdate(q)
		elif q.who in clienthandlers:
			clienthandlers[q.who].qupdate(q)
	senddelta(serverstate.getdelta())


if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameHandler),
	])
	application.listen(settings.bossport if settings.BOSS else settings.port)
	ioloop = tornado.ioloop.IOLoop.instance()
	tornado.ioloop.PeriodicCallback(think, 500).start()
	try:
		ioloop.start()
	except KeyboardInterrupt:
		closeall()
		if not settings.BOSS:
			serverstate.save()

