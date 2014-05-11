from random import *
from thing import *

class Particles(Thing):
	nparticle = 20
	vz0 = 20
	az = -30
	vspread = 8
	tlive = 1
	vy = 0

	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.particles = [
			(uniform(-1, 1), uniform(-1, 1), uniform(-1, 1)) for _ in range(self.nparticle)
		]
		self.tpart = 0
		self.vz = self.vz0

	def think(self, dt):
		Thing.think(self, dt)
		self.vz += self.az * dt
		self.z += self.vz * dt
		self.y += self.vy * dt
		self.tpart += dt
		if self.tpart > self.tlive:
			self.alive = False

	def getlayers(self):
		a = self.tpart * self.vspread
		for px, py, pz in self.particles:
			yield self.imgname, self.x + a * px, self.y + a * py, self.z + a * pz, 0, self


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

class Decoration(Thing):
	pass

class Island(Decoration):
	layers = [["island", 0]]


