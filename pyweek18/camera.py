from __future__ import division
from pygame import *
from math import *
import settings, img, state

pscale = 30

def drawbackdrop():
	screen = display.get_surface()
	screen.fill((80, 80, 120))
	screen.fill((40, 40, 60), (0, settings.Yh, settings.sX, settings.sY))

def drawlayer(layer):
	imgname, x, y, z, theta, obj = layer
	yd = y - state.yc  # distance from camera to object
	if not settings.yrange[0] < yd < settings.yrange[1]:
		return
	k = settings.k0 * settings.dyc / yd  # scale in screen pixels of 1 game unit at distance of object
	srz = transform.rotozoom(img.getimg(imgname), degrees(theta), k / settings.ik)

	X = settings.sX / 2 + k * x
	Y = settings.Yh + k * (settings.zc - z)

	iw, ih = srz.get_size()
	try:
		display.get_surface().blit(srz, (int(X - iw / 2), int(Y - ih / 2)))
	except:
		print pos, x0, y0, x, y, iw, ih
		raise

def drawwave(py):
	return
	y = settings.yv + settings.yr - 50 * (py - state.y0)
	display.get_surface().fill((128,128,255,50), (0, y, settings.sx, settings.sy))
	
