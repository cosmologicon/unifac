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
			if settings.DEBUG:
				scene.pop()
			else:
				scene.scenes.append(PauseScene(self))
		dx = int(kpressed[K_RIGHT]) - int(kpressed[K_LEFT])
		jumping = K_UP in kdowns
		shooting = kpressed[K_SPACE]
		state.player.control(dx, jumping, shooting)
		if settings.DEBUG and K_F2 in kdowns:
			state.player.hurt()
		if settings.DEBUG and K_F3 in kdowns:
			state.player.hp = state.maxhp = 1000
		if settings.DEBUG and K_F4 in kdowns:
			state.addboss()
		if settings.DEBUG and K_F5 in kdowns:
			state.beatboss()
		state.think(dt)
	def draw(self):
		camera.drawbackdrop()
		camera.drawwave(40)
		for l in state.getlayers():
			camera.drawlayer(l)
		
		screen = display.get_surface()
		i = img.getimg("text:hull: %s/%s" % (state.player.hp, state.hpmax))
		screen.blit(i, (0, 0))
		if state.mode == "boss" and state.bosses:
			hp = sum(b.hp for b in state.bosses)
			hp0 = sum(b.hp0 for b in state.bosses)
			i = img.getimg("bosshp:%s/%s" % (hp, hp0))
			screen.blit(i, i.get_rect(topright=(settings.sX-5, 5)))

class PauseScene(object):
	def __init__(self, scene0):
		self.scene0 = scene0
	def think(self, dt, kpressed, kdowns):
		if K_ESCAPE in kdowns:
			scene.pop()
		if K_q in kdowns:
			scene.pop()
			scene.pop()
	def draw(self):
		self.scene0.draw()
		screen = display.get_surface()
		screen.blit(img.getimg("grayfill"), (0, 0))
		X0, Y0 = settings.sX // 2, settings.sY // 2
		i = img.getimg("text:Esc: resume")
		screen.blit(i, i.get_rect(midbottom = (X0, Y0)))
		i = img.getimg("text:Q: quit")
		screen.blit(i, i.get_rect(midtop = (X0, Y0)))

