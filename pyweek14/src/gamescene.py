import pygame, random
import vista, gamemap, tech, gamestate, foe, data, scene, effect, settings, mechanics

class GameScene(object):
    def __init__(self):
        gamestate.loadlevel()
        data.playspeech("level0", queue=True)
        data.playmusic(["wander", "chill", "drive", "wander", "lame-monster-party"][gamestate.level])
        self.title = effect.Title(mechanics.titles[gamestate.level])
        self.wintitle = effect.Title("Victory!")
        self.losetitle = effect.Title("Defeat!")
        self.won = False
    
    def think(self, dt, events):
        vista.think(dt)
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_TAB:
                vista.swapmode()
            if event.type == pygame.MOUSEBUTTONUP and vista.minirect.collidepoint(event.pos):
                vista.swapmode()
            if event.type == pygame.KEYDOWN and event.key == pygame.K_F11:
                self.won = True
                
        if not vista.ftrans and self.losetitle:  # not transitioning
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
        if self.won:
            self.wintitle.think(dt)
            if not self.wintitle:
                gamestate.level += 1
                scene.pop()
                scene.push(GameScene())
        elif gamestate.hp:
            self.title.think(dt)
        else:
            self.losetitle.think(dt)
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




