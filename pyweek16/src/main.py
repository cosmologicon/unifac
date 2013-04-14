from lib.websocket import websocket
import logging, pygame
import settings, client, util, vista

log = logging.getLogger(__name__)

def main():
	username = util.getlogin()
	with client.run(username):
		vista.init()
		clock = pygame.time.Clock()
		while client.playing:
			clock.tick(60)
			client.think()
			if not client.started:
				continue
			vista.draw()
		log.debug("Completing client.playing loop")
	pygame.quit()
	log.debug("quitting")


