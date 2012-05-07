# Who's the REAL monster, ya'll?

import pygame, math, random
import vista, gamestate

class Foe(object):
    v = 8.0
    hp0 = 10
    color = 0, 0, 0
    
    def __init__(self):
        self.path = [(-3, 29), (7, 31), (14, 30), (16, 25), (14, 19), (7, 18), (2, 14), (3, 8),
                     (9, 3), (14, 4)]
        self.path.append((gamestate.homex, gamestate.homey))
        self.path = [(x + 0.5, y + 0.5) for x, y in self.path]
        self.x, self.y = self.path[0]
        self.hp = self.hp0
        self.vx, self.vy = 0, 0
        self.stept = 0
        self.freezetime = 0

    def die(self):
        gamestate.foes.remove(self)

    def hurt(self, dhp):
        self.hp -= dhp
        if self.hp <= 0:
            self.die()

    def arrive(self):  # reach the castle
        self.die()
    
    def think(self, dt):
        self.stept += dt * random.uniform(0.8, 1.2)
        if self.freezetime:
            self.freezetime = max(self.freezetime - dt, 0)
        tx, ty = self.path[0]
        dx, dy = tx - self.x, ty - self.y
        if dx ** 2 + dy ** 2 < 0.5 ** 2:
            self.path.pop(0)
            if not self.path:
                self.arrive()
        else:
            d = math.sqrt(dx ** 2 + dy ** 2)
            a = self.v * 20
            self.vx += dt * dx / d * a
            self.vy += dt * dy / d * a
            
            v = math.sqrt(self.vx ** 2 + self.vy ** 2)
            if v > self.v:
                self.vx /= v
                self.vy /= v

        f = 0.25 if self.freezetime else 1        
        self.x += dt * self.vx * f
        self.y += dt * self.vy * f

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        h = 8 * abs(3 * self.stept % 1 - 0.5)
        if self.freezetime:
            pygame.draw.rect(vista.mapwindow, (0, 0, 255), (px-6, py-12-h, 12, 16))
        pygame.draw.line(vista.mapwindow, self.color, (px, py-h), (px, py-10-h), 5)

