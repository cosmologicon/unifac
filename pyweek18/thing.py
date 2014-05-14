import state, settings

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

	def causedamage(self):
		pass

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

class Mine(Thing):
	layers = [
		["mine", 0],
	]
	def __init__(self, pos, vel):
		Thing.__init__(self, pos)
		self.vx, self.vy, self.vz = vel
		self.landed = False
		self.az = -30

	def think(self, dt):
		Thing.think(self, dt)
		if not self.landed and self.z <= 0 and self.vz < 0:
			self.landed = True
			self.vy = settings.vyc - 3
			self.vz = 0
			self.vx = 0
			self.z = 0.2
			self.az = 0

	def causedamage(self):
		self.alive = False
		import effect
		state.effects.append(effect.Splode((self.x, self.y, self.z)))

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
	def causedamage(self):
		self.alive = False



