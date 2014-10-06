import math
import state, effects

class Weapon(object):
	cooldown = 1
	reach = 4
	damage = 1
	
	def __init__(self, parent):
		self.parent = parent
		self.tcool = 0

	def canfire(self):
		return self.tcool <= 0

	def canreach(self, obj):
		dx, dy = self.parent.x - obj.x, self.parent.y - obj.y
		return dx ** 2 + dy ** 2 < self.reach ** 2

	def think(self, dt):
		self.tcool = max(self.tcool - dt, 0)

	def fire(self, target):
		self.tcool = self.cooldown

class Laser(Weapon):
	reach = 2
	color = 255, 0, 0

	def fire(self, target):
		Weapon.fire(self, target)
		target.takedamage(self.damage)
		state.state.effects.append(effects.Laser(self.parent, target, self.color))

class Gun(Weapon):
	reach = 5
	damage = 5

	def fire(self, target):
		Weapon.fire(self, target)
		state.state.effects.append(effects.Bullet(self.parent, target, self.damage))	

	def canreach(self, obj):
		dx, dy = obj.x - self.parent.x, obj.y - self.parent.y
		d = math.sqrt(dx ** 2 + dy ** 2)
		if d > self.reach:
			return False
		vx, vy = self.parent.vx, self.parent.vy
		v = math.sqrt(vx ** 2 + vy ** 2)
		return dx * vx + dy * vy > 0.9 * d * v

class YouLaser(Laser):
	reach = 2
	color = 0, 255, 0
	


