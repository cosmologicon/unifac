import random, math

domain = "ws://universefactory.net"
port = 8416
clientpath = "%s:%s" % (domain, port)

size = sx, sy = 600, 400
gfps = 10   # logical framerate of the game

sectorsize = 2000
def getsector((x, y)):
	return int(x/sectorsize), int(y/sectorsize)

def randomname():
	cons, vowels = "bcdfghklmnprstvxz", "aeiou"
	pattern = random.choice("vcvcvc cvcvcvc cvcvc".split())
	return "".join(random.choice(cons if c == "c" else vowels) for c in pattern)

nworlds = 300  # number of non-hatchery worlds
size0 = 200   # size of the main hatchery
size1 = 160   # size of auxiliary hatcheries
def randomsize():   # size of other worlds
	return random.choice([70, 80, 90, 100, 110, 120])

def randompos():
	r, theta = random.uniform(0, 10000), random.uniform(0, 1000)
	return [r * math.sin(theta), r * math.cos(theta)]

wcolors = (200,200,200), (200,0,0), (0,255,0), (50,50,255), (200,100,0), (200,200,0)
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




