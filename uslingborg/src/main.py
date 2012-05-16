import pygame
import scene, vista, settings, gamescene, gamestate, data

def main():
    pygame.mixer.pre_init(11000, -16, 1, 256)
    pygame.init()
    data.initsound()
    vista.init()
    scene.push(gamescene.GameScene())
    clock = pygame.time.Clock()
    while True:
        dt = min(0.001 * clock.tick(settings.maxfps), 1. / settings.minfps)
        if settings.showfps:
            pygame.display.set_caption("%.1fps" % clock.get_fps())
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
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F12:
                pygame.image.save(vista.screen, "screenshot.png")


