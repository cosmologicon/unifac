import random
from OpenGL.GL import *
from vec import vec
import graphics

class Thing(object):
	def __init__(self):
		# f/l/u (front, left, up) is our x/y/z
		self.u = vec(*[random.uniform(-1,1) for _ in (0,1,2)]).norm()
		self.f = vec(0, 0, 1).cross(self.u)
		if self.f.length() <= 0.0001:
			self.f = vec(1, 0, 0)
		else:
			self.f = self.f.norm()
		self.l = self.u.cross(self.f)
		
		self.h = 0

	def xform(self):
		self.matrix = self.f + (0,) + self.l + (0,) + self.u + (0, 0, 0, 0, 1)
		glMultMatrixf(self.matrix)
		glTranslate(0, 0, 1 + self.h)
		glScale(0.02, 0.02, 0.02)
	
	def draw(self):
		self.xform()
		self.draw0()

	def think(self, dt):
		pass


class Tower(Thing):

	def draw0(self):
		graphics.draw(graphics.tower)


class Car(Thing):
	
	def draw0(self):
		glRotate(90, 0, 1, 0)
		graphics.draw(graphics.tower)

	def think(self, dt):
		self.u = self.u.plus(self.f.times(dt * 0.3)).norm()
		self.f = self.f.rej(self.u).norm()


