import random, math
from OpenGL.GL import *
from vec import vec
import graphics, state

class Thing(object):
	def __init__(self, u=None, f=None):
		# f/l/u (front, left, up) is our x/y/z
		if u:
			self.u = u
		else:
			self.u = vec(*[random.uniform(-1,1) for _ in (0,1,2)]).norm()
		if f:
			self.f = f
		else:
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
		glTranslate(0, 0, state.R + self.h)
#		glScale(0.02, 0.02, 0.02)
	
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

class Mine(Thing):
	t = 0

	def think(self, dt):
		self.t += dt

	def draw0(self):
		A = 90 * min(max(0.5 + math.sin(self.t * 2), 0.1), 1)
		graphics.draw(graphics.platform)
		glTranslate(0, 0, 4.4)
		glPushMatrix()
		glRotate(-A, 0, 1, 0)
		graphics.draw(graphics.helmet)
		glPopMatrix()
		glRotate(180, 0, 0, 1)
		glRotate(-A, 0, 1, 0)
		graphics.draw(graphics.helmet)
	
class Wire(Thing):

	def __init__(self, p0, p1):
		h0 = p0.plus(p1).times(0.5)
		Thing.__init__(self, h0.norm(), p1.minus(h0).norm())
		self.h = h0.length() - 1
		self.h = 0.2
		self.p0 = p0
		self.p1 = p1

	def draw(self):
		glDisable(GL_LIGHTING)
		glLineWidth(1)
		glColor(0.6, 0.6, 0.3)
		glBegin(GL_LINES)
		for h in (3.5, 4, 4.5):
			glVertex(*self.p0.times(state.R + h))
			glVertex(*self.p1.times(state.R + h))
		glEnd()
		glEnable(GL_LIGHTING)

	def xform(self):
		self.matrix = self.f + (0,) + self.l + (0,) + self.u + (0, 0, 0, 0, 1)
		glMultMatrixf(self.matrix)
		glTranslate(0, 0, 1 + self.h)
		glScale(0.2, 0.02, 0.02)

	def draw0(self):
		graphics.draw(graphics.wire)


