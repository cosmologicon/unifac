import pygame, math, numpy, random
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, graphics, camera, text, things, state, cursor, hud, lighting, scenes.game, sound, info, scenes.dialogue
from vec import vec

playing = True
alpha = 0
selected = None
def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_NORMALIZE)

	lighting.init()
	state.init()
	hud.init()
	hud.menumode()
	camera.menuinit()
	global playing, alpha, selected
	playing = True
	alpha = 0
	selected = None

	sound.playmusic(info.music["menu"])
	
	state.R = 40
	

		
def resume():
	init()

def think(dt, events, kpress, mpos):

	global alpha
	if playing:
		alpha = min(2 * dt + alpha, 1)
	else:
		alpha -= 2 * dt
		if alpha <= 0:
			if selected is None:
				scene.pop()
			else:
				scene.push(scenes.dialogue)
			return
	sound.setvolume(alpha)

	if kpress[K_ESCAPE]:
		scene.pop()

	for event in events:
		if event.type == MOUSEBUTTONDOWN and event.button == 1:
			px, py = mpos
			if hud.click((px, settings.sy - py)):
				continue
		if event.type == KEYDOWN and event.key == K_CAPSLOCK:
			settings.swaparrows = not settings.swaparrows
		if event.type == KEYDOWN and event.key == K_F12:
			graphics.screenshot()

	dx, dy, dr, dA = -0.02 * dt, -0.005 * dt, 0, 0
	camera.move(1 * dx, 1 * dy, 0.7 * dr, 0.7 * dA)
	camera.think(dt)

	px, py = mpos
	hud.point((px, settings.sy - py))

	hud.think(dt)

def draw(mpos):
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)
#	glEnable(GL_CULL_FACE)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars, min(settings.sx * settings.sy / 2000000., 1))
	glEnable(GL_LIGHTING)

	if hud.mode == "level" and hud.labels["leveltitle"]:
		lighting.setmoonlight(*info.moonlights[settings.level])
		lighting.moon()
		glPushMatrix()
		r = info.Rs[settings.level]
		glScale(r, r, r)
		graphics.draw(graphics.moon)
		glPopMatrix()

	text.setup()

	hud.draw()

#	text.write(settings.gamename, "Homenaje", hud.f(4), (200, 200, 200), (settings.sx/2, settings.sy/2), (0, 0, 0))

	if alpha < 1:
		graphics.fill(0, 0, 0, 1-alpha)

	glDisable(GL_TEXTURE_2D)


