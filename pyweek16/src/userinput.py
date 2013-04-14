import pygame, logging, math
from pygame.locals import *
import vista, settings

log = logging.getLogger(__name__)


mdownpos = {}
dragging = {}

def get():
	ret = {}
	for event in pygame.event.get():
		if event.type == MOUSEBUTTONDOWN:
			mdownpos[event.button] = event.pos
			dragging[event.button] = False
		if event.type == MOUSEMOTION and 1 in event.buttons:
			button = 1
			if button not in mdownpos:
				mdownpos[button] = event.pos
				dragging[button] = True
			elif not dragging[button]:
				(x0, y0), (x, y) = mdownpos[button], event.pos
				if abs(x - x0) + abs(y - y0) > settings.mindrag:
					dragging[button] = True
			if dragging[button]:
				(x0, y0), (x, y) = mdownpos[button], event.pos
				if "drag" not in ret:
					ret["drag"] = [0, 0]
				ret["drag"][0] += x - x0
				ret["drag"][1] += y - y0
				mdownpos[button] = event.pos
		if event.type == MOUSEBUTTONUP:
			if event.button in dragging and not dragging[event.button]:
				ret["leftclick"] = vista.screentotile(event.pos)
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				ret["quit"] = True
			if event.key == K_F12:
				ret["screenshot"] = True
		if event.type == QUIT:
			ret["quit"] = True
	return ret


