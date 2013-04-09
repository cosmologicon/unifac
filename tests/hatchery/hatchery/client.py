# Handle the connection to the server asynchronously

from lib.websocket.websocket import create_connection
import json, random, time, threading
import settings

sdata = []

class Rthread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self._stop = threading.Event()
	def run(self):
		while not self._stop.isSet():
			response = json.loads(socket.recv())
			sdata.append(response)
	def stop(self):
		self._stop.set()

def send(obj):
	socket.send(json.dumps(obj))

def getupdates():
	ret = []
	while sdata:
		ret.append(sdata.pop(0))
	return ret

class run(object):
	def __enter__(self):
		global rthread, socket
		socket = create_connection(settings.clientpath)
		rthread = Rthread()
		rthread.start()
	def __exit__(self, ttype, value, tback):
		rthread.stop()
		rthread.join()



