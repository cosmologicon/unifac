import pygame, math, numpy, random, cPickle
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, random, graphics, camera, text, things, state, cursor, hud, lighting, info, sound, scenes.game
from vec import vec

playing = True
alpha = 0
lines = []
def init():
	glEnable(GL_COLOR_MATERIAL)
	glColorMaterial(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE)
	glEnable(GL_NORMALIZE)

	lighting.init()
	hud.init()
	camera.init()
	global playing, alpha
	playing = True
	alpha = 0
	global lines
	lines = list(info.dialogue[settings.level]) + [info.missionhelp[settings.level]]
	hud.dialoguebox.settext(lines.pop(0))

def think(dt, events, kpress, mpos):
	global alpha, playing
	playing = bool(hud.dialoguebox)
	if playing:
		alpha = min(1 * dt + alpha, 1)
	else:
		alpha -= 1 * dt
		if alpha <= 0:
			state.init()
			scene.swap(scenes.game)
			return
	sound.setvolume(alpha)

	if kpress[K_ESCAPE]:
		playing = False

	for event in events:
		if event.type == MOUSEBUTTONDOWN:
			if event.button == 1:
				hud.dialoguebox.settext(lines.pop(0) if lines else None)
		if event.type == KEYDOWN and event.key == K_SPACE:
			hud.dialoguebox.settext(lines.pop(0) if lines else None)
		if event.type == KEYDOWN and event.key == K_F12:
			graphics.screenshot()

	dx, dy, dr, dA = -0.02 * dt, -0.005 * dt, 0, 0
	camera.move(1 * dx, 1 * dy, 0.7 * dr, 0.7 * dA)
	camera.think(dt)

	hud.think(dt)


def draw(mpos):
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
	glEnable(GL_DEPTH_TEST)

	camera.look()

	glDisable(GL_LIGHTING)
	graphics.draw(graphics.stars, min(settings.sx * settings.sy / 2000000., 1))
	glEnable(GL_LIGHTING)

	text.setup()

	hud.dialoguebox.draw()

	if alpha < 1:
		glPushMatrix()
		graphics.fill(0, 0, 0, 1-alpha)
		glPopMatrix()
		glEnable(GL_TEXTURE_2D)

	glDisable(GL_TEXTURE_2D)


