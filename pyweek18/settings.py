gamename = "Pesos de Ocho"
DEBUG = True


size = sX, sY = 600, 600
fps = 30

zc = 5  # height of camera in game units
dyc = 5  # distance (in game units) that the camera lags the player
yrange = 2, 50  # range of distances (wrt camera) that we draw
k0 = 40  # size in screen pixels of 1 game unit at the distance of the main window
ik = 40  # size in image pixels of 1 game unit
Yh = int(0.4 * sY)  # y-coordinate of the horizon

ax = 6
vxmax = 3
xslow = 20

