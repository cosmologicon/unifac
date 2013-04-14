# Handle connections with the server in a separate thread
# Reference: https://pypi.python.org/pypi/websocket-client/

import threading, json, logging
from lib.websocket import websocket
import settings

log = logging.getLogger(__name__)

# The socket object through which we communicate
socket = None
socketthread = None

# Set this to False so that main knows to terminate the connection
playing = True

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
def receive(message):
	log.debug("Message received: %s" % message)



class SocketThread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.stopevent = threading.Event()
	def run(self):
		global playing
		while playing:
			try:
				message = socket.recv()
			except websocket.WebSocketConnectionClosedException:
				playing = False
				self.stop()
			if message is None:
				continue
			receive(message)
	def stop(self):
		log.debug("Stopping socket thread")
		self.stopevent.set()


# Object to handle the connection cleanly
class run(object):
	def __init__(self, username, password):
		self.username, self.password = username, password
	def __enter__(self):
		global socket, socketthread
		socket = websocket.create_connection(settings.url)
		socketthread = SocketThread()
		socketthread.start()
		send("Hello")
	def __exit__(self, *args):
		socketthread.stop()
		socketthread.join()



