import pygame
import settings, vista, client
from pygame.locals import *

if True:
	import fakeclient as client


playing = True

def think():
	global playing
	nmoves, lmoves = settings.parsemoves()
	if "dx" in nmoves:
		vista.camera.x0 += 50 * nmoves["dx"]
	if "dy" in nmoves:
		vista.camera.y0 += 50 * nmoves["dy"]
	if "quit" in nmoves:
		playing = False
#	print client.getupdates()


def main():
	client.start()
#	try:
	if True:
		vista.init()
		clock = pygame.time.Clock()
		while playing:
			clock.tick(10)
			think()
			vista.draw()
#	except Exception as exc:
		client.stop()
#		raise exc
	pygame.quit()

