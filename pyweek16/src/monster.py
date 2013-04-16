import random, logging
import util, update

log = logging.getLogger(__name__)


class Monster(util.serializable):
	fields = "name x y target steptime alive t".split()
	defaults = {"steptime": 3, "target": None, "alive": True, "t": 0}
	# Returns True if state changed
	def think(self, dt):
		self.t += dt
		if self.t >= self.steptime:
			self.t -= self.steptime
			self.step()
	def step(self):
		if self.splathere():
			self.splat()
			return
		x, y = self.choosestep()
		if not update.grid.canmoveto(x, y):
			return
		if (x,y) in update.monsters:
			return
		update.effects.append(["step", self.x, self.y, x, y])
		self.x, self.y = x, y
		update.monsterdelta.append(self.getstate())
	def splat(self):
		self.alive = False
		update.effects.append(["splat", self.x, self.y])
		if not update.grid.shielded(self.x, self.y):
			tile = update.grid.getbasetile(self.x, self.y)
			colors0 = tile.colors
			ncolors = util.randomnewcolors(tile.colors)
			update.grid.changecolors(self.x, self.y, ncolors)
			update.grid.setdevice(self.x, self.y, None)
		update.monsterdelta.append(self.getstate())

	# Definitely not sure of this logic yet...
	def splathere(self):
		tile = update.grid.getrawtile(self.x, self.y)
		if tile and tile.active:
			return True
		target = update.grid.getrawtile(*self.target)
		if target.isneighbor(self.x, self.y):
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

