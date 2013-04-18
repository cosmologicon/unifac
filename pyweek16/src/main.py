import logging, pygame
import settings, client, util, vista

log = logging.getLogger(__name__)

def main():
	username, password = util.getlogin()
	with client.run(username, password):
		vista.init()
		clock = pygame.time.Clock()
		while client.playing:
			dt = clock.tick(60) * 0.001
			client.think(dt)
			if not client.started:
				continue
			vista.think(min(dt, 0.05))
			vista.draw()
		log.debug("Completing client.playing loop")
	pygame.quit()
	log.debug("quitting")


