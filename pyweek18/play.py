from pygame import *
from math import *
from random import *
import scene, camera, state, img, settings

class Scene(object):
	def __init__(self):
		state.init()
		self.t = 0
	def think(self, dt, kpressed, kdowns):
		self.t += dt
		if kpressed[K_ESCAPE]:
			scene.pop()
		dx = int(kpressed[K_RIGHT]) - int(kpressed[K_LEFT])
		jumping = K_UP in kdowns
		shooting = kpressed[K_SPACE]
		state.player.control(dx, jumping, shooting)
		if K_SPACE in kdowns:
			state.addheal(state.player)
		if settings.DEBUG and K_F2 in kdowns:
			state.hurt()
		state.think(dt)
	def draw(self):
		camera.drawbackdrop()
		camera.drawwave(40)
		for l in state.getlayers():
			camera.drawlayer(l)
		
		screen = display.get_surface()
		i = img.getimg("text: hull: %s/%s" % (state.player.hp, state.hpmax))
		screen.blit(i, (0, 0))


