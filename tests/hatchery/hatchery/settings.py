import data, json, os, sys
import random, math

domain = "ws://universefactory.net"
port = 8416
clientpath = "%s:%s" % (domain, port)

savename = None
logindatapath = data.filepath("login-%s.json" % savename if savename else "login.json")
def getlogindata():
	if not os.path.exists(logindatapath):
		return None
	return json.loads(open(logindatapath, "rb"))
def savelogindata(username, password):
	with open(logindatapath, "wb") as f:
		f.write(json.dumps([username, password]))
	

size = sx, sy = 1200, 800
gfps = 10   # logical framerate of the game

runv = 300
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

nworlds = 500  # number of non-hatchery worlds
size0 = 240   # size of the main hatchery
size1 = 160   # size of auxiliary hatcheries
def randomsize():   # size of other worlds
	return random.choice([70, 80, 90, 100, 110, 120])

def randompos():
	r, theta = random.uniform(0, 6000), random.uniform(0, 1000)
	return [r * math.sin(theta), r * math.cos(theta)]
def hatcherypos():   # locations of auxiliary hatcheries
	for jtheta in range(5):
		theta = jtheta * 6.28 / 5
		yield (3000 * math.sin(theta), 3000 * math.cos(theta))
		yield (-5000 * math.sin(theta), -5000 * math.cos(theta))

wcolors = {
	None: (60, 60, 60),
	0: (200,200,200),
	1: (200,0,0),
	2: (0,255,0),
	3: (50,50,255),
	4: (200,100,0),
	5: (200,200,0),
}
ncolors = 5   # number of non-hatchery world colors
def randomcolorcode():
	return random.choice(list(range(1,ncolors+1)))

def collide(world1, world2):
	(x1, y1), (x2, y2) = world1.p, world2.p
	dx, dy = x1 - x2, y1 - y2
	dr = world1.r + world2.r + 100
	return dx ** 2 + dy ** 2 < dr ** 2

# Returns two sets of moves, one to be sent to the network, and one local
def parsemoves():
	import pygame
	from pygame.locals import *
	nmoves, lmoves = {}, {}
	for event in pygame.event.get():
		if event.type == KEYDOWN:
			if event.key in (K_UP, K_SPACE):
				nmoves["jump"] = 1
			if event.key in (K_DOWN,):
				nmoves["grab"] = 1
			if event.key in (K_ESCAPE,):
				nmoves["quit"] = 1
			if event.key in (K_m,):
				lmoves["map"] = 1
		if event.type == QUIT:
			nmoves["quit"] = 1
	k = pygame.key.get_pressed()
	dx = (k[K_RIGHT] or k[K_d] or k[K_e]) - (k[K_LEFT] or k[K_a])
	dy = (k[K_UP] or k[K_w] or k[K_COMMA]) - (k[K_DOWN] or k[K_s] or k[K_o])
	if dx:
		nmoves["dx"] = dx
	if dy:
		nmoves["dy"] = dy
	return nmoves, lmoves




