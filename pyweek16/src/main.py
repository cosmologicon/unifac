import logging, pygame
import settings, client, util, vista, menu, userinput, sound
#import vidcap

log = logging.getLogger(__name__)

def main():
	pygame.init()
	pygame.mixer.init()
	sound.playmusic("iceflow")
	if settings.bosscode:
		util.savebosscode(settings.bosscode)
	vista.init()
	menu.loadtitle()
	menu.top().draw(vista.screen)
	pygame.display.flip()
	clock = pygame.time.Clock()
	while menu.stack:
		menu.top().draw(vista.screen)
		pygame.display.flip()
		dt = clock.tick(60) * 0.001
		inp = userinput.menuget()
		if "quit" in inp:
			pygame.quit()
			return
		if "select" in inp:
			if inp["select"] == "join":
				menu.pop()
				username, password = util.getlogin()
				runner = client.run(username, password)
				settings.BOSS = False
			if inp["select"] == "joinboss":
				menu.pop()
				bosscode = util.getbosscode()
				runner = client.bossrun(bosscode)
				settings.BOSS = True
			if inp["select"] == "quit":
				pygame.quit()
				return
	menu.loadmessage("connecting...")
	menu.top().draw(vista.screen)
	menu.pop()
	pygame.display.flip()

	with runner:
		clock = pygame.time.Clock()
		if settings.BOSS:
			menu.loadtraining("joinboss")
			sound.playmusic("cephalopod")
		else:
			sound.playmusic("space1990")
		while client.playing:
			dt = clock.tick(60) * 0.001
			client.think(dt)
			if not client.started:
				if menu.stack:
					menu.top().draw(vista.screen)
					pygame.display.flip()
				continue
			vista.think(min(dt, 0.05))
			vista.draw()
	pygame.quit()


