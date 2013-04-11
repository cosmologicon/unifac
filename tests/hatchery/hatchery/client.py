# Handle the connection to the server asynchronously

from lib.websocket.websocket import create_connection
import json, random, time, threading, collections
import settings, gamestate, vista

sdata = []
clientname = None
started = False  # Set to true after we receive initial game state
playing = True

def processupdates():
	global clientname, playing, started
	for update in getupdates():
		utype, args = update[0], update[1:]
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
			lag(None, -2)
		elif utype == "state":
			setserverstate(*args)
			started = True
			lag(None, -2)
		elif utype == "kpatch":
			kpatch(*args)
		elif utype == "spatch":
			spatch(*args)
		elif utype == "moves":
			advanceserverstate(*args)
		elif utype == "lag":
			lag(*args)
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

def think():
	global localnframe, playing
	frame = currentframe()
	while frame > localnframe + 1:
		localmoves[localnframe], lmoves = settings.parsemoves()
		send("moves", localnframe, localmoves[localnframe])
		if "quit" in lmoves:
			playing = False
		localnframe += 1
		#lag(None, -0.003)
	state = gamestate.Gamestate()
	state.setstate(serverstate.getstate())
	frame0 = servernframe
	dframe = frame - frame0
	while frame > frame0:
		state.useradvance(0.1 * min(frame - frame0, 1), clientname, localmoves[frame0])
		frame0 += 1
	state.you = state.storks[clientname]
	return state

def jumpframe(nframe):
	global localnframe, t0
	if nframe > localnframe:
		localnframe = nframe
		t0 = time.time() - 0.1 * nframe

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

def lag(nframe, dt):
	global t0
	t0 -= dt
	if dt > 0:
		print "lag:", dt

class Rthread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self._stop = threading.Event()
	def run(self):
		while not self._stop.isSet():
			message = socket.recv()
			response = json.loads(message)
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



