from __future__ import division
import math, random, pygame
import vista, img, settings, weapon, state, effects

class Planet(object):
	radius = 2
	imgname = "planet"

	def __init__(self, pos):
		self.x, self.y = pos
		self.angle = 0

	def think(self, dt):
		pass

	def draw(self):
		if not vista.isvisible((self.x, self.y), self.radius):
			return
		scale = 2 * self.radius * settings.imgscale / 40
		img.worlddraw(self.imgname, (self.x, self.y), angle = self.angle, scale = scale)


class Sun(object):
	radius = 8

	def __init__(self, pos):
		self.x, self.y = pos

	def think(self, dt):
		pass

	def draw(self):
		if not vista.isvisible((self.x, self.y), self.radius):
			return
		img.worlddraw("sun-%s" % self.radius, (self.x, self.y), scale = 1)

