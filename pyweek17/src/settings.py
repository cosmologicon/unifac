import sys, math


ssize = sx, sy = 854, 480

fullscreen = "--fullscreen" in sys.argv
if fullscreen:
	ssize = None
fps = 60

fov = 30
tanB = math.tan(math.radians(0.5 * fov))
cotB = 1 / tanB

gamename = "Luna whatever"


