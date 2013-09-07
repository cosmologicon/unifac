import random, math
from OpenGL.GL import *
from vec import vec
import graphics, state, lighting, cursor, camera

class Thing(object):

	alive = True
	enabled = True   # set explicitly by player

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

	fx = False
	def drawfx(self):
		self.xform()
		self.drawfx0()

	def light(self):
		lighting.normal()
	
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
	
	def on(self):
		return self.alive


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

	def seekhome(self):
		self.target = self.home
		self.seek(self.home.u)

	def die(self):
		self.alive = False

	def checktarget(self):
		if self.target is self.home:
			if not self.home.alive:
				self.die()
		elif self.target and self.target.carrier and self.target.carrier is not self:
			self.seekhome()

	def think(self, dt):
		# TODO: what if the target disappears while in transit?
		dh = self.targeth - self.h if self.targeth is not None else 0
		if dh > 0:
			self.vy = min(self.vy + self.ay * dt, 4 * dh, self.vymax)
		self.checktarget()
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
		self.travel(self.vx * dt * self.home.boost)
		
		if self.payload:
			self.payload.think(dt)

	def draw(self):
		glMatrixMode(GL_MODELVIEW)
		Thing.draw(self)
		if self.payload:
			glTranslate(0, 0, -2)
			self.payload.draw0()

	def draw0(self):
		glRotate(10 * math.sqrt(abs(self.vx)), 0, 1, 0)
		graphics.draw(graphics.copter)


class Structure(Thing):
	# Mechanics
	buff = 4  # The closest two structures can be built is self.buff + other.buff
	reach = None   # Wires between structures can reach up to a distance of self.reach + other.reach
	               # Defaults to buff + 1
	pneeds = 1, 0, 0
	pcap = 0, 0, 0
	power = False, False, False
	powered = False
	cost = 1, 0, 0
	satcon = 0
	buildclock = 0.2
	
	info = "It's a buildng. What do\nyou want from me?"


	guy = 3  # Height at which wires are connected
	rguy = 0
	color = 1, 1, 1
	shortname = None
	tbuild = 1.0
	boost = 1
	
	dbuildclock = 0
	dlaunchclock = 0
	boostfactor = None
	
	invalid = False
	dummy = False  # cursor

	def light(self):
		if self.invalid:
			lighting.invalid()
		elif self is cursor.pointingto:
			lighting.select()
		elif not self.enabled:
			lighting.disabled()
		elif not self.powered:
			lighting.unpowered()
		else:
			lighting.normal()
	
	def draw0(self):
		r = self.buff * 0.6
		glScale(r, r, 3*r)
		graphics.draw(graphics.block, coloroverride=self.color)
	
	def drawpartial(self, model):
		f = 1 if self.dummy else self.t / float(self.tbuild)
		graphics.draw(model, f)

	copter = None
	coptertype = Copter
	def dispatch(self, target):
		self.copter = self.coptertype(self, target)

	helmetz = 0
	helmetf = 0
	opening = False
	def thinkhelmet(self, dt):
		self.helmetf += -3 * dt if self.opening else 3 * dt
		self.helmetf = min(max(self.helmetf, 0), 1)

	def drawhelmet(self):
		A = 80 * min(max(self.helmetf, 0), 1) + 10
		glTranslate(0, 0, self.helmetz)
		glPushMatrix()
		glRotate(-A, 0, 1, 0)
		graphics.draw(graphics.helmet)
		glPopMatrix()
		glRotate(180, 0, 0, 1)
		glRotate(-A, 0, 1, 0)
		graphics.draw(graphics.helmet)
	
	def on(self):
		return self.powered and self.enabled



class HQ(Structure):
	longname = "Command Center"
	power = True, True, True
	powered = True
	pneeds = 0, 0, 0
	pcap = 0, 0, 0
	
	dbuildclock = 0.02
	satcon = 2

	def draw0(self):
		graphics.draw(graphics.hq)


class Material(Thing):
	collectible = True
	resources = 1, 0, 0
	color = 0.5, 0.2, 0.5

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
		if self.parent:
			self.parent.payload = None
			self.parent = None
		carrier.seekhome()
		state.stuff.remove(self)

	def die(self):
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
		graphics.draw(graphics.stone, coloroverride=self.color)

class YMaterial(Material):
	resources = 1, 0, 0
	color = 0.6, 0.6, 0.2

class OMaterial(Material):
	resources = 0, 1, 0
	color = 0.7, 0.5, 0.2

class MMaterial(Material):
	resources = 0, 0, 1
	color = 0.6, 0.2, 0.6



class Debris(Thing):
	resources = 0, 0, 0
	
	def __init__(self, u):
		f = u.cross(vec.randomunit()).norm()
		self.carrier = None
		Thing.__init__(self, u, f)
		self.h = 0
		self.phi = random.uniform(0.8, 0.9)
		state.debris.append(self)

	def receive(self, carrier):
		self.carrier = carrier
		carrier.payload = self
		carrier.target = carrier.home
		carrier.seek(carrier.home.u)
		state.debris.remove(self)
	
	def draw0(self):
		a = math.sin(1000 + self.phi * self.t)
		self.color = 0.5 + 0.3 * a, 0.2 + 0.1 * a, 0.2 + 0.1 * a
#		lighting.glow()
		graphics.draw(graphics.stone, coloroverride=self.color)


class Asteroid(Thing):
	collectible = False
	vh = -10
	vx = 10
	
	color = 0.8, 0.3, 0.3

	def __init__(self, h):
		u = vec.randomunit()
		f = u.cross(vec.randomunit()).norm()
		Thing.__init__(self, u, f)
		self.h = h
		state.stuff.append(self)

	def think(self, dt):
		Thing.think(self, dt)
		self.travel(self.vx * dt)
		self.h += self.vh * dt
		if self.h <= 0:
			state.stuff.remove(self)
			state.effects.append(Explosion(self.u, self.f))
			Debris(self.u)

	def draw0(self):
		lighting.glow()
		graphics.draw(graphics.stone, coloroverride=self.color)

	

class WExtractor(Structure):
	shortname = "Y-EXTRACTOR"
	longname = "Yclepton Extractor"
	rguy = 2
	pneeds = 2, 0, 0
	cost = 2, 0, 0
	
	materialtype = YMaterial
	
	diglength = 15
	
	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.payload = None
		self.digtime = 0

	def canproduce(self):
		return self.digtime >= self.diglength
	
	def think(self, dt):
		Structure.think(self, dt)
		if not self.on():
			self.digtime = 0
			if self.payload:
				self.payload.die()
				self.payload = None
			return
		if not self.payload:
			self.digtime += dt * self.boost
			if self.canproduce():
				self.digtime = 0
				self.payload = self.materialtype(self)

	def draw0(self):
		self.drawpartial(graphics.mine[0])

class BExtractor(WExtractor):
	shortname = "O-EXTRACTOR"
	longname = "Octiron Extractor"
	pneeds = 0, 2, 0
	cost = 8, 0, 0
	materialtype = OMaterial

	def draw0(self):
		self.drawpartial(graphics.mine[1])

class RExtractor(WExtractor):
	shortname = "M-EXTRACTOR"
	longname = "Magnetic Monopole Extractor"
	pneeds = 0, 0, 2
	cost = 0, 8, 0
	materialtype = MMaterial

	def draw0(self):
		self.drawpartial(graphics.mine[2])

class Collector(Structure):
	longname = "Material Collector"
	color = 0.4, 0.8, 0.6

	pneeds = 3, 0, 0
	cost = 3, 0, 0

	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.copter = None
	
	def think(self, dt):
		Structure.think(self, dt)
#		if not self.copter:
#			if state.stuff:
#				self.dispatch(state.stuff[0])
		if self.t > self.tbuild:
			self.thinkhelmet(dt)
		if not self.on():
			if self.copter:
				self.copter.die()
				self.copter = None
			return
		if self.copter:
			D = self.u.cross(self.copter.u).length() * state.R
			self.opening = D < 2
			if self.copter.target is not self and self.copter.h > self.helmetz:
				self.opening = False
		else:
			self.opening = False


	def receive(self, copter):
		if copter is self.copter:
			state.collect(copter.payload)
			copter.die()
			self.copter = None

	helmetz = 4
	def draw0(self):
		self.drawpartial(graphics.barrel)
		if self.t > 1:
			self.drawhelmet()


class Launcher(Structure):
	longname = "Satellite Launchpad"

	pneeds = 4, 0, 0
	cost = 6, 0, 0
	
	guy = 5
	satcon = 2
	
	dlaunchclock = 0.02
	
	sat = None

	helmetz = 5.4
	def think(self, dt):
		Structure.think(self, dt)
		if self.t > self.tbuild:
			if self.sat is None:
				self.opening = False
			elif self.sat.h > 10:
				self.sat = None
				self.opening = False
			self.thinkhelmet(dt)

	def draw0(self):
		self.drawpartial(graphics.launchpad)
		if self.t > self.tbuild:
			self.drawhelmet()

	def launch(self, stype):
		sat = stype(self, random.uniform(18, 28), self.helmetz)
		state.satellites.append(sat)
		self.sat = sat
		self.opening = True


class Satcon(Structure):
	longname = "Satellite Control Dish"
	
	pneeds = 0, 2, 0
	cost = 0, 4, 0
	
	satcon = 4

	def draw0(self):
		self.drawpartial(graphics.dish)

	def draw(self):
		Structure.draw(self)
	
	fx = True
	def drawfx0(self):
		if self.t > self.tbuild and self.on():
			h = self.t % 1
			glTranslate(0, 0, 3 + h * 6)
			glScale(h*4, h*4, 1)
			glColor(0, 1, 1, 1 - h)
			glBegin(GL_LINE_LOOP)
			for j in range(12):
				A = j * math.tau / 12
				glVertex(math.sin(A), math.cos(A), 0)
			glEnd()

class WBooster(Structure):
	longname = "Wonderflonium Booster"

	pneeds = 15, 0, 0
	cost = 50, 10, 2
	
	cindex = 0

	boostfactor = 2

	
	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.phis = [random.uniform(2.2, 2.5) for _ in range(12)]
	
	def draw0(self):
		graphics.draw(graphics.spindle[self.cindex])
		As = [j * math.tau / 12 for j in (0, 2, 4, 6, 8, 10, 1, 3, 5, 7, 9, 11)]
		rs = [1.3] * 6 + [1.8] * 6
		dzs = [0 if self.dummy or not self.on() else 1.5] * 12
		Rs = [0.8] * 6 + [0.6] * 6
		for j, phi, A, r, dz, R in zip(range(12), self.phis, As, rs, dzs, Rs)[:6]:
			if not self.dummy and j * self.tbuild > 12 * self.t:
				continue
			S, C = math.sin(A), math.cos(A)
			z = 3.5 + dz * math.sin((1000 + self.t) * phi)
			glPushMatrix()
			glTranslate(r * S, r * C, z)
			glScale(R, R, R)
			graphics.draw(graphics.piston[self.cindex])
			glPopMatrix()

class BBooster(WBooster):
	longname = "Bombastium Booster"
	pneeds = 0, 10, 0
	cindex = 1
	

class RBooster(WBooster):
	longname = "Rodinium Booster"
	pneeds = 0, 0, 10
	cindex = 2


class Cleaner(Structure):
	longname = "Debris Removal Center"

	pneeds = 0, 0, 10
	cost = 5, 5, 10
	
	def __init__(self, *args):
		Structure.__init__(self, *args)
		self.copter = None
	
	def think(self, dt):
		Structure.think(self, dt)
		if self.t > self.tbuild:
			self.thinkhelmet(dt)

	helmetz = 3.6
	def draw0(self):
		self.drawpartial(graphics.trashbin)
		if self.t > self.tbuild:
			self.drawhelmet()
		if not self.on():
			if self.copter:
				self.copter.die()
				self.copter = None
			return
		if self.copter:
			D = self.u.cross(self.copter.u).length() * state.R
			self.opening = D < 2
			if self.copter.target is not self and self.copter.h > self.helmetz:
				self.opening = False
		else:
			self.opening = False

	def think(self, dt):
		Structure.think(self, dt)
		if self.t > self.tbuild:
			self.thinkhelmet(dt)


	def receive(self, copter):
		if copter is self.copter:
			copter.die()
			self.copter = None


class Medic(Structure):
	longname = "Structure Repair Center"

	pneeds = 0, 5, 0
	
	def think(self, dt):
		Structure.think(self, dt)
		if self.t > self.tbuild:
			self.opening = False
			self.thinkhelmet(dt)

	helmetz = 4.6
	def draw0(self):
		self.drawpartial(graphics.medic)
		if self.t > self.tbuild or self.dummy:
			glPushMatrix()
			self.drawhelmet()
			glPopMatrix()
			if not self.dummy and self.on():
				glRotate(self.t * 40 % 360, 0, 0, 1)
			graphics.draw(graphics.wings)



class WRelay(Structure):
	longname = "Wonderflonium Relay"
	reach = 10
	guy = 8
	pneeds = 1, 0, 0
	cost = 1, 0, 0

	def draw0(self):
		self.drawpartial(graphics.relay[0])

class BRelay(WRelay):
	longname = "Bombastium Relay"
	pneeds = 0, 1, 0
	cost = 0, 1, 0

	def draw0(self):
		self.drawpartial(graphics.relay[1])

class RRelay(WRelay):
	longname = "Rodinium Relay"
	pneeds = 0, 0, 1
	cost = 0, 0, 1

	def draw0(self):
		self.drawpartial(graphics.relay[2])


class WBasin(Structure):
	longname = "Wonderflonium Silo"
	guy = 4
	pneeds = 4, 0, 0
	pcap = 1000, 0, 0
	cost = 3, 0, 0

	def draw0(self):
		self.drawpartial(graphics.basin[0])

class BBasin(WBasin):
	longname = "Bombastium Silo"
	pneeds = 0, 4, 0
	pcap = 0, 1000, 0
	cost = 0, 3, 0

	def draw0(self):
		self.drawpartial(graphics.basin[1])

class RBasin(WBasin):
	longname = "Rodinium Silo"
	pneeds = 0, 0, 4
	pcap = 0, 0, 1000
	cost = 0, 0, 3

	def draw0(self):
		self.drawpartial(graphics.basin[2])


class WArtifact(Structure):
	longname = "Wonderflonium Artifact"
	pneeds = 50, 0, 0
	
	def draw0(self):
		self.drawpartial(graphics.artifact[0])

class BArtifact(WArtifact):
	longname = "Bombastium Artifact"
	pneeds = 0, 10, 0

	def draw0(self):
		self.drawpartial(graphics.artifact[1])

class RArtifact(WArtifact):
	longname = "Rodinium Artifact"
	pneeds = 0, 0, 10

	def draw0(self):
		self.drawpartial(graphics.artifact[2])



class WSat(Thing):
	cruise = 20
	vx = 20
	gpower = 10, 0, 0
	cost = 5, 0, 0
	shortname = "W-Sat"
	launchclock = 0.6
	
	def __init__(self, launcher, cruise=None, h0=0):
		u = launcher.u
		A = random.random() * math.tau
		f = launcher.f.times(math.sin(A)).plus(launcher.l.times(math.cos(A)))
		Thing.__init__(self, u, f)
		self.vy = 0
		self.t = 0
		self.cruise = cruise or self.cruise
		self.phi = (-1 if random.random() < 0.5 else 1) * random.uniform(40, 100)
		self.h = self.h0 = h0

	def think(self, dt):
		self.t += dt
		if self.launched:
			self.h = self.cruise
			if self.t < 3:
				self.h = self.h0 + (self.h - self.h0) * (1 - (1 - self.t / 3) ** 2)
			else:
				self.fdeploy = min(self.fdeploy + 0.3 * dt, 1)
		else:
			self.vh -= 8 * dt
			self.h += self.vh * dt
			if self.h < 0:
				self.alive = False
				state.effects.append(Explosion(self.u, self.f))
		self.f = self.f.plus(vec.randomunit(1 * dt)).rej(self.u).norm()
		self.travel(self.vx * dt)

	def xform(self):
		Thing.xform(self)
		glRotate(self.phi * self.t % 360, 0, 0, 1)
		if not self.launched:
			glRotate(self.vh * 50 % 360, 0, 1, 0)

	launched = True
	def unlaunch(self):
		self.launched = False
		self.vh = 0

	def on(self):
		return self.launched

	fdeploy = 0.35
	def draw0(self):
		graphics.draw(graphics.satellite[0], self.fdeploy)

class BSat(WSat):
	gpower = 0, 10, 0
	cost = 5, 0, 0
	shortname = "B-Sat"
	launchclock = 1

	def draw0(self):
		graphics.draw(graphics.satellite[1], self.fdeploy)

class RSat(WSat):
	gpower = 0, 0, 10
	cost = 5, 5, 0
	shortname = "R-Sat"
	launchclock = 1

	def draw0(self):
		graphics.draw(graphics.satellite[2], self.fdeploy)


class Wire(Thing):
	colors = (0.7, 0.7, 0.7), (0.4, 0.4, 1), (0.9, 0.5, 0.5)
	dcolors = (0.3, 0.3, 0.3), (0.2, 0.2, 0.5), (0.4, 0.2, 0.2)
	t = 0
	def __init__(self, s0, s1, c):
		self.s0 = s0
		self.s1 = s1
		self.c = c
		self.color = self.colors[c]
		self.dcolor = self.dcolors[c]
		
		
		self.u0 = self.s0.u
		self.u1 = self.s1.u
		
		df = self.s1.u.plus(self.s0.u.times(-1)).norm()
		self.df0 = df.times(self.s0.rguy)
		self.df1 = df.times(-self.s1.rguy)

	def think(self, dt):
		if self.s0.t > self.s0.tbuild and self.s1.t > self.s1.tbuild:
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

class Explosion(Thing):
	def __init__(self, *args):
		Thing.__init__(self, *args)
		self.ps = [vec(0, 0, 0) for _ in range(200)]
		self.vs = [vec.randomunit(random.uniform(5, 15)) for _ in range(200)]

	def think(self, dt):
		Thing.think(self, dt)
		if self.t > 0.6:
			self.alive = False

	def draw0(self):
		r, dz = 15 * self.t, 30 * self.t * self.t
		glPointSize(int(camera.wthick() * 25))
		glTranslate(0, 0, -dz)
		glScale(r, r, r)
		a = self.t / 0.6
		graphics.draw(graphics.splode, coloroverride = (0.1 + 0.5 * a, 0.1 + 0.3 * a, 0.1 + 0.1 * a, 1 - a))
		glPointSize(1)


