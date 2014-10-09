import math, random
import vista, img, settings, weapon, state, effects

class Ship(object):
	vmax = 1
	a = 1
	laserable = False
	drillable = False
	fadeable = True
	shootsyou = False
	leavessmoke = True
	hp = 1
	iname = None
	radius = 1  # for drawing purposes

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

	def faded(self):
		if not self.fadeable:
			return False
		dx, dy = self.x - vista.x0, self.y - vista.y0
		return dx ** 2 + dy ** 2 > settings.fadedistance ** 2

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
				v = math.sqrt(self.vx ** 2 + self.vy ** 2)
				if v:
					w = math.exp(((dx * self.vx + dy * self.vy) / (d * v) - 1) * 40 * dt / d)
					self.vx *= w
					self.vy *= w
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
		if not vista.isvisible((self.x, self.y), self.radius):
			return
		img.worlddraw(self.imgname, (self.x, self.y), angle = self.angle)

	def die(self):
		state.state.ships.remove(self)
		if self.leavessmoke:
			state.state.effects.append(effects.Explosion(self))
		

class You(Ship):
	imgname = "you"
	vmax = 1
	a = 1
	hp = 3
	fadeable = False

	def makeweapons(self):
		self.laser = weapon.YouLaser(self)
		self.gun = weapon.Gun(self)
		return [self.laser, self.gun]

	def draw(self):
		Ship.draw(self)
		if self.target:
			img.worlddraw("target", self.target)

class Mothership(Ship):
	imgname = "mother"
	fadeable = False
	radius = 1
	iname = "mother"

	def within(self, (x, y)):
		return (x - self.x) ** 2 + (y - self.y) ** 2 <= self.radius ** 2

class Rock(Ship):
	imgname = "rock"
	hp = 1
	drillable = True
	laserable = False
	vmin = 0.2
	vmax = 0.5

	def __init__(self, pos):
		Ship.__init__(self, pos)
		self.v = random.uniform(self.vmin, self.vmax)
		theta = random.uniform(0, math.tau)
		self.vx = self.v * math.sin(theta)
		self.vy = self.v * math.cos(theta)
		self.orient()

	def think(self, dt):
		self.x += self.vx * dt
		self.y += self.vy * dt
		if self.hp <= 0:
			self.die()

class Drone(Rock):
	imgname = "drone"
	hp = 3
	drillable = False
	laserable = True
	shootsyou = True
	shoottime = 0.7

	def __init__(self, pos):
		Rock.__init__(self, pos)
		self.t = 0
		self.zeta = random.uniform(0, math.tau)

	def makeweapons(self):
		return [weapon.Laser(self)]

	def think(self, dt):
		Rock.think(self, dt)
		self.t += dt
		if self.t > self.shoottime:
			self.t -= self.shoottime
			self.zeta += math.tau / 1.618033988749895
			vslug = 0.5
			slug = Slug(self, (vslug * math.sin(self.zeta), vslug * math.cos(self.zeta)))
			state.state.ships.append(slug)

class Guard(Ship):
	imgname = "guard"
	hp = 3
	laserable = True
	shootsyou = True
	v0 = 0.8

	def __init__(self, planet):
		Ship.__init__(self)
		self.planet = planet
		self.alpha = random.uniform(0, math.tau)
		self.beta = random.uniform(0.05, 0.2)
		self.R0 = self.planet.radius * random.uniform(1.1, 1.3)  # semimajor axis
		self.R1 = self.planet.radius * random.uniform(-0.8, 0.8)  # semiminor axis
		self.omega = self.v0 / self.R0
		self.theta = random.uniform(0, math.tau)
		self.think(0)
		self.think(0.01)

	def think(self, dt):
		self.theta += dt * self.omega
		self.alpha += dt * self.beta
		X = self.R1 * math.sin(self.theta)
		Y = self.R0 * math.cos(self.theta)
		S, C = math.sin(self.alpha), math.cos(self.alpha)
		x = self.planet.x + C * X + S * Y
		y = self.planet.y - S * X + C * Y
		self.vx, self.vy = x - self.x, y - self.y
		self.orient()
		self.x, self.y = x, y
		if self.hp <= 0:
			self.die()

	def makeweapons(self):
		return [weapon.Laser(self)]


class Slug(Ship):
	leavessmoke = False
	laserable = False
	shootsyou = True
	lifetime = 6
	hp = 1
	imgname = "slug"

	def __init__(self, parent, v):
		Ship.__init__(self, (parent.x, parent.y))
		self.vx, self.vy = v
		self.angle = 0
		self.t = 0

	def think(self, dt):
		self.t += dt
		if self.t > self.lifetime:
			self.die()
			return
		self.x += self.vx * dt
		self.y += self.vy * dt
		for w in self.weapons:
			w.think(dt)
		if self.hp <= 0:
			self.die()
		
	def makeweapons(self):
		return [weapon.Trigger(self)]
	

