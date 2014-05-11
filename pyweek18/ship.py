from __future__ import division
from random import *
from thing import *
import settings

class Ship(Thing):
	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.vx = 0
		self.vy = 0
		self.vz = 0
		self.ax = 0
		self.njump = 0
		self.tilt = [0, 0]

	def think(self, dt):
		Thing.think(self, dt)
		if self.vy:
			tiltx = 2.5 * self.vx / self.vy
			tilty = 2.5 * self.vz / self.vy
		else:
			tiltx, tilty = 0, 0
		self.tilt[0] += (tiltx - self.tilt[0]) * 5 * dt
		self.tilt[1] += (tilty - self.tilt[1]) * 5 * dt

def randomcolor():
	return "rgb%s,%s,%s" % (randint(100, 200), randint(100, 200), randint(100, 200))

class PlayerShip(Ship):
	
	def __init__(self, pos):
		Ship.__init__(self, pos)
		self.layers = []
		dys = [0.05 * x for x in range(-10, 11)]
		for dy in dys:
			self.layers.append([randomcolor(), dy])

	def think(self, dt):
		self.vy = 10
		self.y += self.vy * dt
		ax = self.ax
		vx0 = self.vx
		if self.ax and self.ax * self.vx >= 0:
			self.vx += self.ax * dt
		elif self.vx:
			dvx = settings.xslow * dt
			if dvx > abs(self.vx):
				self.vx = 0
			else:
				self.vx -= dvx * cmp(self.vx, 0)
		self.vx = min(max(self.vx, -settings.vxmax), settings.vxmax)
		self.x += 0.5 * (self.vx + vx0) * dt
		if self.vz or self.z:
			g = 10
			self.z += dt * self.vz - 0.5 * dt * dt * g
			self.vz -= dt * g
			if self.z < 0 and self.vz < 0:
				self.z = self.vz = 0
				self.njump = 0
		Ship.think(self, dt)
		self.alive = True

	def control(self, dx, jumping, shooting):
		self.ax = dx * settings.ax
		if jumping:
			self.jump()

	def jump(self):
		if self.njump > 0:
			return
		self.vz = 4

