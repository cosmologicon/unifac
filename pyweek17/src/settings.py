import sys, math


ssize = sx, sy = 854, 480

fullscreen = "--fullscreen" in sys.argv
if fullscreen:
	ssize = None
fps = 60

fov = 30
cotB = 1 / math.tan(math.radians(0.5 * fov))

gamename = "Luna whatever"


