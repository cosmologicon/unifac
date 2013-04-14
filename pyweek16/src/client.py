# Handle connections with the server in a separate thread
# Reference: https://pypi.python.org/pypi/websocket-client/

import threading, json, logging
from lib.websocket import websocket
import settings, util

log = logging.getLogger(__name__)

# The socket object through which we communicate
socket = None
socketthread = None

# Set this to False so that main knows to terminate the connection
playing = True

username = None

# Pending updates from the server
updates = []
ulock = threading.RLock()

# I think these should actually be atomic operations, but I'm not that familiar with threads
#   so let's stay on the safe side.
def getupdates():
	while updates:
		ulock.acquire()
		ret = updates.pop(0)
		ulock.release()
		yield ret
def addupdate(update):
	ulock.acquire()
	updates.push(update)
	ulock.release()

def send(*args):
	message = json.dumps(args)
	socket.send(message)
def parsemessage(message):
	return json.loads(message)
def receive(message):
	message = parsemessage(message)
	log.debug("Message received: %s" % message)
	mtype, args = message[0], message[1:]
	if mtype == "login":
		login(*args)
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
				playing = False
				break
			if message is None:
				continue
			receive(message)
		self.stop()
	def stop(self):
		log.debug("Stopping socket thread")
		self.stopevent.set()
		socket.close()


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



