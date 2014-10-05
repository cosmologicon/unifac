import settings, scene, vista, gamescene
import pygame

pygame.init()
vista.init()
pygame.display.set_caption(settings.gamename)
scene.push(gamescene)

clock = pygame.time.Clock()
while True:
	scene0 = scene.top()
	if not scene0:
		break
	dt = clock.tick(settings.maxfps) * 0.001
	events = pygame.event.get()
	if settings.DEBUG:
		pygame.display.set_caption("%s | %.1ffps" % (settings.gamename, clock.get_fps()))
	if any(event.type == pygame.QUIT for event in events):
		break
	scene0.think(dt, events)
	vista.clear()
	scene0.draw()
	vista.flip()

pygame.quit()


