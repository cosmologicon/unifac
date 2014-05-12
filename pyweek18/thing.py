import state

class Thing(object):

	layers = [
		["brown", 0],
	]
	alive = True
	flashtime = 0
	cooltime = 0
	hp0 = 1
	alwaysinrange = False
	tlive = 0
	ascale = None

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
		if self.cooltime:
			self.cooltime = max(self.cooltime - dt, 0)
		if self.tlive and self.t > self.tlive:
			self.alive = False
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
				x = self.x + dy * dxdy
				y = self.y + dy
				z = self.z + dy * dzdy
				yield layername, x, y, z, self.theta, self.ascale, self
		else:
			for layername, dy in self.layers:
				yield layername, self.x, self.y + dy, self.z, self.theta, self.ascale, self

class Rock(Thing):
	def __init__(self, pos, size):
		Thing.__init__(self, pos)
		self.size = self.w, self.h = size
		w1, h1 = self.w - 0.1, self.h - 0.1
		w2, h2 = self.w - 0.2, self.h - 0.2
		self.layers = [
			["rock%s,%s" % (w2, h2), 0.2],
			["rock%s,%s" % (w1, h1), 0.1],
			["rock%s,%s" % (self.w, self.h), 0],
			["rock%s,%s" % (w1, h1), -0.1],
			["rock%s,%s" % (w2, h2), -0.2],
		]

class Projectile(Thing):
	vy0 = 20
	tlive = 1
	layers = [["cannonball", 0]]
	def __init__(self, obj):
		Thing.__init__(self, (obj.x, obj.y, obj.z + 0.2))
		self.vy = self.vy0
		self.vx = obj.vx / obj.vy * self.vy if obj.vy else 0
		#self.vz = obj.vz / obj.vy * self.vy if obj.vy else 0
		self.move(0.1)




