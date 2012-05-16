import pygame, random
import vista, gamemap, tech, gamestate, foe, data, scene, effect, settings, mechanics

class GameScene(object):
    def __init__(self):
        gamestate.loadlevel()
        data.playspeech("level0", queue=True)
        data.playmusic(["wander", "chill", "drive", "wander", "lame-monster-party"][gamestate.level])
        self.title = effect.Title(mechanics.titles[gamestate.level])
        self.wintitle = effect.Title("Victory!")
        self.losetitle = effect.Title("Defeat!" if gamestate.level < 4 else "The end. Thank you!")
        self.won = False
        self.t = 0
        self.foequeue = sorted(mechanics.foequeues[gamestate.level])
    
    def think(self, dt, events):
        if settings.doubletime:
            dt *= 2
        self.t += dt
        vista.think(dt)
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_TAB:
                vista.swapmode()
            if event.type == pygame.MOUSEBUTTONUP and vista.minirect.collidepoint(event.pos):
                vista.swapmode()
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F11:
                self.won = True
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F10:
                gamestate.hp = 0
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F1:
                gamestate.level = 0
                scene.pop()
                scene.push(GameScene())
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F2:
                gamestate.level = 1
                scene.pop()
                scene.push(GameScene())
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F3:
                gamestate.level = 2
                scene.pop()
                scene.push(GameScene())
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F4:
                gamestate.level = 3
                scene.pop()
                scene.push(GameScene())
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F5:
                gamestate.level = 4
                scene.pop()
                scene.push(GameScene())
                
        if not vista.ftrans and self.losetitle:  # not transitioning
            if vista.mode:
                gamemap.think(dt, events)
            else:
                tech.think(dt, events)

        if self.foequeue and self.t > self.foequeue[0][0]:
            t, cls, path = self.foequeue.pop(0)
            gamestate.foes.append(cls(path))
        
        if gamestate.hp > 0 and not self.foequeue and not gamestate.foes:
            self.won = True
        
        for t in gamestate.towers:
            t.think(dt)
        for f in gamestate.foes:
            f.think(dt)
        for f in gamestate.effects:
            f.think(dt)
        if self.won:
            self.wintitle.think(dt)
            if not self.wintitle:
                gamestate.level += 1
                scene.pop()
                scene.push(GameScene())
        elif gamestate.hp > 0:
            self.title.think(dt)
        else:
            self.losetitle.think(dt)
            gamestate.foes = []
            self.foequeue = []
            if not self.losetitle and gamestate.level < 4:
                scene.pop()
                scene.push(GameScene())

    def draw(self):
        gamemap.draw()
        tech.draw()
        vista.drawwindows()
        gamestate.drawHUD()
        
        self.title.draw()
        self.wintitle.draw()
        self.losetitle.draw()
        
        vista.flip()




