import pygame, math
import vista, foe, gamestate, mechanics, data, effect


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
        self.imgname = self.invention
        if self.invention == "stone": self.imgname = "tower"
        self.h = { "stone": 40, "monkey": 30, "shark": 0, "corpse": 50 }[self.invention]
        
        self.vh = 30  # for sharks

    def attack(self, who):
        if self.element == "laser":
            who.hurt(self.damage)
            data.playsfx("laser")
        elif self.element == "freeze":
            who.freezetime += 3
            data.playsfx("freeze")
        elif self.element == "fire":
            data.playsfx("flame")
        self.chargetimer = 0
        beam = effect.Beam((self.x, self.y, self.h), (who.x, who.y, 20), self.cfilter)
        gamestate.effects.append(beam)

    def gettarget(self):
        if not gamestate.foes: return None
        f = min(gamestate.foes, key = lambda f: (f.x - self.x) ** 2 + (f.y - self.y) ** 2)
        if (f.x - self.x) ** 2 + (f.y - self.y) ** 2 < self.range ** 2:
            return f
        return None

    def think(self, dt):
        self.chargetimer += dt
        self.t += dt
        if self.invention == "shark" and self.h > 0:
            self.h += self.vh * dt
            self.vh -= 160 * dt

        if self.chargetimer >= self.chargetime:
            if self.invention == "shark":
                if self.h <= 0:
                    self.h = 0.1
                    self.vh = 120
                elif self.vh < 0:
                    self.chargetimer = 0
                    target = self.gettarget()
                    if target: self.attack(target)
            else:
                self.chargetimer = self.chargetime
                target = self.gettarget()
                if target: self.attack(target)
        
        
    def drawglow(self, (px, py)):
        if self.chargetimer < 0.5:
            pass
        elif self.chargetimer < self.chargetime:
            for j in range(30):
                theta = j * math.pi / 15
                r = (73 * theta ** 2 - 22 * self.t) % (12 * self.chargetimer / self.chargetime + theta/2)
                pos = px + int(r * math.sin(theta)), py + int(r * math.cos(theta))
                vista.mapwindow.set_at(pos, self.cfilter)
        else:
            theta, r = self.t * 4, 8 + 6 * math.sin(2.2 * self.t)
            s, c = int(r * math.sin(theta)), int(r * math.cos(theta))
            pygame.draw.line(vista.mapwindow, self.cfilter, (px+s,py+c), (px-s,py-c))
            pygame.draw.line(vista.mapwindow, self.cfilter, (px+s,py-c), (px-s,py+c))

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        if self.invention == "stone":
            self.drawglow((px, py-39))
            img = data.img(self.imgname, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)
        elif self.invention == "monkey":
            data.draw(vista.mapwindow, data.img("shadow"), (px, py), "center")
            h = 3 * math.sin(self.t * 7)
            alpha = (3+h)*15
            py -= 30 + h
            img = data.img("wing", alpha=alpha, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py-3), self.anchor)
            img = data.img("wing", flip=True, alpha=alpha, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py-3), self.anchor)
            img = data.img(self.imgname, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)
        elif self.invention == "shark":
            if self.h > 0:
                img = data.img("shark", alpha=2*self.vh, cfilter=self.cfilter)
                data.draw(vista.mapwindow, img, (px, int(py - self.h)), self.anchor)
        elif self.invention == "corpse":
            n = 0 if self.chargetimer > self.chargetime - 0.4 else int(self.chargetimer * 4) % 2 + 1
            img = data.img("arm-%s" % n, cfilter=self.cfilter)
            data.draw(vista.mapwindow, img, (px, py), self.anchor)


class Castle(object):
    def __init__(self, (x, y)):
        self.x, self.y = x + 0.5, y + 0.5
        self.img = pygame.transform.smoothscale(data.img("castle"), (120, 248))

    def draw(self):
        px, py = vista.mappos((self.x, self.y))
        data.draw(vista.mapwindow, self.img, (px, py), "center")


