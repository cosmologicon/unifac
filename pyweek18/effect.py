from random import *
from thing import *

class Particles(Thing):
	nparticle = 5
	vz0 = 10
	az = -30
	vspread = 4
	tlive = 1
	vy = 0
	aspread = 3

	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.particles = [
			(uniform(-1, 1), uniform(-1, 1), uniform(-1, 1), uniform(-1, 1))
			for _ in range(self.nparticle)
		]
		self.vz = self.vz0

	def getlayers(self):
		a = self.t * self.vspread
		self.ascale = 1 + self.t * self.aspread
		for px, py, pz, theta in self.particles:
			yield self.imgname, self.x + a * px, self.y + a * py, self.z + a * pz, theta, self.ascale, self


class Splash(Particles):
	imgname = "splash"

class Smoke(Particles):
	imgname = "smoke"
	vz0 = 12
	az = 0

class Heal(Particles):
	imgname = "heal"
	vz0 = 0
	az = -30
	vspread = 5

class Splode(Thing):
	tlive = 0.3
	layers = [["mine", 0]]
	def think(self, dt):
		Thing.think(self, dt)
		self.ascale = 1 + 20 * self.t

class Decoration(Thing):
	pass

class Island(Decoration):
	layers = [["island", 0]]


class Instructions(Thing):
	def __init__(self, text, y):
		Thing.__init__(self, (0, y, 5))
		self.layers = [
			["text:" + text, 0],
#			["text0:" + text, 0.05],
		]
		self.tilt = 1, -1
		self.vy = -14

class Corpse(Thing):
	tlive = 1
	def __init__(self, obj):
		Thing.__init__(self, (obj.x, obj.y, obj.z))
		self.layers = obj.layers
		self.vx = obj.vx
		self.vy = obj.vy
		self.vz = 10
		self.az = -20
		self.tilt = obj.tilt or (0, 0)
		self.theta0 = obj.theta
		self.thetas = [uniform(-2, 2) for _ in self.layers]
		self.ds = [(uniform(-3, 3), uniform(-1, 1)) for _ in self.layers]
		
	def think(self, dt):
		Thing.think(self, dt)

	def getlayers(self):
		dxdy, dzdy = self.tilt
		for (layername, dy), dtheta, (dx, dz) in zip(self.layers, self.thetas, self.ds):
			theta = self.theta0 + self.t * dtheta
			x = self.x + self.t * dx + dy * dxdy
			y = self.y + dy
			z = self.z + self.t * dz + dy * dzdy
			yield layername, x, y, z, theta, None, self


