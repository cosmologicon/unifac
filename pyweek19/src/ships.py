import math
import vista, img, settings

class Ship(object):
	vmax = 1
	a = 1

	def __init__(self):
		self.x, self.y = 0, 0
		self.vx, self.vy = 0, 0
		self.angle = 0
		self.target = None

	def think(self, dt):
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

		if self.vx or self.vy:
			v = math.sqrt(self.vx ** 2 + self.vy ** 2)
			if v > self.vmax:
				self.vx *= self.vmax / v
				self.vy *= self.vmax / v
			self.angle = math.degrees(math.atan2(-self.vx, -self.vy))
		
		self.x += self.vx * dt
		self.y += self.vy * dt
			
		
	def draw(self):
		screenpos = vista.worldtoscreen((self.x, self.y))
		img.draw(self.imgname, screenpos, angle = self.angle, scale = vista.scale / settings.imgscale)
		

class You(Ship):
	imgname = "ship1a"


