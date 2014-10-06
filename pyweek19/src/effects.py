import pygame
import state, img, vista

class Explosion(object):
	imgname = "boom"
	lifetime = 1
	def __init__(self, parent):
		self.x, self.y = parent.x, parent.y
		self.t = 0
	
	def think(self, dt):
		self.t += dt
		if self.t > self.lifetime:
			state.state.effects.remove(self)
			
	def draw(self):
		img.worlddraw(self.imgname, (self.x, self.y), angle = 0)

class Laser(object):
	lifetime = 0.1

	def __init__(self, obj0, obj1, color):
		self.obj0, self.obj1 = obj0, obj1
		self.t = 0
		self.color = color
	
	def think(self, dt):
		self.t += dt
		if self.t > self.lifetime:
			state.state.effects.remove(self)
			
	def draw(self):
		p0 = vista.worldtoscreen((self.obj0.x, self.obj0.y))
		p1 = vista.worldtoscreen((self.obj1.x, self.obj1.y))
		pygame.draw.line(vista.screen, self.color, p0, p1)


