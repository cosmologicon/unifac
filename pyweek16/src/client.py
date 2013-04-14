# Handle connections with the server in a separate thread
# Reference: https://pypi.python.org/pypi/websocket-client/

import threading, json, logging
from lib.websocket import websocket
import settings, util, clientstate, userinput

log = logging.getLogger(__name__)

# The socket object through which we communicate
socket = None
socketthread = None

# Set this to False so that main knows to terminate the connection
playing = True
started = False

username = None


def think():
	global started

	# Process local updates
	inp = userinput.get()
	if "quit" in inp:
		stop()
	if "leftclick" in inp:
		send("rotate", inp["leftclick"], 1)

	# Process network updates
	for message in getmessages():
		message = parsemessage(message)
		mtype, args = message[0], message[1:]
		if mtype == "login":
			login(*args)
		elif mtype == "completestate":
			clientstate.gridstate.setstate(*args)
			started = True

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
	return json.loads(message)
def login(uname):
	global username
	username = uname
	util.savelogin(uname)

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
			except Exception as e:
				log.warning("exception %s %s" % (e, dir(e)))
				break
			if message is None:
				continue
			addmessage(message)
		stop()
	def stop(self):
		log.debug("Stopping socket thread")
		self.stopevent.set()
		socket.close()

def stop():
	global playing
	if socketthread:
		socketthread.stop()
	playing = False


# Object to handle the connection cleanly
class run(object):
	def __init__(self, uname):
		global username
		username = uname
	def __enter__(self):
		global socket, socketthread
		socket = websocket.create_connection(settings.url)
		socketthread = SocketThread()
		socketthread.start()
		send("login", username)
	def __exit__(self, *args):
		socketthread.stop()
		socketthread.join()



