import tornado.ioloop
import tornado.web
from tornado import websocket
import settings, gamestate
import json, time, traceback

sockets = []
passwords = {}
activeclients = {}
servermoves = {}
serverstate = gamestate.Gamestate()
gamestate.galaxy.create()
storks = {}
clientknowledge = {}
synct0s = {}

class GameWebSocket(websocket.WebSocketHandler):
	def open(self):
		self.clientname = None
		sockets.append(self)
		print "Socket opened"

	def on_message(self, message):
		try:
			obj = json.loads(message)
			mtype, args = obj[0], obj[1:]
			if mtype == "login":
				self.on_login(*args)
			elif mtype == "moves":
				self.on_moves(*args)
			elif mtype == "ping":
				self.on_ping(*args)
			elif mtype == "quit":
				self.on_quit(*args)
			else:
				raise ValueError
		except Exception as e:
			print traceback.format_exc()
			self.abort("Invalid message received: %s" % message)

	def on_login(self, name, password=None):
		if self.clientname:
			self.abort("Error logging in: already logged in as %s" % self.clientname)
			return
		if name is None:
			name = self.createaccount()
		else:
			if name not in passwords or passwords[name] != password:
				self.abort("Invalid login for %s" % name)
				return
		self.clientname = name
		activeclients[name] = self
		serverstate.addstork(storks[name])
		self.send("t0", nframe, t0)
		self.send("knowledge", gamestate.galaxy.getstate(clientknowledge[name]))
		self.send("state", nframe, serverstate.getstate())

	def on_moves(self, jframe, moves):
		jframe = int(jframe)
		moves = dict(moves)
		settings.validatemoves(moves)
		if jframe > nframe + 50:
			self.abort("Serious async")
		if jframe not in servermoves:
			servermoves[jframe] = {}
		servermoves[jframe][self.clientname] = moves

	def on_ping(self, clientnframe, clientt0, clienttframe):
		dt = 0.1 * (clientnframe - currentframe())
		self.send("pong", clientnframe, clienttframe, clientt0 + dt)
		synct0s[(self.clientname, clientnframe)] = clienttframe

	def on_quit(self):
		self.close()

	def createaccount(self):
		name, password = settings.randomname(), settings.randomname()
		passwords[name] = password
		self.send("logininfo", name, password)
		storks[name] = gamestate.randomstork(name)
		clientknowledge[name] = set(["hatchery"])
		return name

	def abort(self, reason):
		self.send("disconnect", reason)
		self.close()

	def send(self, *args):
		self.write_message(json.dumps(args))

	def on_close(self):
		sockets.remove(self)
		if self.clientname in activeclients:
			del activeclients[self.clientname]
			serverstate.removestork(self.clientname)

def send(who, *args):
	if who not in activeclients:
		return
	activeclients[who].send(*args)

def sendall(*args):
	for client in activeclients.values():
		client.send(*args)


dt = 100
nframe = 0
t0 = time.time() - 0.1 * nframe
def currentframe():
	return (time.time() - t0) / 0.1

def think():
	global nframe
	t = time.time()
	if currentframe() < nframe + 1:
		return
	# TODO: lock goes here
	#print "frame", nframe, len(activeclients)
	if nframe not in servermoves:
		servermoves[nframe] = {}
	nstate, spatch, kpatch = serverstate.advance(0.1, servermoves[nframe], clientknowledge)
	for (cname, jframe), clienttframe in list(synct0s.items()):
		if jframe <= nframe:
			send(cname, "lag", jframe, clienttframe)
			del synct0s[(cname, jframe)]
	sendall("moves", nframe, servermoves[nframe])
	for cname, statepatch in spatch.items():
		send(cname, "spatch", nframe, statepatch)
	for cname, knowpatch in kpatch.items():
		send(cname, "kpatch", knowpatch)
	del servermoves[nframe]
	nframe += 1



if __name__ == "__main__":
	application = tornado.web.Application([
		(r"/", GameWebSocket),
	])
	application.listen(settings.port)
	thinker = tornado.ioloop.PeriodicCallback(think, 40)
	thinker.start()
	tornado.ioloop.IOLoop.instance().start()

