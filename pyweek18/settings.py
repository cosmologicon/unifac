gamename = "Pesos de Ocho"
DEBUG = True


size = sX, sY = 600, 600
fps = 30

zc = 5  # height of camera in game units
dyc = 4  # distance (in game units) that the camera lags the player
yrange = 0.1, 50  # range of distances (wrt camera) that we draw
k0 = 60  # size in screen pixels of 1 game unit at the distance of the main window
ik = 40  # size in image pixels of 1 game unit
Yh = int(0.4 * sY)  # y-coordinate of the horizon

lwidth = 4  # half-width of the lane
ax = 6
vxmax = 3
xslow = 20

