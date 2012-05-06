import pygame
import scene, vista, settings, gamescene, gamestate

def main():
    pygame.init()
    vista.init()
    scene.push(gamescene.GameScene())
    clock = pygame.time.Clock()
    while True:
        dt = min(0.001 * clock.tick(settings.maxfps), 1. / settings.minfps)
        s = scene.top()
        if not s: break
        events = pygame.event.get()
        s.think(dt, events)
        s.draw()

        for event in events:
            if event.type == pygame.QUIT:
                gamestate.save()
                return
            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                gamestate.save()
                return


