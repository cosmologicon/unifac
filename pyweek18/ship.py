from __future__ import division
from random import *
from thing import *
from effect import *
import settings, state

class Ship(Thing):
	shottype = Projectile
	tcooldown = 2
	tflash = 1
	smokes = False

	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.njump = 0
		self.tilt = [0, 0]
		self.flashtime = 0
		self.cooltime = 0

	def think(self, dt):
		Thing.think(self, dt)
		if self.vy:
			tiltx = 2.5 * self.vx / self.vy
			tilty = 2.5 * self.vz / self.vy
		else:
			tiltx, tilty = 0, 0
		self.tilt[0] += (tiltx - self.tilt[0]) * 5 * dt
		self.tilt[1] += (tilty - self.tilt[1]) * 5 * dt
		theta = 0.03 * self.ax
		self.theta += (theta - self.theta) * 5 * dt

	def jump(self, f=1):
		if self.njump > 0:
			return
		self.njump += 1
		self.vz = 12 * f
		self.z = max(self.z, 0)

	def fire(self):
		if self.cooltime > 0:
			return
		state.projectiles.append(self.shottype(self))
		self.cooltime = self.tcooldown

	def hurt(self, dhp=1):
		self.hp -= dhp
		self.flashtime = self.tflash
		if self.hp <= 0:
			state.effects.append(Corpse(self))
		elif self.smokes:
			state.addsmoke(self)

	def hitany(self, objs):
		if self.flashtime:
			return
		for h in objs:
			if not h.alive:
				continue
			dx, dy = h.x - self.x, h.y - self.y
			if dx ** 2 + dy ** 2 < 1 and self.z <= 0:
				self.hurt()


class PirateShip(Ship):
	hp0 = 3
	tflash = 0.2
	def __init__(self, pos, v, level):
		Ship.__init__(self, pos)
		self.vx, self.vy = v
		self.level = level
		self.layers = []
		dys = [0.08 * x for x in range(-1, 2)]
		for dy in dys:
			self.layers.append([randomcolor(), dy])

def randomcolor():
	return "rgb%s,%s,%s" % (randint(100, 200), randint(100, 200), randint(100, 200))

class PlayerShip(Ship):
	alwaysinrange = True
	smokes = True
	
	def __init__(self, pos):
		Ship.__init__(self, pos)
		self.layers = []
		dys = [0.08 * x for x in range(-3, 4)]
		for dy in dys:
			self.layers.append([randomcolor(), dy])
		self.falling = False

	def think(self, dt):
		Ship.think(self, dt)

	def move(self, dt):
		ytarget = state.yc + (settings.dyfall if self.falling else settings.dyjump if self.z > 0 else settings.dynormal)
		self.ay = 6 * (ytarget - self.y)
		self.vy += self.ay * dt
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
		self.x = min(max(self.x, -settings.lwidth), settings.lwidth)
		if self.vz or self.z:
			g = 30
			self.z += dt * self.vz - 0.5 * dt * dt * g
			self.vz -= dt * g
			if self.z < 0 and self.vz < 0:
				self.z = self.vz = 0
				self.njump = 0
				state.addsplash(self)
		self.vy += (settings.vyc - self.vy) * 3 * dt

	def control(self, dx, jumping, shooting):
		self.ax = dx * settings.ax
		if jumping:
			self.jump()
		if shooting:
			self.fire()

