from pygame import *
from math import *
import settings

pscale = 30

def drawbackdrop():
	screen = display.get_surface()
	screen.fill((200, 200, 255))
	screen.fill((100, 100, 255), (0, settings.yv, settings.sx, settings.sy))

def drawslice(img, pos, theta=0):
	px, py, pz = pos
	if py + settings.y0 < settings.ymin:
		return
	scale = settings.y0 / (py + settings.y0)
	srz = transform.rotozoom(img, degrees(theta), scale)

	# screen position at (x, z) = (0, 0)
	x0 = settings.sx / 2
	y0 = settings.yv + settings.yr * settings.yf / (settings.yf + py)
	
	x = x0 + settings.scale0 * scale * px
	y = y0 - settings.scale0 * scale * pz
	
	iw, ih = srz.get_size()
	display.get_surface().blit(srz, (x - iw//2, y - ih//2))

