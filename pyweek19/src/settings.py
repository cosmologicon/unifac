# THESE ARE NOT USER-EDITABLE SETTINGS. DON'T MESS WITH THESE.
import pygame

DEBUG = True
gamename = "One room"
minfps, maxfps = 10, 60

ssize = sx, sy = 800, 500
# main gameplay area
grect = pygame.Rect((10, 10, sy - 20, sy - 20))

# status indicators
statpos = 600, 300
statfontsize = 20
alertfontsize = 40

imgscale = 30  # image pixels per game unit for assets

shipsize = shipw, shiph = 4, 5

# Distance from the player before a fadeable object fades.
fadedistance = 16
vsize = 8

burndamagetime = 0.3
oortdamagetime = 0.3

modulecosts = {
	"engine": 0,
	"drill": 0,
	"laser": 5,
	"gun": 20,
	"heatshield": 50,
	"deflector": 100,
}

moduleblocks = {
	"engine": [(0,0), (1,0), (0,1), (1,1)],
}

moduleinputs = {
	"engine": [(-1,0,0,0)],
}


