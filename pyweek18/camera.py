from pygame import *
from math import *
import settings, img, state

pscale = 30

def drawbackdrop():
	screen = display.get_surface()
	screen.fill((200, 200, 255))
	screen.fill((100, 100, 255), (0, settings.yv, settings.sx, settings.sy))

def drawlayer(layer):
	imgname, px, py, pz, theta, obj = layer
	if py + settings.y0 < settings.ymin:
		return
	#scale = settings.y0 / (py + settings.y0)
	scale = 1
	srz = transform.rotozoom(img.getimg(imgname), degrees(theta), scale)

	# screen position at (x, z) = (0, 0)
	#x0 = settings.sx / 2
	#y0 = settings.yv + settings.yr * settings.yf / (settings.yf + py)
	
	#x = x0 + settings.scale0 * scale * px
	#y = y0 - settings.scale0 * scale * pz

	x = settings.sx / 2 + 20 * px
	y = settings.yv + settings.yr - 5 * (py - state.y0) - 20 * pz
	
	iw, ih = srz.get_size()
	try:
		display.get_surface().blit(srz, (x - iw//2, y - ih//2))
	except:
		print pos, x0, y0, x, y, iw, ih
		raise

