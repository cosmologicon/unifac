import sys

gamename = "Pesos de Ocho"
DEBUG = "--DEBUG" in sys.argv


size = sX, sY = 540, 720
fps = 60

zc = 5  # height of camera in game units
yrange = 1, 50  # range of distances (wrt camera) that we draw
k0 = 60  # size in screen pixels of 1 game unit at the distance of the main window
ik = 40  # size in image pixels of 1 game unit
Yh = int(0.4 * sY)  # y-coordinate of the horizon
vyc = 8  # speed of camera

dyfall = -1
dynormal = 4
dyjump = 5

mrate = 0.1  # pesos per second


lwidth = 4  # half-width of the lane
ax = 6
vxmax = 3
xslow = 20

