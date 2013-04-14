import random
import settings, util


class serializable(object):
	fields = None
	defaults = None
	def __init__(self, state):
		self.setstate(state)
	def setstate(self, state):
		for field in self.fields:
			setattr(self, field, state[field] if field in state else self.defaults[field])
	def getstate(self):
		return dict((field, getattr(self, field)) for field in self.fields)

class Tile(serializable):
	fields = "x y w h colors device".split()
	defaults = { "w": 1, "h": 1, "colors": (0,0,0,0), "device": None }
	@property
	def p(self):
		return self.x, self.y

class Sector(object):
	def __init__(self, state):
		self.setstate(state)
	def setstate(self, state):
		self.sx, self.sy, tilestates = state
		self.tiles = {}
		for tilestate in tilestates:
			tile = Tile(tilestate)
			self.tiles[tile.p] = tile
	def getstate(self):
		tilestates = [tile.getstate() for tile in self.tiles.values()]
		return self.sx, self.sy, tilestates
	def gettile(self, x, y):
		return self.tiles.get((x, y), None)

def randomsector(sx, sy):
	tilestates = []
	for x in range(settings.sectorsize):
		for y in range(settings.sectorsize):
			colors = util.randomcolors(1, 1)
			tilestates.append({"x": x, "y": y, "colors": colors})
	return Sector((sx, sy, tilestates))

class Grid(object):
	def __init__(self):
		self.sectors = {}
		self.sectors[(0,0)] = randomsector(0, 0)
	def gettile(self, x, y):
		sx, x = divmod(x, settings.sectorsize)
		sy, y = divmod(y, settings.sectorsize)
		return self.sectors[(sx, sy)].gettile(x, y)
	def getstate(self):
		return [(x, y, sector.getstate()) for (x, y), sector in self.sectors.items()]
	def setstate(self, state):
		self.sectors = {}
		for x, y, sectorstate in state:
			self.sectors[(x, y)] = Sector(sectorstate)


