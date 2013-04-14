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
	fields = "x y s colors device fog active parent".split()
	defaults = { "s": 1, "colors": (0,0,0,0), "device": None, "fog": 0, "active": False, "parent": None }
	@property
	def p(self):
		return self.x, self.y
	def color(self, side, offset = 0):
		assert offset < self.s
		return self.colors[side * self.s + offset]
	def updatestate(self, grid):  # Returns true if the state is changed
		if self.device == "eye":
			return False

		nmatch = 0
		for dx, dy, a, b in [(0,-1,0,2), (1,0,1,3), (0,1,2,0), (-1,0,3,1)]:
			bcolor = grid.getcolor(self.x + dx, self.y + dy, b)
			if bcolor is None:
				return False
			nmatch += self.color(a) == bcolor
		active = nmatch in (0, 4 * self.s)
		if active != self.active:
			self.active = active
			return True
		return False
	def rotate(self, grid, dA):  # Returns list of tiles whose state is updated
		self.colors = util.rotate(self.s, self.colors, dA)
		yield self.p
		self.updatestate(grid)
		for x, y in util.neighbors(self.s, self.x, self.y):
			tile = grid.getbasetile(x, y)
			if tile.updatestate(grid):
				yield tile.p

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
		self._delta = set()   # tiles that have changed since the last update
		self._state = None
	def getstate(self):
		if not self._state:
			tilestates = [tile.getstate() for tile in self.tiles.values()]
			self._state = self.sx, self.sy, tilestates
		return self._state
	def gettile(self, x, y):
		return self.tiles.get((x, y), None)
	def markdelta(self, x, y):
		self._delta.add((x, y))
		self._state = None
	def markdeltas(self, ps):
		self._delta |= set(ps)
		self._state = None
	def getdelta(self):
		if not self._delta:
			return []
		ret = [self.tiles[p].getstate() for p in self._delta]
		self._delta = set()
		return ret
	# Don't bother updating _delta here, since this is only called on client side
	# Also don't bother calling updatestate on the tiles, since we assume state changes are
	# included in the patch
	def applydelta(self, delta):
		for tilestate in delta:
			self.tiles[(tilestate["x"], tilestate["y"])].setstate(tilestate)

	def settile(self, tilestate):
		x, y = tilestate["x"], tilestate["y"]
		self.tiles[(x, y)].setstate(tilestate)
		self.markdelta(x, y)
	def setdevice(self, x, y, device):
		tile = self.tiles[(x, y)]
		tile.device = device
		self.devices[device].append(tile)
		self.markdelta(x, y)
	def setfog(self, x, y, fog):
		tile = self.tiles[(x, y)]
		if fog == tile.fog:
			return
		tile.fog = fog
		self.markdelta(x, y)
	def activate(self, x, y):
		tile = self.tiles[(x, y)]
		if tile.active:
			return
		tile.active = True
		self.markdelta(x, y)

def randomsector(sx, sy):
	tilestates = []
	a = settings.sectorsize
	for x in range(a):
		for y in range(a):
			colors = util.randomcolors(1)
			tilestates.append({
				"x": sx*a+x,
				"y": sy*a+y,
				"colors": colors,
			})
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
	def getrawtile(self, x, y):  # Return None if there's a pseudotile at that location
		sx = x // settings.sectorsize
		sy = y // settings.sectorsize
		if (sx, sy) not in self.sectors:
			return None
		tile = self.sectors[(sx, sy)].gettile(x, y)
		return None if tile.parent else tile
	def getbasetile(self, x, y):  # Returns the true tile if there's a pseudotile at that location
		sx = x // settings.sectorsize
		sy = y // settings.sectorsize
		if (sx, sy) not in self.sectors:
			return None
		tile = self.sectors[(sx, sy)].gettile(x, y)
		return self.getbasetile(*tile.parent) if tile.parent else tile
	def getcolor(self, x, y, side):
		tile = self.getbasetile(x, y)
		if not tile:
			return None
		if tile.s == 1:
			return tile.color(side)
		# Maybe refactor this? Doesn't really seem worth it.
		offset = (y - tile.y if side % 2 else x - tile.x)
		if side > 2:
			offset = tile.s - offset - 1
		return tile.color(side, offset)
	def getstate(self, sectors = None):
		if sectors is None:
			return [(x, y, sector.getstate()) for (x, y), sector in self.sectors.items()]
		return [(x, y, self.sectors[(x,y)].getstate()) for x, y in sectors]
	def setstate(self, state):
		self.sectors = {}
		self.applystate(state)
	# set sector states without deleting any current sectors
	def applystate(self, state):
		for x, y, sectorstate in state:
			self.sectors[(x, y)] = Sector(sectorstate)
		log.debug("sectors set: %s", self.sectors.keys())
	def getdelta(self):
		ret = {}
		for spos, sector in self.sectors.items():
			d = sector.getdelta()
			if d: ret[spos] = d
		return ret.items()  # can't JSON a dict with tuples for keys
	def applydelta(self, delta):
		for spos, sdelta in delta:
			self.sectors[tuple(spos)].applydelta(sdelta)
	def canrotate(self, x, y):
		tile = self.getbasetile(x, y)
		return tile and not tile.fog
	def rotate(self, x, y, dA):
		tile = self.getbasetile(x, y)
		if not tile or tile.fog:
			raise ValueError("Cannot rotate tile (%s,%s)" % (x, y))
		for x, y in tile.rotate(self, dA):
			p = x // settings.sectorsize, y // settings.sectorsize
			self.sectors[p].markdelta(x, y)
	def putdevice(self, x, y, device):
		s = settings.devicesize[device]
		self.settile({
			"x": x,
			"y": y,
			"s": s,
			"colors": util.randomcolors(s),
		})
		self.setdevice(x, y, device)
		for dx in range(s):
			for dy in range(s):
				if (dx, dy) == (0, 0):
					continue
				self.settile({"x": x+dx, "y": y+dy, "colors": None, "parent": (x, y)})
	# This should be used by the server with care.
	def settile(self, tilestate):
		p = tilestate["x"] // settings.sectorsize, tilestate["y"] // settings.sectorsize
		self.sectors[p].settile(tilestate)
	def setdevice(self, x, y, device):
		p = x // settings.sectorsize, y // settings.sectorsize
		self.sectors[p].setdevice(x, y, device)
	def activate(self, x, y):
		p = x // settings.sectorsize, y // settings.sectorsize
		self.sectors[p].activate(x, y)
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




