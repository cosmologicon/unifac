import state

class Thing(object):

	layers = [
		["brown", 0],
	]
	alive = True

	def __init__(self, pos):
		self.x, self.y, self.z = pos
		self.theta = 0
		self.tilt = None

	def think(self, dt):
		if self.y < state.y0 - 10:
			self.alive = False

	def getlayers(self):
		if self.tilt:
			raise NotImplementedError
		else:
			for layername, dy in self.layers:
				yield layername, self.x, self.y + dy, self.z, self.theta, self

class Rock(Thing):
	pass
	


