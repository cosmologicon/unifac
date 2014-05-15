from random import *
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
	def __init__(self, pos, dytarget):
		Ship.__init__(self, pos)
		self.layers = []
		self.dytarget = dytarget
		dys = [0.08 * x for x in range(-3, 4)]
		for dy in dys:
			self.layers.append([randomcolor(), dy])
		self.xtarget = 0
	def move(self, dt):
		self.ytarget = state.yc + self.dytarget
		self.ay = self.ky * (self.ytarget - self.y)
		self.ax = self.kx * (self.xtarget - self.x)
		Ship.move(self, dt)
		self.vy += (settings.vyc - self.vy) * self.betay * dt
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
		if random() * 0.5 < dt:
			pos = self.x, self.y + 0.1, 0.2
			vel = uniform(-5, 5), self.vy + 4, 10
			state.hazards.append(Mine(pos, vel))

class Bosslet(Boss):
	hp0 = 20
	def fire(self, dt):
		nboss = sum(b.alive for b in state.bosses)
		if random() * 0.5 * nboss < dt:
			pos = self.x, self.y + 0.1, 0.2
			vel = uniform(-5, 5), self.vy + 4, 10
			state.hazards.append(Mine(pos, vel))
	

class Balloon(Boss):
	alwaysinrange = True
	ky = 1
	betax = 0.1
	kx = 1
	def __init__(self, pos):
		Ship.__init__(self, pos)
		self.layers = [["rgb255,0,0", 0]]
		self.xtarget = 0
		self.z = 6
	def constrainvelocity(self):
		self.vy = max(self.vy, 1)
		if abs(self.ytarget - self.y) > 1:
			self.ax = self.vx = self.x = 0
	def fire(self, dt):
		if random() * 0.5 < dt:
			pos = self.x, self.y, self.z - 1
			vel = uniform(-5, 5), self.vy + uniform(-2, 2), 4
			state.hazards.append(Mine(pos, vel))
	


	

