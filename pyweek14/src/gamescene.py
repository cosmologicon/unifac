import pygame, random
import vista, gamemap, tech, gamestate, foe

class GameScene():
    def __init__(self):
        gamestate.loadlevel()
    
    def think(self, dt, events):
        vista.think(dt)
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_TAB:
                vista.swapmode()
            if event.type == pygame.MOUSEBUTTONUP and vista.minirect.collidepoint(event.pos):
                vista.swapmode()
                
        if not vista.ftrans:  # not transitioning
            if vista.mode:
                gamemap.think(dt, events)
            else:
                tech.think(dt, events)

        if random.random() < dt * 1.:
            gamestate.foes.append(foe.Foe())
        
        for t in gamestate.towers:
            t.think(dt)
        for f in gamestate.foes:
            f.think(dt)
        for f in gamestate.effects:
            f.think(dt)

    def draw(self):
        gamemap.draw()
        tech.draw()
        vista.drawwindows()
        
        vista.flip()




