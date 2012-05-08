import pygame, math
import vista, foe, gamestate, mechanics, data


class Tower(object):
    color = 50, 125, 200
    anchor = "center"
    def __init__(self, tech, (x, y)):
        self.element, self.invention = tech.split()
        dx, dy = mechanics.footoffs[self.invention]
        self.x, self.y = x + dx, y + dy
        self.chargetime = 3
        self.chargetimer = 0
        self.damage = 10
        self.range = 3
        self.t = 0
        self.cfilter = mechanics.ecolors[self.element]
        self.imgname = "tower"

    def attack(self, who):
        if self.element == "laser":
            who.hurt(self.damage)
        elif self.element == "freeze":
            who.freezetime += 3
        self.chargetimer = 0

    def gettarget(self):
        if not gamestate.foes: return None
        f = min(gamestate.foes, key = lambda f: (f.x - self.x) ** 2 + (f.y - self.y) ** 2)
        if (f.x - self.x) ** 2 + (f.y - self.y) ** 2 < self.range ** 2:
            return f
        return None

    def think(self, dt):
        self.chargetimer += dt
        self.t += dt
        if self.chargetimer >= self.chargetime:
            self.chargetimer = self.chargetime
            target = self.gettarget()
            if target: self.attack(target)

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        img = data.img(self.imgname, cfilter=self.cfilter)
        data.draw(vista.mapwindow, img, (px, py), self.anchor)
        


#        h = 25 * self.chargetimer / self.chargetime
#        for dtheta in (0, 2*math.pi/3, 4*math.pi/3):
#            theta = 10 * self.t + dtheta
#            dx, dy = 7 * math.sin(theta), 4 * math.cos(theta)
#            vista.mapwindow.set_at((int(px+dx), int(py+dy-h)), (255, 255, 255))
#        pygame.draw.line(vista.mapwindow, self.color, (px, py), (px, py-25), 5)

    

