from __future__ import division
import math, random, pygame
import vista, img, settings, weapon, state, effects

class Planet(object):
	radius = 2
	imgname = "planet"
	burns = False

	def __init__(self, pos):
		self.x, self.y = pos
		self.angle = 0

	def think(self, dt):
		pass

	def draw(self):
		if not vista.isvisible((self.x, self.y), self.radius):
			return
		img.worlddraw(self.imgname, (self.x, self.y), angle = self.angle, scale = 1)


class Sun(object):
	radius = 8
	burns = True

	def __init__(self, pos):
		self.x, self.y = pos

	def think(self, dt):
		pass

	def draw(self):
		if not vista.isvisible((self.x, self.y), self.radius):
			return
		img.worlddraw("sun-%s" % self.radius, (self.x, self.y), scale = 1)

