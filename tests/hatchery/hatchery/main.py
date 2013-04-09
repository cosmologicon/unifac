import pygame
import settings, vista, client, gamestate
from pygame.locals import *

if True:
	import fakeclient as client


playing = True

def processupdates():
	for update in client.getupdates():
		utype = update[0]
		if utype == "galaxy":
			gamestate.galaxy.setstate(update[1])
		if utype == "you":
			gamestate.gamestate.addyou(gamestate.Stork(update[1]))

def think(dt):
	global playing
	nmoves, lmoves = settings.parsemoves()
	gamestate.gamestate.advance(dt, {"you": nmoves}, gamestate.galaxy)
	if "quit" in nmoves:
		playing = False


def main():
	with client.run():
		vista.init()
		clock = pygame.time.Clock()
		while playing:
			processupdates()
			clock.tick(30)
			think(1./30)
			vista.draw()
	vista.makemap()
	pygame.quit()

