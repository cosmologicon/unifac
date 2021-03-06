import random, logging, math
import monster, update, util, settings

log = logging.getLogger(__name__)

class Quest(object):
	alive = True
	complete = False
	def __init__(self, who, tile, qinfo):
		self.who = who
		self.tile = tile
		self.qinfo = qinfo
		self.state0 = tile.getstate()
		self.x0 = tile.x + tile.s // 2
		self.y0 = tile.y + tile.s // 2
		self.p0 = self.x0, self.y0
		self.monsters = []
		self.diff = diff = qinfo["difficulty"]
		self.r = settings.questr[diff]   # spawn radius
		self.n = settings.questn[diff]  # max simultaneous monsters
		self.T = settings.questT[diff]
		self.progress = self.T * 0.1
		self.t = 0
	# Tiles to lock down if this quest is in solo mode
	def tiles(self):
		R = self.r + 3
		for dx in range(-R, R):
			for dy in range(-R, R):
				if dx ** 2 + dy ** 2 <= R ** 2:
					yield self.x0 + dx, self.y0 + dy
	def think(self, dt):
		self.t += dt
		while len(self.monsters) < self.n and random.random() < 0.99:
			self.spawn()
		if self.tile.active:
			self.progress += dt
		else:
			self.progress -= dt
		if self.progress <= 0:
			if self.diff == "boss":
				self.progress = 0
			else:
				self.alive = False
		if self.progress >= self.T:
			self.alive = False
			self.complete = True
		if not self.alive:
			for m in self.monsters:
				m.die()
		self.monsters = [m for m in self.monsters if m.alive]
		if self.diff == "boss":
			if self.t > 60:
				self.t = 0
				update.grid.changecolors(self.tile.x, self.tile.y, util.randomcolors(5))
			x, y = random.randint(-20, 20), random.randint(-20, 20)
			tile = update.grid.getrawtile(x, y)
			if tile and tile.s == 1:
				ncolors = util.randomnewcolors(tile.colors)
				update.grid.changecolors(tile.x, tile.y, ncolors)
				update.grid.setdevice(tile.x, tile.y, None)

	def spawn(self):
		a = random.random() * 6.28
		x = int(self.x0 + self.r * math.sin(a))
		y = int(self.y0 + self.r * math.cos(a))
		if not update.grid.canmoveto(x, y) or (x,y) in update.monsters:
			return
		m = monster.Monster({
			"name": util.randomname(),
			"x": x, "y": y,
			"target": self.p0,
			"hp": random.choice((1,2,3)),
		})
		self.monsters.append(m)
		update.monsters[(x,y)] = m
		update.monsterdelta.append(m.getstate())

