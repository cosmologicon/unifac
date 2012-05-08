import pygame
import vista, gamestate


class Beam(object):
    lifetime = 0.25
    def __init__(self, (x0, y0, z0), (x1, y1, z1), color):
        self.x = (x0 + x1) / 2
        self.y = (y0 + y1) / 2
        self.x0, self.y0, self.z0 = x0, y0, z0
        self.x1, self.y1, self.z1 = x1, y1, z1
        self.color = color
        self.t = 0
    
    def think(self, dt):
        self.t += dt
        if self.t > self.lifetime:
            gamestate.effects.remove(self)
        
    def draw(self):
        px0, py0 = vista.mappos((self.x0, self.y0))
        py0 -= self.z0
        px1, py1 = vista.mappos((self.x1, self.y1))
        py1 -= self.z1
        pygame.draw.line(vista.mapwindow, self.color, (px0, py0), (px1, py1))


