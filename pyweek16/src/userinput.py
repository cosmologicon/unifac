import pygame, logging, math
from pygame.locals import *
import vista, settings, menu

log = logging.getLogger(__name__)


mdownpos = {}
dragging = {}

def get():
	if menu.stack:
		return menuget()
	ret = {}
	mpos = pygame.mouse.get_pos()
	if vista.onhud(mpos):
		ret["hudpoint"] = vista.hudclick(mpos)
	ret["mtile"] = mtile = vista.screentotile(mpos)
	for event in pygame.event.get():
		if event.type == MOUSEBUTTONDOWN and event.button in (1,2,3):
			mdownpos[event.button] = event.pos
			dragging[event.button] = False
		if event.type == MOUSEMOTION and event.buttons[0]:
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
				if event.button == 1 and vista.onhud(event.pos):
					ret["hudclick"] = vista.hudclick(event.pos)
				else:
					x, y = vista.screentotile(event.pos)
					ret["rotate"] = x, y, 4 - event.button
			elif event.button in (4,5):
				if "scroll" not in ret:
					ret["scroll"] = 0
					ret["scrollpos"] = mpos
				ret["scroll"] += 1 if event.button == 4 else -1
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				ret["quit"] = True
			if event.key == K_F12:
				ret["screenshot"] = True
			if event.key == K_1:
				ret["deploy"] = mtile, "1laser0"
			if event.key == K_2:
				ret["deploy"] = mtile, "wall"
			if event.key == K_3:
				ret["deploy"] = mtile, "4laser"
			if event.key == K_4:
				ret["deploy"] = mtile, "2laser0"
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
				ret["select"] = menu.top().checkclick(event.pos)
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				ret["select"] = "cancel"
			if event.key == K_F12:
				ret["screenshot"] = True
		if event.type == QUIT:
			ret["quit"] = True
	return ret


