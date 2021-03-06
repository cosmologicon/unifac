# Handle connections with the server in a separate thread
# Reference: https://pypi.python.org/pypi/websocket-client/

import threading, json, logging, zlib
from lib.websocket import websocket
import settings, util, clientstate, userinput, vista, menu, sound, data

log = logging.getLogger(__name__)

# The socket object through which we communicate
socket = None
socketthread = None

# Set this to False so that main knows to terminate the connection
playing = True
started = False

username = None

def think(dt):
	global started

	# Process local updates
	inp = userinput.get()
	if "quit" in inp:
		x, y = vista.p0()
		send("watch", x, y, True)
		stop()
	if "rotate" in inp:
		x, y, dA = inp["rotate"]
		if clientstate.canquest(x, y):
			send("qrequest", inp["mtile"])
		elif clientstate.gridstate.canrotate(x, y):
			if vista.selected and dA == 3:
				send("deploy", (x, y), vista.selected)
			else:
				vista.SpinTile(clientstate.gridstate.getbasetile(x, y), dA)
				clientstate.gridstate.rotate(x, y, dA)
				send("rotate", (x, y), dA)
	if "krotate" in inp:
		x, y, dA = inp["krotate"]
		if clientstate.gridstate.canrotate(x, y):
			vista.SpinTile(clientstate.gridstate.getbasetile(x, y), dA)
			clientstate.gridstate.rotate(x, y, dA)
			send("rotate", (x, y), dA)
	if "kdragx" in inp and (inp["kdragx"] or inp["kdragy"]):
		vista.kdrag(dt * inp["kdragx"], dt * inp["kdragy"])
	if "drag" in inp:
		if vista.drag(*inp["drag"]):
			send("watch", *vista.p0())
	if "scroll" in inp:
		vista.zoom(inp["scroll"], inp["scrollpos"])
	if "deploy" in inp:
		pos, device = inp["deploy"]
		if device in clientstate.you.unlocked:
			send("deploy", pos, device)
	if "cheat" in inp:
		send("cheat")
	if "screenshot" in inp:
		vista.screenshot()
	if "select" in inp and inp["select"]:
		if "qaccept" in inp["select"]:
			qinfo = menu.top().qinfo
			send("qaccept", qinfo["p"], ("solo" in inp["select"]))
			menu.pop()
		if inp["select"] == "cancel":
			menu.pop()
		if inp["select"] == "next":
			menu.advance()
		if not menu.stack:
			if settings.BOSS:
				pass
			elif "qaccept" in inp["select"]:
				if qinfo["t"] == "record":
					sound.playmusic("minima")
				else:
					sound.playmusic("cephalopod")
			else:
				sound.playmusic("space1990")
	if "hudclick" in inp:
		vista.handlehudclick(inp["hudclick"])
		if clientstate.canunlock(inp["hudclick"]):
			send("unlock", inp["hudclick"])
	vista.hudpoint = inp["hudpoint"] if "hudpoint" in inp else None
		


	# Process network updates
	for message in getmessages():
		message = parsemessage(message)
		#log.debug("message: %s", message)
		mtype, args = message[0], message[1:]
		if mtype == "login":
			login(*args)
		elif mtype == "message":
			print "message from server:", args[0]
			if args[0] in ("Node successfully unlocked", "Node unlocking unsuccessful"):
				clientstate.qstatus = None
			menu.loadmessage(*args)
		elif mtype == "you":
			clientstate.you.setstate(*args)
		elif mtype == "watch":
			vista.watch(*args)
		elif mtype == "completestate":
			clientstate.gridstate.setstate(*args)
			started = True
		elif mtype == "state":
			clientstate.gridstate.applystate(*args)
			started = True
		elif mtype == "delta":
			#log.debug("delta %s", args[0])
			clientstate.applydelta(*args)
		elif mtype == "monsters":
			#log.debug("monsters %s", args[0])
			clientstate.handlemonsters(*args)
		elif mtype == "effects":
			#log.debug("effects %s", args[0])
			clientstate.handleeffects(*args)
		elif mtype == "qinfo":
			#log.debug("quest info %s", args[0])
			menu.loadqinfo(*args)
		elif mtype == "qupdate":
			clientstate.qupdate(*args)
		elif mtype == "train":
			menu.loadtraining(*args)
			clientstate.you.trained = args[0]
		elif mtype == "cutscene":
			menu.loadcutscene(*args)
		elif mtype == "unlockboss":
			bosscode = args[0]
			open(data.filepath("bosscode.txt"), "w").write("%s\n" % bosscode)
			menu.loadunlockboss(bosscode)
		elif mtype == "error":
			log.warning("ERROR FROM SERVER: %s", args[0])

# Pending updates from the server
messages = []
mlock = threading.RLock()

# I think these should actually be atomic operations, but I'm not that familiar with threads
#   so let's stay on the safe side.
def getmessages():
	while messages:
		mlock.acquire()
		ret = messages.pop(0)
		mlock.release()
		yield ret
def addmessage(message):
	mlock.acquire()
	messages.append(message)
	mlock.release()

def send(*args):
	message = json.dumps(args)
	socket.send(message)
def parsemessage(message):
	if message[0] == "z":
		message = zlib.decompress(message[1:])
	return json.loads(message)
def login(uname, password):
	global username
	username = uname
	util.savelogin(uname, password)

class SocketThread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.stopevent = threading.Event()
	def run(self):
		global playing
		while not self.stopevent.isSet():
			try:
				message = socket.recv()
			except websocket.WebSocketConnectionClosedException:
				stop()
				break
			except Exception as err:
				if err.errno == 32:
					log.debug("Broken pipe")
				else:
					log.warning("exception %s %s" % (err, dir(err)))
				break
			if message is None:
				continue
			addmessage(message)
		stop()
	def stop(self):
		self.stopevent.set()
		socket.close()

def stop():
	global playing
	if socketthread:
		socketthread.stop()
	playing = False


# Object to handle the connection cleanly
class run(object):
	def __init__(self, uname, password):
		global username
		username = uname
		self.password = password
	def __enter__(self):
		global socket, socketthread
		socket = websocket.create_connection(settings.url)
		socketthread = SocketThread()
		socketthread.start()
		send("login", username, self.password)
	def __exit__(self, *args):
		socketthread.stop()
		socketthread.join()


class bossrun(object):
	def __init__(self, bosscode):
		self.bosscode = bosscode
	def __enter__(self):
		global socket, socketthread
		socket = websocket.create_connection(settings.bossurl)
		socketthread = SocketThread()
		socketthread.start()
		send("login", None, self.bosscode)
	def __exit__(self, *args):
		socketthread.stop()
		socketthread.join()



