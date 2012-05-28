import pygame, math, random

sx, sy = 600, 600
screen = pygame.display.set_mode((sx, sy))

def screenpos((x, y)):
    return int(sx/2 + x), int(0.85*sy - y)

def worldpos((x, y)):
    return x - sx/2, -(y - 0.85*sy)

class Block(object):
    def __init__(self, parent=None, anchor=None, zeta=1):
        self.parent = parent
        if self.parent:
            self.parent.children.append(self)
        self.children = []
        self.zeta = zeta  # fraction of parent's offset that's transferred to self
        self.x, self.y, self.A = anchor or (0, 0, 0)
        self.w = 50  # width of platform
        # base platform position
        self.px0, self.py0, self.pA0 = random.uniform(-20, 20), random.uniform(40, 60), random.uniform(-0.2, 0.2)
        self.dpx, self.dpy, self.dpA = 0, 0, 0   # current additional offset
        self.px, self.py, self.pA = self.px0, self.py0, self.pA0  # current position
        self.vpx, self.vpy, self.vpA = 0, 0, 0   # current velocity
        self.apx, self.apy, self.apA = 0, 0, 0   # current acceleration

#        self.wx, self.wy, self.wA = 20, 20, 20  # spring angular frequency (omega)
#        self.bx, self.by, self.bA = 4, 4, 4  # spring decay factor (beta)
#        self.bx, self.by, self.bA = 0.4, 0.4, 0.4
        self.wx, self.wy, self.wA = random.uniform(25, 55), random.uniform(25, 55), random.uniform(25, 55)
        self.bx, self.by, self.bA = random.uniform(2, 5), random.uniform(2, 5), random.uniform(2, 5)
#        self.bx, self.by, self.bA = self.bx/2, self.by/2, self.bA/2
        self.wx, self.wy, self.wA = self.wx*2, self.wy*2, self.wA*2
        self.sprout()

    def sprout(self):
        self.dpy = -40
        self.vpy = 500
        self.vpA = -4
        self.dpA = 1
        if self.parent:
            self.parent.takeimpulse(self.worldvec((0, -500), 0), self.worldpos((0, 0), 0))

    def worldpos(self, (x, y), zeta=1):  # world position of given local position
        # zeta is the fraction of the current offset to include in the calculation
        A = self.A + zeta * self.pA
        S, C = math.sin(A), math.cos(A)
        px = self.x + zeta * self.px + C * x + S * y
        py = self.y + zeta * self.py - S * x + C * y
        return self.parent.worldpos((px, py), self.zeta) if self.parent else (px, py)

    def localpos(self, (x, y), zeta=1):  # local position of given world position
        if self.parent:
            x, y = self.parent.localpos((x, y), self.zeta)
        A = self.A + zeta * self.pA
        S, C = math.sin(A), math.cos(A)
        px = x - self.x - zeta * self.px
        py = y - self.y - zeta * self.py
        return C * px - S * py, S * px + C * py

    def worldvec(self, (x, y), zeta=1):
        A = self.totalA(zeta)
        S, C = math.sin(A), math.cos(A)
        return x * C + y * S, -x * S + y * C

    def localvec(self, (x, y), zeta=1):
        A = self.totalA(zeta)
        S, C = math.sin(A), math.cos(A)
        return x * C + -y * S, x * S + y * C

    def totalA(self, zeta = 1):
        return zeta * self.pA + (self.parent.totalA(self.zeta) if self.parent else 0)

    def think(self, dt):
        self.vpx += (self.apx - self.dpx * self.wx) * dt
        self.vpx *= math.exp(-self.bx * dt)
        self.dpx += self.vpx * dt
        self.px = self.px0 + min(max(self.dpx, -30), 30)
        self.vpy += (self.apy - self.dpy * self.wy) * dt
        self.vpy *= math.exp(-self.by * dt)
        self.dpy += self.vpy * dt
        self.py = self.py0 + min(max(self.dpy, -30), 30)
        self.vpA += (self.apA - self.dpA * self.wA) * dt
        self.vpA *= math.exp(-self.bA * dt)
        self.dpA += self.vpA * dt
        self.pA = self.pA0 + min(max(self.dpA, -1), 1)

    # Apply the impulse (ix, iy) at point (x, y)
    def takeimpulse(self, (ix, iy), (x, y), zeta=1, source=None):
        passdown = self.parent and self.parent is not source
        f = 0.5 if passdown else 1  # fraction of the impulse taken by this block
        if passdown:
            self.parent.takeimpulse((ix*(1-f), iy*(1-f)), (x, y), self.zeta, source=self)
        for block in self.children:
            g = 0.4 if self.parent and source is self.parent else -0.4
            p = self.worldpos((0, 0), 0)
            if block is not source:
                block.takeimpulse((ix*g, iy*g), p, 0, source=self)
        ix, iy = self.localvec((ix*f, iy*f), zeta=0)
        x, y = self.localpos((x, y))
        self.vpx += ix
        self.vpy += iy
        self.vpA += (ix * y - iy * x) * 0.0002

    def takeforce(self, (fx, fy), (x, y), zeta=1, source=None):
        passdown = self.parent and self.parent is not source
        f = 0.2 if passdown else 1  # fraction of the force taken by this block
        if passdown:
            self.parent.takeforce((fx*(1-f), fy*(1-f)), (x, y), self.zeta, source=self)
        fx, fy = self.localvec((fx*f, fy*f), zeta=0)
        x, y = self.localpos((x, y))
        self.apx += fx
        self.apy += fy
        self.apA += (fx * y - fy * x) * 0.0002

    def draw(self, highlight=False):
        for rx0, rx1 in ((-0.4, 0), (0, 0.4), (0, -0.4), (0.4, 0)):
            p0 = screenpos(self.worldpos((self.w * rx0, 0), zeta=0))
            p1 = screenpos(self.worldpos((self.w * rx1, 0), zeta=1))
            pygame.draw.line(screen, (255, 255, 255), p0, p1, 1)

        p0 = screenpos(self.worldpos((-self.w/2, 0)))
        p1 = screenpos(self.worldpos((self.w/2, 0)))
        pygame.draw.line(screen, ((255, 255, 128) if highlight else (255, 128, 0)), p0, p1, 2)

    def catches(self, sprite):
        x0, y0 = self.localpos((sprite.oldx, sprite.oldy))
        x1, y1 = self.localpos((sprite.x, sprite.y))
        return y0 > 0 and y1 <= 0 and -self.w/2 <= x1 <= self.w/2

    def holds(self, sprite):
        return -self.w/2 < sprite.x < self.w/2
    
    def constrain(self, sprite):
        sprite.y = 0


class Ground:
    @staticmethod
    def catches(sprite):
        return sprite.oldy > 0 and sprite.y <= 0
    @staticmethod
    def holds(sprite):
        return True
    @staticmethod
    def constrain(sprite):
        sprite.y = 0
    @staticmethod
    def worldpos((x, y)):
        return x, y
    @staticmethod
    def worldvec((x, y)):
        return x, y
    @staticmethod
    def localpos((x, y)):
        return x, y
    @staticmethod
    def localvec((x, y)):
        return x, y
    @staticmethod
    def takeimpulse(i, p, zeta=1, source=None):
        pass
    @staticmethod
    def takeforce(f, p, zeta=1, source=None):
        pass

class Stand:
    @staticmethod
    def enter(self):
        ix, iy = self.vx, self.vy
        self.parent.takeimpulse((ix, iy), (self.x, self.y))
        self.oldx, self.oldy = self.x, self.y = self.parent.localpos((self.x, self.y))
        self.parent.constrain(self)
        self.vy = 0

    @staticmethod
    def draw(self):
        p0 = screenpos(self.parent.worldpos((self.x, self.y)))
        p1 = screenpos(self.parent.worldpos((self.x, self.y + 40)))
        pygame.draw.line(screen, (255, 0, 0), p0, p1, 1)
        p0 = screenpos(self.parent.worldpos((self.x + 10, self.y + 20)))
        p1 = screenpos(self.parent.worldpos((self.x - 10, self.y + 20)))
        pygame.draw.line(screen, (255, 0, 0), p0, p1, 1)
    
    @staticmethod
    def think(self, dt, mkeys, nkeys):
        self.oldx, self.oldy = self.x, self.y
        move = mkeys[pygame.K_RIGHT] - mkeys[pygame.K_LEFT]
        self.vx = 160 * move
        self.x += self.vx * dt
        self.parent.takeforce((0, -200), self.parent.worldpos((self.x, self.y)))
        self.parent.constrain(self)
        if not self.parent.holds(self):
            self.nextstate = Fall
        elif pygame.K_UP in nkeys:
            vx, vy = self.parent.worldvec((0, 200))
            self.parent.takeimpulse((vx, vy), self.parent.worldpos((self.x, self.y)))
            self.nextstate = Fall
            self.vx += vx
            self.vy += vy

    @staticmethod
    def exit(self):
        self.x, self.y = self.parent.worldpos((self.x, self.y))
        self.parent = None
        

class Fall(Stand):
    @staticmethod
    def enter(self):
        pass
    @staticmethod
    def draw(self):
        p0 = screenpos((self.x, self.y))
        p1 = screenpos((self.x, self.y + 40))
        pygame.draw.line(screen, (255, 0, 0), p0, p1, 1)
        p0 = screenpos((self.x + 10, self.y + 20))
        p1 = screenpos((self.x - 10, self.y + 20))
        pygame.draw.line(screen, (255, 0, 0), p0, p1, 1)

    @staticmethod
    def think(self, dt, mkeys, nkeys):
        self.oldx, self.oldy = self.x, self.y
        move = mkeys[pygame.K_RIGHT] - mkeys[pygame.K_LEFT]
        self.vx = 160 * move
        self.vy -= 600 * dt
        self.x += self.vx * dt
        self.y += self.vy * dt
        if pygame.K_UP in nkeys:
            self.vy = 200
        for platform in blocks + [Ground]:
            if platform.catches(self):
                self.parent = platform
                self.nextstate = Stand
    @staticmethod
    def exit(self):
        pass


class You(object):
    def __init__(self):
        self.state = Stand
        self.parent = Ground
        self.x = -200
        self.y = 0
        self.vx = self.vy = 0
        self.nextstate = None

    def think(self, dt, mkeys, nkeys):
        self.state.think(self, dt, mkeys, nkeys)

    def advancestate(self):
        if self.nextstate:
            self.state.exit(self)
            self.state = self.nextstate
            self.nextstate = None
            self.state.enter(self)

    def draw(self):
        self.state.draw(self)

you = You()

blocks = [Block(None)]
clock = pygame.time.Clock()
cursor = 0
while True:
    dt = clock.tick(60) * 0.001
    nkeys = []
    for event in pygame.event.get():
        if event.type == pygame.KEYDOWN:
            nkeys.append(event.key)
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            exit()
        if event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
            for j, block in enumerate(blocks):
                block.vpx = random.uniform(-120, 120)
                block.vpy = random.uniform(-120, 120)
                block.vpA = random.uniform(-6, 6)
        if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
            while True:
                parent = random.choice(blocks)
                if not parent.children:
                    break
            if random.random() < 0.5:
                block = Block(parent)
                blocks.append(block)
            else:
                block1, block2 = Block(parent), Block(parent)
                block1.px0, block2.px0 = -30, 30
                block1.pA0, block2.pA0 = -0.4, 0.4
                for block in (block1, block2):
                    blocks.append(block)
            cursor = len(blocks) - 1
        if event.type == pygame.KEYDOWN and event.key == pygame.K_1:
            block = Block(parent=blocks[cursor])
            blocks.append(block)
            cursor = len(blocks) - 1
        if event.type == pygame.KEYDOWN and event.key == pygame.K_2:
            block1, block2 = Block(blocks[cursor]), Block(blocks[cursor])
            block1.px0, block2.px0 = -30, 30
            block1.pA0, block2.pA0 = -0.4, 0.4
            for block in (block1, block2):
                blocks.append(block)
            cursor = len(blocks) - 1
        if event.type == pygame.KEYDOWN and event.key == pygame.K_TAB:
            cursor = (cursor + 1) % len(blocks)
#        if event.type == pygame.KEYDOWN and event.key == pygame.K_DOWN:
#            blocks[cursor].takeimpulse((0, -500), blocks[cursor].worldpos((0, 0), zeta=1))
#        if event.type == pygame.KEYUP and event.key == pygame.K_DOWN:
#            blocks[cursor].takeimpulse((0, -500), blocks[cursor].worldpos((0, 0), zeta=1))
        if event.type == pygame.QUIT:
            exit()
    for block in blocks:
        block.apx = block.apy = block.apA = 0
    keys = pygame.key.get_pressed()
#    if keys[pygame.K_DOWN]:
#        blocks[cursor].takeforce((0, -500), blocks[cursor].worldpos((0, 0), zeta=1))
#    if keys[pygame.K_RIGHT]:
#        blocks[cursor].takeforce(blocks[cursor].worldvec((-500, 0)), blocks[cursor].worldpos((0, 0)))
#    if keys[pygame.K_LEFT]:
#        blocks[cursor].takeforce(blocks[cursor].worldvec((500, 0)), blocks[cursor].worldpos((0, 0)))

    you.think(dt, keys, nkeys)
    for block in blocks: block.think(dt)

    screen.fill((0, 0, 24))
    gx0, gy0 = screenpos((-1000, 0))
    screen.fill((0, 64, 0), (gx0, gy0, 2000, 2000))
    for j, block in enumerate(blocks): block.draw(j == cursor)
    you.draw()

    you.advancestate()
    pygame.display.flip()
    
    block = blocks[-1]
    x0, y0 = block.worldpos((100, 70))
    x1, y1 = block.worldpos((101, 71))
    dx, dy = block.worldvec((1, 1))
#    print (x1 - x0) - dx, (y1 - y0) - dy

