import state

class Thing(object):

	layers = [
		["brown", 0],
	]
	alive = True
	flashtime = 0
	hp0 = 1
	alwaysinrange = False

	def __init__(self, pos):
		self.x, self.y, self.z = pos
		self.vx, self.vy, self.vz = 0, 0, 0
		self.ax, self.ay, self.az = 0, 0, 0
		self.theta = 0
		self.tilt = None
		self.hp = self.hp0
		self.t = 0

	def think(self, dt):
		self.t += dt
		if self.flashtime:
			self.flashtime = max(self.flashtime - dt, 0)
		if self.hp <= 0:
			self.alive = False
		if not self.alwaysinrange and self.y < state.yc:
			self.alive = False
		self.move(dt)

	def move(self, dt):
		vx0, vy0, vz0 = self.vx, self.vy, self.vz
		self.vx += dt * self.ax
		self.vy += dt * self.ay
		self.vz += dt * self.az
		self.constrainvelocity()
		self.x += 0.5 * dt * (self.vx + vx0)
		self.y += 0.5 * dt * (self.vy + vy0)
		self.z += 0.5 * dt * (self.vz + vz0)

	def constrainvelocity(self):
		pass

	def getlayers(self):
		if self.flashtime and self.flashtime ** 1.4 * 20 % 2 < 1:
			return
		if self.tilt:
			dxdy, dzdy = self.tilt
			for layername, dy in self.layers:
				yield layername, self.x + dy * dxdy, self.y + dy, self.z + dy * dzdy, self.theta, self
		else:
			for layername, dy in self.layers:
				yield layername, self.x, self.y + dy, self.z, self.theta, self

class Rock(Thing):
	pass
	


