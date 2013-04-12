# Handle the connection to the server asynchronously

from lib.websocket.websocket import create_connection
import json, random, time, threading, collections
import settings, gamestate, vista

sdata = []
clientname = None
started = False  # Set to true after we receive initial game state
playing = True
ping = None
lag = None
servert0 = None


def processupdates():
	global clientname, playing, started, ping, lag, servert0, t0
	for update in getupdates():
		utype, args = update[0], update[1:]
#		if utype != "moves":
#			print utype, servernframe, localnframe, currentframe()
		if utype == "logininfo":
			settings.savelogindata(*args)
			clientname = args[0]
			continue
		elif not clientname:
			continue

		if utype == "knowledge":
			for worldstate in args[0]:
				if worldstate["name"] == "hatchery":
					print "knowledge:", worldstate
			gamestate.galaxy.setstate(args[0])
		elif utype == "state":
			setserverstate(*args)
			started = True
		elif utype == "kpatch":
			kpatch(*args)
		elif utype == "spatch":
			spatch(*args)
		elif utype == "moves":
			advanceserverstate(*args)
		elif utype == "t0":
			servert0 = args[0]
		elif utype == "pong":
			jframe, framet0, newt0 = args
			ping = int(1000 * (time.time() - framet0))
			newt0 -= 0.1
			if newt0 < t0:
#				print "pong sync", jframe, serverjframe, dt, time.time() - framet0, t0 - newt0, t0, newt0
				t0 = newt0
		elif utype == "lag":
			jframe, framet0 = args
			lag = int(1000 * (time.time() - framet0))
#			print "lag", jframe, framet0, lag
		elif utype == "sync":
			sync(*args)
		elif utype == "disconnect":
			print "Disconnecting...", args[0]
			playing = False


localmoves = collections.defaultdict(dict)
serverstate = None
servernframe = None

localnframe = 0
t0 = time.time() - 0.1 * localnframe
def currentframe():
	return (time.time() - t0) / 0.1
lag = None


def think():
	global localnframe, playing
	frame = currentframe()
#	print "thinking", frame
	while frame > localnframe + 1:
		if lag is None or localnframe % 30 == 0:
			send("ping", localnframe, t0, time.time())
		localmoves[localnframe], lmoves = settings.parsemoves()
		send("moves", localnframe, localmoves[localnframe])
		if "quit" in lmoves:
			playing = False
		if "map" in lmoves:
			settings.mapmode = not settings.mapmode
			if settings.mapmode:
				vista.makemap()
		localnframe += 1
#		print "advancing frame", localnframe, frame
		if settings.mapmode:
			vista.mapx0 += lmoves["dx"] * 20 if "dx" in lmoves else 0
			vista.mapy0 -= lmoves["dy"] * 20 if "dy" in lmoves else 0
	state = gamestate.Gamestate()
	state.setstate(serverstate.getstate())
	frame0 = servernframe
	dframe = frame - frame0
	while frame > frame0:
		state.useradvance(0.1 * min(frame - frame0, 1), clientname, localmoves[frame0])
		frame0 += 1
	state.you = state.storks[clientname]
	return state

estlag = 5000
def jumpframe(nframe):
	global localnframe, t0, estlag
	if nframe > localnframe:
		print "sync jump", nframe, localnframe, currentframe()
		localnframe = nframe + 2
		t0 = time.time() - 0.1 * localnframe
	dt = 100 * (currentframe() - nframe)
	estlag = 0.95 * estlag + 0.05 * dt
	

def setserverstate(nframe, sstate):
	global serverstate, servernframe
	servernframe = nframe
	jumpframe(nframe)
	serverstate = gamestate.Gamestate()
	serverstate.setstate(sstate)

def spatch(nframe, sstate):
	setserverstate(nframe+1, sstate)

def advanceserverstate(nframe, moves):
	global servernframe
	assert nframe == servernframe
	serverstate.localadvance(0.1, moves)
	servernframe += 1
	jumpframe(servernframe)

def kpatch(wstate):
	wname = wstate["name"]
	gamestate.galaxy.worlds[wname].setstate(wstate)

class Rthread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self._stop = threading.Event()
	def run(self):
		while not self._stop.isSet():
			message = socket.recv()
			if not message:
				continue
			try:
				response = json.loads(message)
			except (TypeError, ValueError):
				print "Failure to parse message: %s" % message
				raise
			sdata.append(response)
	def stop(self):
		self._stop.set()

def send(*args):
	socket.send(json.dumps(args))

def getupdates():
	while sdata:
		yield sdata.pop(0)

class run(object):
	def __init__(self, name, password=None):
		self.name, self.password = name, password
	def __enter__(self):
		global rthread, socket, clientname
		socket = create_connection(settings.clientpath)
		send("login", self.name, self.password)
		if self.name:
			clientname = self.name
		rthread = Rthread()
		rthread.start()
	def __exit__(self, ttype, value, tback):
		rthread.stop()
		rthread.join()



