import pygame, logging, math
from pygame.locals import *
import vista, settings, menu

log = logging.getLogger(__name__)


mdownpos = {}
dragging = {}

def get():
	if menu.menu:
		return menuget()
	ret = {}
	mpos = pygame.mouse.get_pos()
	mtile = vista.screentotile(mpos)
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
				x, y = vista.screentotile(event.pos)
				ret["rotate"] = x, y, 4 - event.button
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				ret["quit"] = True
			if event.key == K_F12:
				ret["screenshot"] = True
			if event.key == K_1:
				ret["deploy"] = mtile, "power"
			if event.key == K_2:
				ret["deploy"] = mtile, "wall"
			if event.key == K_q:
				ret["qrequest"] = mtile
		if event.type == QUIT:
			ret["quit"] = True
	return ret

def menuget():
	ret = {}
	for event in pygame.event.get():
		if event.type == MOUSEBUTTONDOWN and event.button == 1:
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
		if event.type == MOUSEBUTTONUP:
			if event.button in dragging and not dragging[event.button]:
				ret["select"] = menu.menu.checkclick(event.pos)
				log.debug("SELECTION %s", ret["select"])
		if event.type == QUIT:
			ret["quit"] = True
	return ret


