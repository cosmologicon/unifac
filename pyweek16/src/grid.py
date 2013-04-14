

class Sector(object):
	def __init__(self, state):
		self.setstate(state)
	def setstate(self, state):
		self.sx, self.sy, tiles = state
	

