from random import *
from math import *
from thing import *
from ship import *
import state, settings

class Boss(Ship):
	hp0 = 50
	tflash = 0.2
	kx = 2
	ky = 4
	betax = 1
	betay = 4
	firetime = 0.5
	def __init__(self, pos, dytarget):
		Ship.__init__(self, pos)
		self.dytarget = dytarget
		self.xtarget = 0
	def move(self, dt):
		self.ytarget = state.yc + self.dytarget
		self.ay = self.ky * (self.ytarget - self.y)
		self.ax = self.kx * (self.xtarget - self.x)
		Ship.move(self, dt)
		self.vy += (state.vyc - self.vy) * self.betay * dt
		self.vx += (0 - self.vx) * self.betax * dt
		self.vx = min(max(self.vx, -4), 4)
	def constrainvelocity(self):
		self.vy = max(self.vy, 1)
	def think(self, dt):
		if abs(self.xtarget - self.x) < 0.1:
			self.xtarget = uniform(-settings.lwidth, settings.lwidth)
		if abs(self.ay) < 1:
			self.fire(dt)
		Ship.think(self, dt)

	def fire(self, dt):
		if random() * self.firetime < dt:
			pos = self.x, self.y + 0.1, 0.2
			vel = uniform(-5, 5), self.vy + 4, 10
			state.hazards.append(Mine(pos, vel))

class Boss1(Boss):
	hp0 = 12
	firetime = 1
	level = 3
	def __init__(self, pos, dytarget):
		Boss.__init__(self, pos, dytarget)
		self.layers = []
		for jlayer in range(self.level):
			dy = 0.4 * (jlayer - (self.level - 1) / 2)
			self.layers.append(["pirate-sail-%s.png" % choice([0,1,2]), dy])
		for jlayer in range(self.level+1):
			dy = 0.4 * (jlayer - self.level / 2)
			self.layers.append(["pirate-body-%s.png" % choice([0,1,2]), dy])
		self.ascale = 2

class Bosslet(Boss1):
	hp0 = 20
	level = 2
	def fire(self, dt):
		nboss = sum(b.alive for b in state.bosses)
		if random() * self.firetime * nboss < dt:
			pos = self.x, self.y + 0.1, 0.2
			vel = uniform(-5, 5), self.vy + 4, 10
			state.hazards.append(Mine(pos, vel))
	

class Balloon(Boss):
	alwaysinrange = True
	ky = 1
	betax = 4
	kx = 1
	r = 0.7
	h = 6
	ascale = 2
	hp0 = 20
	def __init__(self, pos, dytarget):
		Boss.__init__(self, pos, dytarget)
		self.layers = [
			["baloon-body-0.png", 0.5],
			["baloon-body-0.png", 0],
			["baloon-body-1.png", -0.5],
			["baloon-gondola.png", 0.5],
			["baloon-gondola.png", 0.375],
			["baloon-gondola.png", 0.25],
			["baloon-gondola.png", 0.125],
			["baloon-gondola.png", 0],
			["baloon-gondola.png", -0.125],
			["baloon-gondola-sails.png", -0.25],
			["baloon-gondola.png", -0.375],
			["baloon-gondola.png", -0.5],
		]
		self.xtarget = 0
		self.z = 6
	def constrainvelocity(self):
		self.vy = max(self.vy, 1)
		if abs(self.ytarget - self.y) > 1:
			self.ax = self.vx = self.x = 0
	def think(self, dt):
		Boss.think(self, dt)
		self.z = 6 + 1.4 * sin(self.t * 1)
	def fire(self, dt):
		if random() * 0.8 < dt:
			pos = self.x, self.y, self.z - 1
			vel = uniform(-5, 5), self.vy + uniform(-2, 2), 4
			state.hazards.append(Mine(pos, vel))
	


	

