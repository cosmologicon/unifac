import pygame, random
import vista, gamemap, tech, gamestate, foe, data, scene, effect, settings

class GameScene(object):
    def __init__(self):
        gamestate.loadlevel()
        data.playspeech("wander")
        self.title = effect.Title(settings.gamename)
        self.wintitle = effect.Title("Victory!")
        self.losetitle = effect.Title("Defeat!")
    
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

        if random.random() * 4 < dt:
            gamestate.foes.append(foe.Villager(random.choice(gamestate.paths)))
        if random.random() * 4 < dt:
            gamestate.foes.append(foe.Dog(random.choice(gamestate.paths)))
        if random.random() * 4 < dt:
            gamestate.foes.append(foe.Soldier(random.choice(gamestate.paths)))
        if random.random() * 4 < dt:
            gamestate.foes.append(foe.Horseman(random.choice(gamestate.paths)))
        
        for t in gamestate.towers:
            t.think(dt)
        for f in gamestate.foes:
            f.think(dt)
        for f in gamestate.effects:
            f.think(dt)
        if gamestate.hp:
            self.title.think(dt)
        else:
            self.losetitle.think(dt)
            if not self.losetitle:
                scene.pop()

    def draw(self):
        gamemap.draw()
        tech.draw()
        vista.drawwindows()
        gamestate.drawHUD()
        
        self.title.draw()
        self.losetitle.draw()
        
        vista.flip()




