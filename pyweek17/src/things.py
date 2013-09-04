import random, math
from OpenGL.GL import *
from vec import vec
import graphics, state, lighting

class Thing(object):

	alive = True

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
		# return self.drawoutline1()
		self.xform()
		self.light()
		self.draw0()

	def light(self):
		pass
	
	# http://www.codeproject.com/Articles/8499/Generating-Outlines-in-OpenGL
	def drawoutline1(self):
		self.xform()
		glPushAttrib(GL_ALL_ATTRIB_BITS)
		glEnable(GL_POLYGON_OFFSET_FILL)
		glPolygonOffset(-2.5, -2.5)
		glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)
#		glDisable(GL_LIGHTING)
		glLineWidth(3)
		glColor(1, 1, 1)
		graphics.coloroverride = 1, 1, 1
		self.draw0()
		graphics.coloroverride = None
		glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)
		glEnable(GL_LIGHTING)
		glColor(0, 0, 0)
		self.draw0()
		glPopAttrib()

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


class Copter(Thing):
	ay = 10
	ax = 10
	vxmax = 6
	vymax = 10
	cruise = 14
	
	returns = True
	
	def __init__(self, home, target):
		Thing.__init__(self, home.u, home.f)
		self.vy = 0
		self.vx = 0
		self.home = home
		self.target = target
		self.seek(target.u)
		self.payload = None
		state.copters.append(self)

	def seek(self, p):
		self.targetp = p
		self.targeth = self.cruise
		self.vy = 0
		self.vx = 0

	def arrive(self, where):
		self.targetp = None
		self.vx = 0
		where.receive(self)

	def think(self, dt):
		# TODO: what if the target disappears while in transit?
		dh = self.targeth - self.h if self.targeth is not None else 0
		if dh > 0:
			self.vy = min(self.vy + self.ay * dt, 4 * dh, self.vymax)
		if self.targetp and dh <= 0.1:
			f = self.targetp.rej(self.u)
			L = f.length()
			if L:
				self.f = f.times(1/L)
				self.l = self.u.cross(self.f)
			self.vx = min(self.vx + dt * self.ax, self.vxmax)
			d = self.u.dot(self.targetp)
			if d > 0:
				D = self.u.cross(self.targetp).length() * (state.R + self.h)
				self.vx = min(self.vx, self.vxmax * D * 0.5)
				if D < 6:
					if dh < 0:
						self.vy = max(self.vy - self.ay * dt, 4 * dh, -self.vymax)
					self.targeth = self.target.h + 2
				if D < 0.2 and abs(dh) < 0.1:
					self.arrive(self.target)

		self.h += self.vy * dt
		self.travel(self.vx * dt)
		
		if self.payload:
			self.payload.think(dt)

	def draw(self):
		glMatrixMode(GL_MODELVIEW)
		Thing.draw(self)
		if self.payload:
			glTranslate(0, 0, -2)
			self.payload.draw0()

	def draw0(self):
		glRotate(4 * self.vx, 0, 1, 0)
		graphics.draw(graphics.block)



class Structure(Thing):
	# Mechanics
	buff = 3  # The closest two structures can be built is self.buff + other.buff
	reach = None   # Wires between structures can reach up to a distance of self.reach + other.reach
	               # Defaults to buff + 1
	pneeds = 1, 0, 0
	pcap = 0, 0, 0
	power = False, False, False
	powered = False
	cost = 1, 0


	guy = 3  # Height at which wires are connected
	rguy = 0
	color = 1, 1, 1
	shortname = None
	
	invalid = False

	def light(self):
		if self.invalid:
			lighting.invalid()
		elif not self.powered:
			lighting.disabled()
		else:
			lighting.normal()
	
	def draw0(self):
		r = self.buff * 0.6
		glScale(r, r, 3*r)
		graphics.draw(graphics.block, coloroverride=self.color)

	copter = None
	coptertype = Copter
	def dispatch(self, target):
		self.copter = self.coptertype(self, target)


class HQ(Structure):
	power = True, True, True
	powered = True
	pneeds = 0, 0, 0
	pcap = 10, 10, 10

	def draw(self):
		Structure.draw(self)
		h = self.t % 1
		glTranslate(0, 0, 4 + h * 20)
		glScale(h*4, h*4, 1)
		glColor(0, 1, 1, 1 - h)
		glBegin(GL_LINE_LOOP)
		for j in range(12):
			A = j * math.tau / 12
			glVertex(math.sin(A), math.cos(A), 0)
		glEnd()


class Material(Thing):
	resources = 1, 0

	def __init__(self, parent):
		self.parent = parent
		self.carrier = None
		Thing.__init__(self, parent.u, parent.f)
		self.h = 0
		state.stuff.append(self)
		self.rot = vec(0, 0, 0)
		self.vrot = vec(0, 0, 0)
	
	def receive(self, carrier):
		self.carrier = carrier
		carrier.payload = self
		self.parent.payload = None
		self.parent = None
		carrier.target = carrier.home
		carrier.seek(carrier.home.u)
		state.stuff.remove(self)

	def think(self, dt):
		Thing.think(self, dt)
		self.h = min(self.h + dt * 2, 6)
		self.vrot = self.vrot.plus(vec.randomunit(10 * dt)).norm()
		self.rot = self.rot.plus(self.vrot.times(dt))

	def draw0(self):
		A = self.rot.length()
		if A:
			glRotate(math.degrees(A), *self.rot.norm())
		lighting.glow()
		graphics.draw(graphics.stone, coloroverride=(0.5,0.2,0.5))

class Extractor(Structure):
	color = 0.8, 0.6, 0.4
	rguy = 2
	
	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.payload = None
	
	def think(self, dt):
		Structure.think(self, dt)
		if not self.payload:
			self.payload = Material(self)

	def draw0(self):
		graphics.draw(graphics.mine, self.t/1)



class Collector(Structure):
	color = 0.4, 0.8, 0.6

	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.copter = None
	
	def think(self, dt):
		Structure.think(self, dt)
		if not self.copter:
			if state.stuff:
				self.dispatch(state.stuff[0])

	def receive(self, copter):
		if copter is self.copter:
			state.collect(copter.payload)
			state.copters.remove(copter)
			self.copter = None


class Launchpad(Structure):
	pass

class Satcon(Structure):
	pass


class WRelay(Structure):
	reach = 10
	guy = 8
	pneeds = 1, 0, 0
	cost = 2, 0

	def draw0(self):
		graphics.draw(graphics.relay[0], self.t/1)

class BRelay(WRelay):
	pneeds = 0, 1, 0

	def draw0(self):
		graphics.draw(graphics.relay[1], self.t/1)

class RRelay(WRelay):
	pneeds = 0, 0, 1

	def draw0(self):
		graphics.draw(graphics.relay[2], self.t/1)


class WBasin(Structure):
	buff = 4
	guy = 4
	pneeds = 1, 0, 0
	cost = 2, 0

	def draw0(self):
		graphics.draw(graphics.basin[0], self.t/1)

class BBasin(WBasin):
	pneeds = 0, 1, 0

	def draw0(self):
		graphics.draw(graphics.basin[1], self.t/1)

class RBasin(WBasin):
	pneeds = 0, 0, 1

	def draw0(self):
		graphics.draw(graphics.basin[2], self.t/1)


class Car(Thing):

	def __init__(self, *args):
		Thing.__init__(self, *args)
		self.h = random.uniform(10, 20)
	
	def draw0(self):
		glRotate(90, 0, 1, 0)
		graphics.draw(graphics.tower)

	def think(self, dt):
		self.travel(20 * dt)

class WSat(Thing):
	cruise = 20
	vx = 20
	gpower = 2, 0, 0
	shortname = "W-Sat"
	
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

	def xform(self):
		Thing.xform(self)
		glRotate(80 * self.t % 360, 0, 0, 1)

	def draw0(self):
		graphics.draw(graphics.satellite[0])

class BSat(WSat):
	gpower = 0, 2, 0
	shortname = "B-Sat"

	def draw0(self):
		graphics.draw(graphics.satellite[1])

class RSat(WSat):
	gpower = 0, 0, 2
	shortname = "R-Sat"

	def draw0(self):
		graphics.draw(graphics.satellite[2])


class Mine(Structure):

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
	color = 0.7, 0.7, 0.7
	dcolor = 0.3, 0.3, 0.3
	t = 0
	def __init__(self, s0, s1):
		self.s0 = s0
		self.s1 = s1
		
		
		self.u0 = self.s0.u
		self.u1 = self.s1.u
		
		df = self.s1.u.plus(self.s0.u.times(-1)).norm()
		self.df0 = df.times(self.s0.rguy)
		self.df1 = df.times(-self.s1.rguy)

	def think(self, dt):
		if self.s0.t > 1 and self.s1.t > 1:
			self.t += dt

	def draw(self):
		glDisable(GL_LIGHTING)
		glColor(*(self.color if self.s0.powered or self.s1.powered else self.dcolor))
		glBegin(GL_LINES)
		for j, dh in enumerate((0, 0.5, 1)):
			x = (1 + 0.2 * j) - self.t
			if x > 0:
				dh += 20 * (math.sqrt(1 + (2 * x) ** 2) - 1) / 2
			glVertex(self.s0.u.times(state.R + self.s0.guy - dh).plus(self.df0))
			glVertex(self.s1.u.times(state.R + self.s1.guy - dh).plus(self.df1))
		glEnd()
		glEnable(GL_LIGHTING)

