import random

domain = "ws://universefactory.net"
port = 8898
clientpath = "%s:%s" % (domain, port)
ax, ay = 1000, 1000
sx, sy = 800, 500


def randomcolor():
	return tuple(random.randint(100,255) for _ in range(3))
def randomname():
	return "".join(random.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(8))


class Goofball(object):
	def __init__(self, state=None):
		if state is not None:
			self.setstate(state)
		else:
			self.setstate0()

	def setstate0(self):
		self.name = randomname()
		self.color = randomcolor()
		self.r = 8
		self.x = random.uniform(0, ax)
		self.y = random.uniform(0, ay)
		self.vx = self.vy = 0

	def setstate(self, state):
		for prop in "name color r x y vx vy".split():
			setattr(self, prop, state[prop])
	
	def getstate(self):
		state = {}
		for prop in "name color r x y vx vy".split():
			state[prop] = getattr(self, prop)
		return state

	def think(self, dt):
		self.x += self.vx * dt
		self.y += self.vy * dt
		self.constrain()

	def constrain(self):
		self.x = min(max(self.x, self.r), ax - self.r)
		self.y = min(max(self.y, self.r), ay - self.r)

	def move(self, dx, dy):
		self.vx = dx
		self.vy = dy



