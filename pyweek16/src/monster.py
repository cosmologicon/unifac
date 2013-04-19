import random, logging
import util, update, settings

log = logging.getLogger(__name__)


class Monster(util.serializable):
	fields = "name x y target steptime alive t hp".split()
	defaults = {"steptime": 3, "target": None, "hp": 3, "alive": True, "t": 0}
	def __init__(self, *args, **kw):
		util.serializable.__init__(self, *args, **kw)
		self.wallstop = 0
	# Returns True if state changed
	def think(self, dt):
		self.t += dt
		if self.t >= self.steptime:
			self.t -= self.steptime
			self.step()
	def hurt(self, dhp):
		self.hp -= dhp
		update.effects.append(["splat", self.x, self.y])
		if self.hp <= 0:
			self.die()
	def step(self):
		if self.splathere():
			self.splat()
			return
		x, y = self.choosestep()
		if not update.grid.canmoveto(x, y):
			return
		if (x,y) in update.monsters:
			return
		tile = update.grid.getbasetile(self.x, self.y)
		if tile and tile.active and tile.device == "wall":
			if self.wallstop < 3:
				self.wallstop += 1
				return
			ncolors = util.randomnewcolors(tile.colors)
			update.grid.rotate(self.x, self.y, 1)
#			update.grid.changecolors(self.x, self.y, ncolors)
		update.effects.append(["step", self.x, self.y, x, y])
		del update.monsters[(self.x, self.y)]
		self.x, self.y = x, y
		update.monsters[(self.x, self.y)] = self
		update.monsterdelta.append(self.getstate())
		self.wallstop = 0
	def splat(self):
		if not update.grid.shielded(self.x, self.y):
			tile = update.grid.getbasetile(self.x, self.y)
			colors0 = tile.colors
			ncolors = util.randomnewcolors(tile.colors)
			# Sorely needed amendment to make the game much much easier.
			dA = random.choice((1,3))
			update.grid.rotate(self.x, self.y, dA)
#			update.grid.changecolors(self.x, self.y, ncolors)
#			update.grid.setdevice(self.x, self.y, None)
		self.die()
	def die(self):
		self.alive = False
		update.effects.append(["splat", self.x, self.y])
		if (self.x, self.y) in update.monsters:
			del update.monsters[(self.x, self.y)]
		update.monsterdelta.append(self.getstate())

	def splathere(self):
		tile = update.grid.getrawtile(self.x, self.y)
		target = update.grid.getbasetile(*self.target)
		if target.isneighbor(self.x, self.y):
			return True
		if tile and tile.active and tile.device not in (None, "wall", "coin"):
			return True
		if random.random() < 0.25:
			for dx, dy in settings.ds:
				tile = update.grid.getrawtile(self.x + dx, self.y + dy)
				if tile and tile.active and tile.device not in (None, "wall", "coin"):
					return True
		return False

	def choosestep(self):
		if self.target and random.random() < 0.8:
			dx, dy = self.target[0] - self.x, self.target[1] - self.y
			if (abs(dx) + abs(dy)) * random.random() < abs(dx):
				dx, dy = (1 if dx > 0 else -1), 0
			else:
				dx, dy = 0, (1 if dy > 0 else -1)
		else:
			ds = [(-1,0),(0,-1),(1,0),(0,1)]
			dx, dy = random.choice(ds)
		return self.x + dx, self.y + dy

