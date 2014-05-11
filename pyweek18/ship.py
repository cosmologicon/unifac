
from thing import *
import settings

class Ship(Thing):
	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.vx = 0
		self.ax = 0

class PlayerShip(Ship):
	
	layers = [
		["brown", -1],
		["purple", 0],
		["brown", 1],
	]

	def think(self, dt):
		self.y += 10 * dt
		ax = self.ax
		vx0 = self.vx
		if self.ax:
			self.vx += self.ax * dt
		elif self.vx:
			dvx = settings.xslow * dt
			if dvx > abs(self.vx):
				self.vx = 0
			else:
				self.vx -= dvx * cmp(self.vx, 0)
		self.vx = min(max(self.vx, -settings.vxmax), settings.vxmax)
		self.x += 0.5 * (self.vx + vx0) * dt
		Ship.think(self, dt)
		self.alive = True

	def control(self, dx, jumping, shooting):
		self.ax = dx * settings.ax

