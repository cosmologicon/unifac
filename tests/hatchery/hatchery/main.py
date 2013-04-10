import pygame, cPickle
import settings, vista, client, gamestate
from pygame.locals import *

if True:
	import fakeclient as client


playing = True

def processupdates():
	global playing
	for update in client.getupdates():
		utype = update[0]
		if utype == "disconnect":
			print "Disconnecting: ", update[1]
			playing = False
		elif utype == "logininfo":
			settings.savelogindata(update[1], update[2])
		elif utype == "galaxy":
			gamestate.galaxy.setstate(update[1])
		elif utype == "you":
			gamestate.you = gamestate.Stork(update[1])
			gamestate.gamestate.addstork(gamestate.you)
		else:
			raise ValueError("Unrecognized update: %s" % update)

def think(dt):
	global playing
	nmoves, lmoves = settings.parsemoves()
	gamestate.gamestate.advance(dt, {"you": nmoves}, gamestate.galaxy)
	if "quit" in nmoves:
		playing = False


def main():
	logindata = settings.getlogindata()
	with client.run(logindata):
		vista.init()
		clock = pygame.time.Clock()
		while playing:
			clock.tick(30)
			processupdates()
			if not gamestate.you:
				continue
			think(1./30)
			vista.draw()
#	vista.makemap()
	pygame.quit()

