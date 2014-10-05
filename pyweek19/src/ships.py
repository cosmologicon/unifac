import math
import vista, img, settings

class Ship(object):
	vmax = 1
	a = 1

	def __init__(self, pos = (0, 0)):
		self.x, self.y = pos
		self.vx, self.vy = 0, 0
		self.angle = 0
		self.target = None

	def think(self, dt):
		self.pursuetarget(dt)
		self.applyvmax()
		self.orient()
		self.x += self.vx * dt
		self.y += self.vy * dt

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
		

class You(Ship):
	imgname = "you"
	vmax = 3
	a = 3

	def draw(self):
		Ship.draw(self)
		if self.target:
			img.worlddraw("target", self.target)

class Mothership(Ship):
	imgname = "mother"



