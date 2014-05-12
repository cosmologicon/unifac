from __future__ import division
from pygame import *
from math import *
import settings, img, state

pscale = 30

def drawbackdrop():
	display.get_surface().blit(img.getimg("backdrop"), (0, 0))

def drawlayer(layer):
	try:
		imgname, x, y, z, theta, ascale, obj = layer
	except:
		print layer
		raise
	if imgname == "shroud":
		return drawshroud()
	if ascale is None:
		ascale = 1
	yd = y - state.yc  # distance from camera to object
	if not settings.yrange[0] < yd < settings.yrange[1]:
		return
	k = settings.k0 * settings.dynormal / yd  # scale in screen pixels of 1 game unit at distance of object
	srz = transform.rotozoom(img.getimg(imgname), degrees(theta), k * ascale / settings.ik)

	Y0 = int(settings.Yh + k * settings.zc)  # Y-coordinate at z = 0
	iw, ih = srz.get_size()
	Xc = settings.sX / 2 + k * x
	Yc = settings.Yh + k * (settings.zc - z)
	X = int(Xc - iw / 2)
	Y = int(Yc - ih / 2)

	if Y >= Y0:
		return
	elif Y + ih >= Y0:
		area = 0, 0, iw, Y0 - Y  # don't draw the area below the water
	else:
		area = None
	display.get_surface().blit(srz, (X, Y), area)

def drawshroud():
	display.get_surface().blit(img.getimg("shroud"), (0, 0))

def drawwave(py):
	return
	y = settings.yv + settings.yr - 50 * (py - state.y0)
	display.get_surface().fill((128,128,255,50), (0, y, settings.sx, settings.sy))
	
