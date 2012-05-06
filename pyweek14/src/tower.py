import pygame
import vista


class Tower(object):
    color = 50, 125, 200
    def __init__(self, (x, y)):
        self.x, self.y = x, y

    def think(self, dt):
        pass

    def draw(self):
        px, py = vista.mappos((self.x + 0.5, self.y + 0.5))
        pygame.draw.line(vista.mapwindow, self.color, (px, py), (px, py-25), 5)

    

