import pygame
import vista, gamemap, tech

class GameScene():
    def __init__(self):
        pass
    
    def think(self, dt, events):
        vista.think(dt)
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_TAB:
                vista.swapmode()

    def draw(self):
        gamemap.draw()
        tech.draw()
        vista.drawwindows()
        
        vista.flip()




