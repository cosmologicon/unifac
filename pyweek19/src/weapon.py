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

class YouLaser(Laser):
	reach = 4
	color = 0, 255, 0
	


