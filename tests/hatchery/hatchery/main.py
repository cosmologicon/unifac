import pygame, cPickle
import settings, vista, client, gamestate
from pygame.locals import *

if False:
	import fakeclient as client

def main():
	pygame.mixer.pre_init(22050, -16, 2, 0)
	pygame.display.init()
	pygame.mixer.init()
	if settings.sx is None:
		px, py = max(pygame.display.list_modes())
		settings.sx, settings.sy = settings.size = px - 100, py - 100
	name, password = settings.getlogindata()
	with client.run(name, password):
		vista.init()
		clock = pygame.time.Clock()
		while client.playing:
			clock.tick(60)
			client.processupdates()
			if not client.started:
				continue
			state = client.think()
			vista.draw(state)
	vista.makemap()
	pygame.quit()

