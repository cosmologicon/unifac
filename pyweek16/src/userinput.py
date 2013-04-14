import pygame, logging
from pygame.locals import *
import vista

log = logging.getLogger(__name__)

def get():
	ret = {}
	for event in pygame.event.get():
		if event.type == MOUSEBUTTONDOWN:
			log.debug("mousedown %s" % event.button)
			ret["leftclick"] = vista.screentoworld(event.pos)
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				ret["quit"] = True
		if event.type == QUIT:
			ret["quit"] = True
	return ret



