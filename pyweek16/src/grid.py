import random, logging
from collections import defaultdict
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
	fields = "x y w h colors device fog active".split()
	defaults = { "w": 1, "h": 1, "colors": (0,0,0,0), "device": None, "fog": 0, "active": False }
	@property
	def p(self):
		return self.x, self.y
	def updatestate(self, grid):
		nmatch = 0
		for dx, dy, a, b in [(0,-1,0,2), (1,0,1,3), (0,1,2,0), (-1,0,3,1)]:
			btile = grid.gettile(self.x + dx, self.y + dy)
			if not btile:
				return False
			nmatch += self.colors[a] == btile.colors[b]
		self.active = nmatch in (0, 4)
	def rotate(self, grid, dA):
		self.colors = util.rotate(self.w, self.h, self.colors, dA)
		self.updatestate(grid)
		for dx, dy in [(-1, 0), (0, -1), (1, 0), (0, 1)]:
			grid.gettile(self.x + dx, self.y + dy).updatestate(grid)

class Sector(object):
	def __init__(self, state):
		self.setstate(state)
	def setstate(self, state):
		self.sx, self.sy, tilestates = state
		self.tiles = {}
		self.devices = defaultdict(list)
		self.adevices = defaultdict(list)
		for tilestate in tilestates:
			tile = Tile(tilestate)
			self.tiles[tile.p] = tile
			if tile.device:
				self.devices[tile.device].append(tile)
#				if tile.active:
#					self.adevices[tile.device].append(tile)
	def getstate(self):
		tilestates = [tile.getstate() for tile in self.tiles.values()]
		return self.sx, self.sy, tilestates
	def gettile(self, x, y):
		return self.tiles.get((x, y), None)
	def setdevice(self, x, y, device):
		tile = self.tiles[(x, y)]
		tile.device = device
		self.devices[device].append(tile)

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
	def fillsector(self, sx, sy):
		if (sx, sy) in self.sectors:
			return
		log.debug("filling sector %s %s", sx, sy)
		self.sectors[(sx, sy)] = sector = randomsector(sx, sy)
		for tile in sector.tiles.values():
			tile.updatestate(self)
		# TODO: update adjacent tiles
	def gettile(self, x, y):
		sx, x = divmod(x, settings.sectorsize)
		sy, y = divmod(y, settings.sectorsize)
		return self.sectors[(sx, sy)].gettile(x, y) if (sx, sy) in self.sectors else None		
	def getstate(self):
		return [(x, y, sector.getstate()) for (x, y), sector in self.sectors.items()]
	def setstate(self, state):
		self.sectors = {}
		for x, y, sectorstate in state:
			log.debug("setting sector state %s %s", x, y)
			self.sectors[(x, y)] = Sector(sectorstate)
		log.debug("sectors set: %s", self.sectors.keys())
	def setdevice(self, x, y, device):
		sx, x = divmod(x, settings.sectorsize)
		sy, y = divmod(y, settings.sectorsize)
		self.sectors[(sx, sy)].setdevice(x, y, device)
	def devices(self, sx, sy):  # All devices with an area of effect overlapping this sector
		xmin = settings.sectorsize * sx
		xmax = xmin + settings.sectorsize
		ymin = settings.sectorsize * sx
		ymax = ymin + settings.sectorsize
		for dsx in (-1, 0, 1):
			for dsy in (-1, 0, 1):
				ax, ay = sx + dsx, sy + dsy
				if (ax, ay) not in self.sectors:
					continue
				sector = self.sectors[(ax, ay)]
				for dname, tiles in sector.devices.items():
					if dname not in settings.eradius:
						continue
					r = settings.eradius[dname]
					for tile in tiles:
						x, y = ax * settings.sectorsize + tile.x, ay * settings.sectorsize + tile.y
						if x + r < xmin or x - r > xmax or y + r < ymin or y - r > ymax:
							continue
						yield x, y, tile
	def adevices(self, sx, sy):
		return [(x, y, d) for x, y, d in self.devices(sx, sy) if d.active]




