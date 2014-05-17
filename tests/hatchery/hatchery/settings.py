import data, json, os, sys
import random, math

domain = "ws://universefactory.net"
port = 8416
clientpath = "%s:%s" % (domain, port)

savename = None
logindatapath = data.filepath("login-%s.json" % savename if savename else "login.json")
def getlogindata():
	if not os.path.exists(logindatapath):
		return None, None
	return json.loads(open(logindatapath, "rb").read())
def savelogindata(username, password):
	with open(logindatapath, "wb") as f:
		f.write(json.dumps([username, password]))
	

size = sx, sy = None, None
for arg in sys.argv:
	if arg.startswith("-r"):
		size = sx, sy = map(int, arg[2:].split("x"))
gfps = 10   # logical framerate of the game

accel = 200
runv = 200
launchv = 600
g = 300

sectorsize = 2000
def getsector((x, y)):
	return int(x/sectorsize), int(y/sectorsize)
def sectorsnear((x, y)):
	return [(x + dx, y + dy) for dx in (-1,0,1) for dy in (-1,0,1)]

usednames = set()
def randomname():
	cons, vowels = "bcdfghklmnprstvxz", "aeiou"
	while True:
		pattern = random.choice("vcvcvc cvcvcvc cvcvc".split())
		name = "".join(random.choice(cons if c == "c" else vowels) for c in pattern)
		if name not in usednames:
			break
	usednames.add(name)
	return name

nworlds = 300  # number of non-hatchery worlds
size0 = 160   # size of the main hatchery
size1 = 110   # size of auxiliary hatcheries
def randomsize():   # size of other worlds
	return random.choice([40, 50, 60, 70, 80])

def randompos():
	r, theta = random.uniform(0, 3000) * random.uniform(0,1) ** 4, random.uniform(0, 10000)
	return [r * math.sin(theta), r * math.cos(theta)]
def hatcherypos():   # locations of auxiliary hatcheries
	for jtheta in range(5):
		theta = jtheta * 6.28 / 5
		yield (900 * math.sin(theta), 900 * math.cos(theta))
		yield (-1400 * math.sin(theta), -1400 * math.cos(theta))

wcolors = {
	None: (60, 60, 60),
	0: (200,200,200),
	1: (200,0,0),
	2: (0,255,0),
	3: (50,50,255),
	4: (200,150,0),
}
ncolors = 4   # number of non-hatchery world colors
def randomcolorcode():
	return random.choice(list(range(1,ncolors+1)))
def randomegg(world):
	d = math.sqrt(world.x ** 2 + world.y ** 2)
	n = 3 if d < 800 else 4 if d < 1000 else 5
	r = []
	while len(r) < n:
		cs = list(range(1, ncolors+1))
		if r:
			cs.remove(r[-1])
		r.append(random.choice(cs))
	return tuple(r)

def collide(world1, world2):
	return (world1.x - world2.x) ** 2 + (world1.y - world2.y) ** 2 < (world1.r + world2.r + 50) ** 2


def validatemoves(moves):
	for k, v in moves.items():
		if k in ("jump", "grab", "quit"):
			assert v == 1
		elif k in ("dx", "dy"):
			assert v in (-1, 1)
		else:
			raise ValueError

mapmode = False

# Returns two sets of moves, one to be sent to the network, and one local
def parsemoves():
	import pygame
	from pygame.locals import *
	nmoves, lmoves = {}, {}
	for event in pygame.event.get():
		if event.type == KEYDOWN:
			if event.key in (K_UP, K_SPACE) and not mapmode:
				nmoves["jump"] = 1
			if event.key in (K_DOWN,) and not mapmode:
				nmoves["grab"] = 1
			if event.key in (K_ESCAPE,):
				lmoves["quit"] = 1
			if event.key in (K_m,):
				lmoves["map"] = 1
			if event.key in (K_r,):
				lmoves["resync"] = 1
		if event.type == QUIT:
			lmoves["quit"] = 1
	k = pygame.key.get_pressed()
	dx = (k[K_RIGHT] or k[K_d] or k[K_e]) - (k[K_LEFT] or k[K_a])
	dy = (k[K_UP] or k[K_w] or k[K_COMMA]) - (k[K_DOWN] or k[K_s] or k[K_o])
	if mapmode:
		if dx:
			lmoves["dx"] = dx
		if dy:
			lmoves["dy"] = dy
	else:
		if dx:
			nmoves["dx"] = dx
		if dy:
			nmoves["dy"] = dy
	return nmoves, lmoves




