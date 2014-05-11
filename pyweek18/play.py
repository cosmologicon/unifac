from pygame import *
from math import *
from random import *
import scene, camera, state

class Scene(object):
	def __init__(self):
		state.init()
		self.t = 0
	def think(self, dt, kpressed, kdowns):
		self.t += dt
		if kpressed[K_ESCAPE]:
			scene.pop()
		state.think(dt)
	def draw(self):
		camera.drawbackdrop()
		for l in state.getlayers():
			camera.drawlayer(l)


