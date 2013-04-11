import pygame, cPickle
import settings, vista, client, gamestate
from pygame.locals import *

if False:
	import fakeclient as client

def main():
	name, password = settings.getlogindata()
	with client.run(name, password):
		vista.init()
		clock = pygame.time.Clock()
		while client.playing:
			clock.tick(30)
			client.processupdates()
			if not client.started:
				continue
			state = client.think()
			vista.draw(state)
#	vista.makemap()
	pygame.quit()

