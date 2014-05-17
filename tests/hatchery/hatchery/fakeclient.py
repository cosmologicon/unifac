import gamestate, settings
import threading, time

updates = []
messages = []
galaxy = gamestate.Galaxy()
serverstate = gamestate.Gamestate()
nframe = 0
passwords = {}
knowledge = {}

class Fthread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self._stop = threading.Event()
	def run(self, logindata):
		while not self._stop.isSet():
			time.sleep(0.01)
			while messages:
				print messages.pop(0)
	def stop(self):
		self._stop.set()


class run(object):
	def __init__(self, logindata = None):
		self.logindata = logindata

	def __enter__(self):
		global fthread, clientname
		if self.logindata:
			clientname, clientpassword = self.logindata
			if clientname not in passwords or passwords[clientname] != clientpassword:
				updates.append(["disconnect", "login failure"])
				return
		else:
			clientname, clientpassword = settings.randomname(), settings.randomname()
			updates.append(["logininfo", clientname, clientpassword])

		galaxy.create()
		you = gamestate.Stork({
			"name": clientname,
			"parent": None,
			"p": (0,0),
			"v": (0,0),
		})
		you.land("hatchery", galaxy)
		knowledge[clientname] = set(["hatchery"])
		serverstate.addstork(you)
		updates.append(("galaxy", galaxy.getstate(knowledge[clientname])))
		updates.append(("you", you.getstate()))
		
		fthread = Fthread()
		fthread.start()

	def __exit__(self, ttype, value, tback):
		fthread.stop()
		fthread.join()

def send(obj):
	messages.append((clientname, obj))

def getupdates():
	while updates:
		yield updates.pop(0)


