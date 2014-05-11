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
		if self.y < state.yc:
			self.alive = False

	def getlayers(self):
		if self.tilt:
			dxdy, dzdy = self.tilt
			for layername, dy in self.layers:
				yield layername, self.x + dy * dxdy, self.y + dy, self.z + dy * dzdy, self.theta, self
		else:
			for layername, dy in self.layers:
				yield layername, self.x, self.y + dy, self.z, self.theta, self

class Rock(Thing):
	pass
	


