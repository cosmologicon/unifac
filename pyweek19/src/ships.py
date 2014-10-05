import math, random
import vista, img, settings, weapon, state, effects

class Ship(object):
	vmax = 1
	a = 1
	laserable = False
	hp = 1

	def __init__(self, pos = (0, 0)):
		self.x, self.y = pos
		self.vx, self.vy = 0, 0
		self.angle = 0
		self.target = None
		self.weapons = self.makeweapons()

	def makeweapons(self):
		return []

	def think(self, dt):
		self.pursuetarget(dt)
		self.applyvmax()
		self.orient()
		self.x += self.vx * dt
		self.y += self.vy * dt
		for w in self.weapons:
			w.think(dt)
		if self.hp <= 0:
			self.die()

	def takedamage(self, damage):
		self.hp -= damage

	def pickrandomtarget(self):
		if self.target is None:
			self.target = self.x + random.uniform(-4, 4), self.y + random.uniform(-4, 4)

	def pursuetarget(self, dt):
		if self.target:
			tx, ty = self.target
			dx, dy = tx - self.x, ty - self.y
			d = math.sqrt(dx ** 2 + dy ** 2)
			if d < self.vmax * dt:
				self.x, self.y = self.target
				self.vx, self.vy = 0, 0
				self.target = None
			else:
				self.vx += self.a * dt * dx / d
				self.vy += self.a * dt * dy / d

	def allstop(self):
		self.target = None
		self.vx = self.vy = 0

	def applyvmax(self):			
		if self.vx or self.vy:
			v = math.sqrt(self.vx ** 2 + self.vy ** 2)
			if v > self.vmax:
				self.vx *= self.vmax / v
				self.vy *= self.vmax / v

	def orient(self):
		if self.vx or self.vy:
			self.angle = math.degrees(math.atan2(-self.vx, -self.vy))
		
	def draw(self):
		img.worlddraw(self.imgname, (self.x, self.y), angle = self.angle)

	def die(self):
		state.state.ships.remove(self)
		state.state.effects.append(effects.Explosion(self))
		

class You(Ship):
	imgname = "you"
	vmax = 3
	a = 3
	hp = 3

	def makeweapons(self):
		self.laser = weapon.YouLaser(self)
		return [self.laser]

	def draw(self):
		Ship.draw(self)
		if self.target:
			img.worlddraw("target", self.target)

class Mothership(Ship):
	imgname = "mother"

class Bogey(Ship):
	imgname = "bogey"
	vmax = 0.5
	a = 1
	laserable = True

	def think(self, dt):
		self.pickrandomtarget()
		Ship.think(self, dt)

	

