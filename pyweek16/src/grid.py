import random, logging
from collections import defaultdict
import settings, util

log = logging.getLogger(__name__)

class Tile(util.serializable):
	fields = "x y s colors device fog active parent lock".split()
	defaults = { "s": 1, "colors": (0,0,0,0), "device": None, "fog": settings.penumbra, "active": False, "parent": None, "lock": None }
	@property
	def p(self):
		return self.x, self.y
	def color(self, side, offset = 0):
		assert offset < self.s
		return self.colors[side * self.s + offset]

	def neighborcolors(self, grid):
		ret = []
		if self.s == 1:
			return [grid.getcolor(self.x + dx, self.y + dy, b)
				for dx, dy, b in [(0,-1,2), (1,0,3), (0,1,0), (-1,0,1)]
			]
	def updatestate(self, grid):  # Returns true if the state is changed
		nmatch = 0
		if self.s == 1:
			for color, bcolor in zip(self.colors, self.neighborcolors(grid)):
				if bcolor is None:
					return False
				nmatch += color == bcolor
			active = nmatch == 0
		else:
			for j in range(self.s):
				specs = [
					(j, -1, 0, 2),
					(self.s, j, 1, 3),
					(self.s-j-1, self.s, 2, 0),
					(-1, self.s-j-1, 3, 1),
				]
				for dx, dy, a, b in specs:
					bcolor = grid.getcolor(self.x + dx, self.y + dy, b)
					if bcolor is None:
						return False
					nmatch += self.color(a, j) == bcolor
			active = nmatch == 0
		if active != self.active:
			self.active = active
			return True
		return False
	# Note: does not work if the neighbor has s > 1
	def isneighbor(self, x, y):
		return (x, y) in list(util.neighbors(self.s, self.x, self.y))
	# Returns two lists of tiles: tiles whose state is updated, and tiles whose activation state
	#   or colors has changed
	def rotate(self, grid, dA):
		if self.device:
			if self.device[0] == "2":
				dbase, ddir = self.device[:-1], int(self.device[-1])
				self.device = "%s%s" % (dbase, (ddir + dA) % 2)
			elif self.device[0] == "1":
				dbase, ddir = self.device[:-1], int(self.device[-1])
				self.device = "%s%s" % (dbase, (ddir + dA) % 4)
		return self.changecolors(grid, util.rotate(self.s, self.colors, dA))
	def matchcolors(self, grid):
		colors = [(0 if color else 1) for color in self.neighborcolors(grid)]
		return self.changecolors(grid, colors)
	def changecolors(self, grid, colors):
		ps, activated = [self.p], []
		self.colors = colors
		wasactive = self.active
		self.updatestate(grid)
		if self.active != wasactive:
			activated.append(self.p)
		for x, y in util.neighbors(self.s, self.x, self.y):
			tile = grid.getbasetile(x, y)
			wasactive = tile.active
			if tile.updatestate(grid):
				ps.append(tile.p)
				if wasactive != tile.active:
					activated.append(tile.p)
		return ps, activated

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
			tile = self.tiles[(tilestate["x"], tilestate["y"])]
			oldstate = tile.getstate()
			tile.setstate(tilestate)
			yield oldstate, tilestate

	def settile(self, tilestate):
		x, y = tilestate["x"], tilestate["y"]
		self.tiles[(x, y)].setstate(tilestate)
		self.markdelta(x, y)
	def setnode(self, x, y, s, device):
		tile = self.tiles[(x, y)]
		tile.device = device
		self.devices[device].append(tile)
		self.markdelta(x, y)
	def setdevice(self, x, y, device):
		tile = self.tiles[(x, y)]
		if tile.device:
			if tile in self.devices[tile.device]:
				self.devices[tile.device].remove(tile)
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
			tilestate = {
				"x": sx*a+x,
				"y": sy*a+y,
				"colors": colors,
			}
#			if random.random() < 0.2: tilestate["device"] = "coin"
			tilestates.append(tilestate)
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
		if side > 1:
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
			for dstate in self.sectors[tuple(spos)].applydelta(sdelta):
				yield dstate
	def canrotate(self, x, y):
		tile = self.getbasetile(x, y)
		return tile and not tile.fog
	# Returns a list of tiles whose activation state changed
	# This is so we know who to blame for coin collection, etc.
	def rotate(self, x, y, dA):
		tile = self.getbasetile(x, y)
		# TODO: is there any way a monster or computer might change a fog tile?
		if not tile or tile.fog:
			raise ValueError("Cannot rotate tile (%s,%s)" % (x, y))
		ps, activated = tile.rotate(self, dA)
		for x, y in ps:
			p = x // settings.sectorsize, y // settings.sectorsize
			self.sectors[p].markdelta(x, y)
		return activated
	def changecolors(self, x, y, colors):
		tile = self.getbasetile(x, y)
		if not tile:
			raise ValueError("Cannot change tile colors (%s,%s)" % (x, y))
		ps, activated = tile.changecolors(self, colors)
		for x, y in ps:
			p = x // settings.sectorsize, y // settings.sectorsize
			self.sectors[p].markdelta(x, y)
		return activated
	def matchcolors(self, x, y):
		tile = self.getbasetile(x, y)
		if not tile:
			raise ValueError("Cannot change tile colors (%s,%s)" % (x, y))
		ps, activated = tile.matchcolors(self)
		for x, y in ps:
			p = x // settings.sectorsize, y // settings.sectorsize
			self.sectors[p].markdelta(x, y)
		return activated

	# To use when a *player* deploys a device - does not change colors or tile sizes
	def deploy(self, x, y, device):
		tile = self.getbasetile(x, y)
		if not tile or tile.s != settings.devicesize[device]:
			raise ValueError("Cannot deploy to tile tile (%s,%s)" % (x, y))
		self.setdevice(x, y, device)

	def putdevice(self, x, y, device, s = None):
		if not s:
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
	def setfog(self, x, y, fog):
		p = x // settings.sectorsize, y // settings.sectorsize
		self.sectors[p].setfog(x, y, fog)
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
						x, y = tile.x, tile.y
						if x + r < xmin or x - r > xmax or y + r < ymin or y - r > ymax:
							continue
						yield x, y, tile
	def adevices(self, sx, sy):
		return [(x, y, d) for x, y, d in self.devices(sx, sy) if d.active]
	def qdevices(self, x0, y0, r0):  # All devices with an area of effect overlapping this tile's quest radius
		xmin, xmax = x0 - r0, x0 + r0
		ymin, ymax = y0 - r0, y0 + r0
		sx, sy = x0 // settings.sectorsize, y0 // settings.sectorsize
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
						x, y = tile.x, tile.y
						if x + r < xmin or x - r > xmax or y + r < ymin or y - r > ymax:
							continue
						yield x, y, tile
	def aqdevices(self, x0, y0, r0):
		return [(x, y, d) for x, y, d in self.qdevices(x0, y0, r0) if d.active]

	# Spaces that monsters can move onto
	def canmoveto(self, x, y):
		tile0 = self.getbasetile(x, y)
		if not tile0:
			return False
		if tile0.s != 1:
			return False
		return True
		
	# Spaces that don't flip when a monster splats on them
	def shielded(self, x, y):
		tile0 = self.getbasetile(x, y)
		if tile0.device in settings.alwaysvulnerable:
			return False
		for dx, dy in settings.regions["shield"]:
			tile = self.getrawtile(x + dx, y + dy)
			if not tile:
				continue
			if tile.device == "shield" and tile.active:
				return True
		return False

	def locktiles(self, who, tiles):
		for x, y in tiles:
			tile = self.getbasetile(x, y)
			if not tile:
				continue
			if tile.lock:
				continue
			tile.lock = who
			p = tile.x // settings.sectorsize, tile.y // settings.sectorsize
			self.sectors[p].markdelta(tile.x, tile.y)
			
	def unlocktiles(self, who, tiles):
		for x, y in tiles:
			tile = self.getbasetile(x, y)
			if not tile:
				continue
			if tile.lock != who:
				continue
			tile.lock = None
			p = tile.x // settings.sectorsize, tile.y // settings.sectorsize
			self.sectors[p].markdelta(tile.x, tile.y)



