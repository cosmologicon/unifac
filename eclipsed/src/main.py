import settings

if settings.vidcap:
	import vidcap

import pygame, math, os.path, cPickle, random
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import scene, settings, scenes.game, scenes.menu, graphics, sound, state, data

math.tau = 2 * math.pi

class EventProxy(object):
	fields = "type button buttons key rel".split()
	def __init__(self, event):
		for field in self.fields:
			if hasattr(event, field):
				setattr(self, field, getattr(event, field))


def main():
	pygame.init()
	pygame.mixer.init()
	sound.setvolume(0)
	pygame.font.init()
	graphics.setmode()
	graphics.init()
	if settings.playback:
		state0, record = cPickle.load(open(data.filepath("record.pkl"), "rb"))
		state.loadobj(state0)
	elif settings.restart:
		state.init()
	else:
		state.load()
	scene.push(scenes.game if settings.skipmenu else scenes.menu)
	clock = pygame.time.Clock()

	if settings.playback:
		for rstate, dt, events, kpress, mpos in record:
			clock.tick(settings.fps)
			s = scene.top()
			random.setstate(rstate)
			if settings.vidcap:
				vidcap._mpos = mpos
			s.think(dt, events, kpress, mpos)
			s.draw(mpos)
			pygame.display.flip()
		return

	if settings.getrecord:
		record = []
		state0 = cPickle.loads(cPickle.dumps(state.saveobj()))
	while scene.top():
		dt = min(0.001 * clock.tick(settings.fps), 0.5)
		if settings.fixfps:
			dt = 1.0 / settings.fps
		s = scene.top()
		while dt > 0:
			tdt = min(dt, 0.1)
			events = map(EventProxy, pygame.event.get())
			kpress = pygame.key.get_pressed()
			mpos = pygame.mouse.get_pos()
			if settings.getrecord:
				record.append((random.getstate(), tdt, events, kpress, mpos))

			s.think(tdt, events, kpress, mpos)
			dt -= tdt
		s.draw(mpos)
		pygame.display.flip()

	graphics.quit()
	
	if settings.getrecord:
		cPickle.dump([state0, record], open(data.filepath("record.pkl"), "wb"))



