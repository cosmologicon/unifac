import pygame
import settings, scene, vista, gamescene, buildscene

pygame.init()
vista.init()
pygame.display.set_caption(settings.gamename)
scene.push(gamescene)
scene.push(buildscene)

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
	if any(event.type == pygame.KEYDOWN and event.key == pygame.K_F12 for event in events):
		vista.screenshot()

pygame.quit()


