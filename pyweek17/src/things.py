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
		self.t = 0

	def xform(self):
		self.matrix = self.f + (0,) + self.l + (0,) + self.u + (0, 0, 0, 0, 1)
		glMultMatrixf(self.matrix)
		glTranslate(0, 0, state.R + self.h)
#		glScale(0.02, 0.02, 0.02)
	
	def draw(self):
		self.xform()
		self.draw0()

	def think(self, dt):
		self.t += dt

	# apply horizontal motion
	def travel(self, dist, direct=None):
		direct = direct or self.f
		A = dist / (state.R + self.h)
		m = self.u.cross(direct).norm().rot(A)
		self.u = self.u.apply(m).norm()
		self.f = self.f.apply(m).rej(self.u).norm()
		self.l = self.u.cross(self.f)


class Structure(Thing):
	pass

class HQ(Structure):

	def draw0(self):
		graphics.draw(graphics.dish, self.t/1)


class Tower(Thing):
	t = 0

	def think(self, dt):
		self.t += dt

	def draw0(self):
		graphics.draw(graphics.dish, self.t/1)


class Car(Thing):

	def __init__(self, *args):
		Thing.__init__(self, *args)
		self.h = random.uniform(10, 20)
	
	def draw0(self):
		glRotate(90, 0, 1, 0)
		graphics.draw(graphics.tower)

	def think(self, dt):
		self.travel(20 * dt)

class Satellite(Thing):
	cruise = 20
	vx = 20
	
	def __init__(self, launcher, cruise=None):
		u = launcher.u
		A = random.random() * math.tau
		f = launcher.f.times(math.sin(A)).plus(launcher.l.times(math.cos(A)))
		Thing.__init__(self, u, f)
		self.vy = 0
		self.t = 0
		self.cruise = cruise or self.cruise

	def think(self, dt):
		self.t += dt
		self.h = self.cruise
		if self.t < 3:
			self.h *= 1 - (1 - self.t / 3) ** 2
		self.travel(self.vx * dt)

	def draw0(self):
		glRotate(80 * self.t, 0, 0, 1)
		graphics.draw(graphics.satellite)


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


class Copter(Thing):
	ay = 10
	ax = 10
	vxmax = 10
	vymax = 10
	cruise = 10
	
	def __init__(self):
		Thing.__init__(self, vec(0, 0, 1), vec(1, 0, 0))
		self.vy = 0
		self.vx = 0
		self.seek(vec(0, 1, 0))

	def seek(self, p):
		self.targetp = p
		self.targeth = self.cruise
		self.vy = 0
		self.vx = 0

	def arrive(self):
		self.targetp = None
		self.vx = 0

	def think(self, dt):
		if self.targeth is not None:
			dh = self.targeth - self.h
			if dh > 0:
				self.vy = min(self.vy + self.ay * dt, 4 * dh, self.vymax)
			else:
				self.vy = max(self.vy - self.ay * dt, 4 * dh, -self.vymax)
		if self.targetp:
			self.f = self.targetp.rej(self.u).norm()
			self.vx = min(self.vx + dt * self.ax, self.vxmax)
			d = self.u.dot(self.targetp)
			if d > 0:
				D = self.u.cross(self.targetp).length() * (state.R + self.h)
				self.vx = min(self.vx, 10 * D)
				if D < 6:
					self.targeth = 0
				if D < 0.2:
					self.arrive()

		self.h += self.vy * dt
		self.travel(self.vx * dt)

	def draw0(self):
		graphics.draw(graphics.block)


class Wire(Thing):
	t = 0

	def __init__(self, p0, p1):
		h0 = p0.plus(p1).times(0.5)
		Thing.__init__(self, h0.norm(), p1.minus(h0).norm())
		self.h = h0.length() - 1
		self.h = 0.2
		self.p0 = p0
		self.p1 = p1

	def draw(self):
		glDisable(GL_LIGHTING)
		glLineWidth(2)
		glColor(0.6, 0.6, 0.6)
		glBegin(GL_LINES)
		for j, h in enumerate((4.5, 4, 3.5)):
			x = (1 + 0.2 * j) - self.t
			if x > 0:
				h -= 10 * (math.sqrt(1 + (2 * x) ** 2) - 1) / 2
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

	def think(self, dt):
		self.t += dt

