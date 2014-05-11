from pygame import *
from math import *
import scene, camera

class Scene(object):
	def __init__(self):
		self.t = 0
		self.shipimg = Surface((40, 40)).convert_alpha()
		self.shipimg.fill((255, 0, 255))
		self.rockimg = Surface((20, 20)).convert_alpha()
		self.rockimg.fill((255, 255, 0))
	def think(self, dt, kpressed, kdowns):
		self.t += dt
		if kpressed[K_ESCAPE]:
			del scene.scenes[-1]
	def draw(self):
		camera.drawbackdrop()
		camera.drawslice(self.shipimg, (0, 0, 0.5 * sin(self.t)), 0.1 * cos(self.t))


