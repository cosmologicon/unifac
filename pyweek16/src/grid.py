import random, logging
import settings, util

log = logging.getLogger(__name__)


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
	def rotate(self, dA):
		self.colors = util.rotate(self.w, self.h, self.colors, dA)

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
		return self.sectors[(sx, sy)].gettile(x, y) if (sx, sy) in self.sectors else None
	def tilestate(self, x, y):
		tile = self.gettile(x, y)
		nmatch = 0
		for dx, dy, a, b in [(0,-1,0,2), (1,0,1,3), (0,1,2,0), (-1,0,3,1)]:
			btile = self.gettile(x + dx, y + dy)
			if not btile:
				return False
			nmatch += tile.colors[a] == btile.colors[b]
		return nmatch in (0, 4)
		
	def getstate(self):
		return [(x, y, sector.getstate()) for (x, y), sector in self.sectors.items()]
	def setstate(self, state):
		self.sectors = {}
		for x, y, sectorstate in state:
			log.debug("setting sector state %s %s", x, y)
			self.sectors[(x, y)] = Sector(sectorstate)
		log.debug("sectors set: %s", self.sectors.keys())



