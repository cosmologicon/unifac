from __future__ import division
from random import *
from math import *
from thing import *
from effect import *
import settings, state

class Ship(Thing):
	shottype = Projectile
	tcooldown = 2
	tflash = 1
	smokes = False
	twake = 0.1
	r = 0.4
	h = 1

	def __init__(self, pos):
		Thing.__init__(self, pos)
		self.njump = 0
		self.tilt = [0, 0]
		self.flashtime = 0
		self.cooltime = 0
		self.waket = 0

	def think(self, dt):
		Thing.think(self, dt)
		if self.vy:
			tiltx = 7.5 * self.vx / self.vy
			tilty = 7.5 * self.vz / self.vy
		else:
			tiltx, tilty = 0, 0
		self.tilt[0] += (tiltx - self.tilt[0]) * 5 * dt
		self.tilt[1] += (tilty - self.tilt[1]) * 5 * dt
		theta = 0.03 * self.ax
		self.theta += (theta - self.theta) * 5 * dt
		if self.z <= 0 and self.twake:
			self.waket += dt
			while self.waket > self.twake:
				state.effects.append(Wake((self.x, self.y, self.z)))
				self.waket -= self.twake

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
			if dx ** 2 + dy ** 2 < (self.r + h.r) ** 2 and abs(self.z - h.z) < (self.h + h.h) / 2:
				self.hurt(h.dhp)
				h.causedamage()


class PirateShip(Ship):
	hp0 = 1
	tflash = 0.01
	def __init__(self, pos, v, level):
		Ship.__init__(self, pos)
		self.vx, self.vy = v
		self.level = level
		self.layers = []
		dys = [0.08 * x for x in range(-1, 2)]
		for dy in dys:
			self.layers.append([randomcolor(), dy])

class MineShip(PirateShip):
	def fire(self, dt):
		if random() * 2 < dt:
			pos = self.x, self.y + 0.1, 0.2
			vel = uniform(-5, 5), self.vy + 4, 10
			state.hazards.append(Mine(pos, vel))
	def think(self, dt):
		self.fire(dt)
		PirateShip.think(self, dt)

class Blockade(Ship):
	hp0 = 999999
	tflash = 0
	layers = [["rgb0,0,0", 0]]
	twake = 0
	r = 0.4

	def __init__(self, x0, dx, y0, omega):
		self.x0 = x0
		self.omega = omega
		self.dx = dx
		Ship.__init__(self, (x0, y0 + state.yc, -2))
		self.vy = settings.vyc
		self.vz = 0.5
		self.t = uniform(0, 1000)
	
	def think(self, dt):
		self.vx = 0
		Ship.think(self, dt)
		self.x = self.x0 + self.dx * cos(self.omega * self.t)
		if self.z >= 0:
			self.z = 0
			self.vz = 0

	def hurt(self, dhp=1):
		pass


def randomcolor():
	return "rgb%s,%s,%s" % (randint(100, 200), randint(100, 200), randint(100, 200))

class PlayerShip(Ship):
	alwaysinrange = True
	smokes = True
	twake = 0.02
	
	def __init__(self, pos):
		Ship.__init__(self, pos)
		self.layers = []
		self.layers = [
			["you-back.png", -0.18],
			["you-body-2.png", -0.15],
			["you-body-2.png", -0.12],
			["you-sail-1.png", -0.12],
			["you-body-3.png", -0.09],
			["you-body-3.png", -0.06],
			["you-sail-2.png", -0.06],
			["you-body-3.png", -0.03],
			["you-body-3.png", 0],
			["you-body-2.png", 0.03],
			["you-sail-1.png", 0.03],
			["you-body-2.png", 0.06],
			["you-body-2.png", 0.09],
			["you-sail-2.png", 0.09],
			["you-body-1.png", 0.12],
			["you-body-1.png", 0.15],
			["you-body-1.png", 0.18],
			["you-front.png", 0.21],
		]
		self.falling = False
		self.cannontick = 0
		self.tblitz = 0

	def think(self, dt):
		Ship.think(self, dt)
		if self.tblitz:
			self.tblitz = max(self.tblitz - dt, 0)

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
				state.addsplash(self)
		self.vy += (settings.vyc - self.vy) * 3 * dt

	def control(self, dx, jumping, shooting):
		if self.falling:
			self.ax = 0
			return
		self.ax = dx * settings.ax
		if jumping:
			self.jump()
		if shooting:
			self.fire()

	def fire(self):
		if self.cooltime > 0:
			return False
		state.projectiles.append(self.shottype(self, self.cannons[self.cannontick]))
		self.cannontick += 1
		self.cannontick %= len(self.cannons)
		self.cooltime = self.tcooldown
		if self.tblitz:
			self.cooltime /= 10

	def hurt(self, dhp=1):
		if dhp >= 0:
			return Ship.hurt(self, dhp)
		state.addhp(-dhp)

