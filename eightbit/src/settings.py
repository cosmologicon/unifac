import sys

gamename = "The Eight Bit Passage"
savename = "save.pkl"
DEBUG = "--DEBUG" in sys.argv
lowres = "--lowres" in sys.argv
fullscreen = "--fullscreen" in sys.argv
reset = "--reset" in sys.argv
easy = "--easy" in sys.argv
nosfx = "--nosfx" in sys.argv or "--noaudio" in sys.argv
nomusic = "--nomusic" in sys.argv or "--noaudio" in sys.argv

size = sX, sY = 540, 720
fps = 60

zc = 5  # height of camera in game units
yrange = 1, 50  # range of distances (wrt camera) that we draw
k0 = 60  # size in screen pixels of 1 game unit at the distance of the main window
ik = 40  # size in image pixels of 1 game unit
Yh = int(0.4 * sY)  # y-coordinate of the horizon

dyfall = -1
dynormal = 4
dyjump = 5

lwidth = 4  # half-width of the lane
ax = 6
vxmax = 3
xslow = 20

