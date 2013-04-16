import random, logging
import util, update

log = logging.getLogger(__name__)


class Monster(util.serializable):
	fields = "name x y target steptime alive t".split()
	defaults = {"steptime": 1, "target": None, "alive": True, "t": 0}
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
		return tile and tile.active

	def choosestep(self):
		ds = [(-1,0),(0,-1),(1,0),(0,1)]
		if self.target:
			dx, dy = self.target[0] - self.x, self.target[1] - self.y
			for _ in range(abs(dx) // 2):
				ds.append(((1 if dx > 0 else -1), 0))
			for _ in range(abs(dy) // 2):
				ds.append(((1 if dy > 0 else -1), 0))
		dx, dy = random.choice(ds)
		return self.x + dx, self.y + dy

