import random, logging, math
import monster, update, util

log = logging.getLogger(__name__)

class Quest(object):
	alive = True
	complete = False
	def __init__(self, who, tile):
		self.who = who
		self.tile = tile
		self.state0 = tile.getstate()
		self.p0 = tile.p
		self.monsters = []
		self.r = 9   # spawn radius
		self.n = 20  # max simultaneous monsters
		self.T = 60
		self.progress = self.T * 0.1
	def think(self, dt):
		while len(self.monsters) < self.n:
			self.spawn()
		if self.tile.active:
			self.progress += dt
		else:
			self.progress -= dt
		log.debug("quest progress: %s", self.progress)
		if self.progress <= 0:
			self.alive = False
		if self.progress >= self.T:
			self.alive = False
			self.complete = True
		if not self.alive:
			for m in self.monsters:
				m.splat()
		self.monsters = [m for m in self.monsters if m.alive]
	def spawn(self):
		a = random.random() * 6.28
		x = int(self.state0["x"] + self.r * math.sin(a))
		y = int(self.state0["y"] + self.r * math.cos(a))
		if not update.grid.canmoveto(x, y) or (x,y) in update.monsters:
			return
		m = monster.Monster({ "name": util.randomname(), "x": x, "y": y, "target": self.p0 })
		self.monsters.append(m)
		update.monsters[(x,y)] = m

