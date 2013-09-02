import math
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import settings, state
from vec import vec

u = vec(0, 0, 1)
f = vec(1, 0, 0)
p = vec(1, 0, 1).norm()
zoom = 50

target = None

def move(dx, dy, dr, dA):
	global u, f, p, target
	if not (dx or dy or dr or dA):
		return

	target = None
	b = f.cross(u)
	if dx:
		a = b.cross(p).times(-dx)
		u = u.plus(u.cross(a))
		f = f.plus(f.cross(a))
		p = p.plus(p.cross(a))
	if dy:
		a = b.times(-dy)
		u = u.plus(u.cross(a))
		f = f.plus(f.cross(a))
		p = p.plus(p.cross(a))
	if dr:
		a = p.times(-dr)
		u = u.plus(u.cross(a))
		f = f.plus(f.cross(a))
	if dA:
		a = b.times(-dA)
		u = u.plus(u.cross(a))
		f = f.plus(f.cross(a))
	f = f.norm()
	u = u.rej(f).norm()
	p = p.rej(f.cross(u)).norm()

def think(dt):
	global u, f, p, target
	if not target:
		return
	scale = 10
	d = target.minus(p)
	dlen = d.length()
	b = target.cross(p)
	blen = b.length()
	if dlen < 0.00001 or blen < 0.00001:
		target = None
		return

	if dlen < 1:
		scale = 0.1 + 9.9 * dlen / 1.0
	if scale * dt <= dlen:
		a = b.norm().times(scale * dt)
	else:
		a = b.norm().times(dlen)
		target = None

	u = u.plus(u.cross(a))
	f = f.plus(f.cross(a))
	p = p.plus(p.cross(a))

	f = f.norm()
	u = u.rej(f).norm()
	p = p.rej(f.cross(u)).norm()
	
	
	

def seek(p):
	global target
	target = vec(*p)

def eye():
	return p.times(state.R).plus(f.times(zoom))

def look():
	glMatrixMode(GL_PROJECTION)
	glLoadIdentity()
	gluPerspective(settings.fov, float(settings.sx) / settings.sy, 0.01, 10000)

	gluLookAt(*(eye() + p.times(state.R) + u))

	glMatrixMode(GL_MODELVIEW)
	glLoadIdentity()

	b = f.cross(u)
	a = p.cross(b)
	
	lightpos = p.plus(a).plus(b.times(6))

	glLight(GL_LIGHT0, GL_POSITION, lightpos)
	glLight(GL_LIGHT1, GL_POSITION, lightpos)


def worldtoscreen(r):
	l = f.cross(u)
	ef = eye().dot(f)
	rl, ru, rf, Rpu = r.dot(l), r.dot(u), r.dot(f), state.R * p.dot(u)
	X = -rl / (ef - rf)
	Y = (ru - Rpu) / (ef - rf)
#	print X, Y, r.length() / state.R
	return (
		round(0.5 * X * settings.cotB * settings.sy + 0.5 * settings.sx),
		round(0.5 * Y * settings.cotB * settings.sy + 0.5 * settings.sy),
	)
	
def screentoworld((px, py)):
	X = (px - 0.5 * settings.sx) / (0.5 * settings.sy * settings.cotB)
	Y = (py - 0.5 * settings.sy) / (0.5 * settings.sy * settings.cotB)
	XY2 = X*X + Y*Y
	E = eye().dot(f) / state.R
	pu = p.dot(u)
	
	a = XY2 + 1
	b = -2 * (XY2 * E + pu * Y)
	c = XY2 * E * E + pu * pu + 2 * pu * Y * E - 1

	D = b*b - 4*a*c
	if D < 0:
		return None
	
	w = (-b + math.sqrt(D)) / (2 * a)
	ql = X * (E - w)
	qu = pu + Y * (E - w)
	l = f.cross(u)
#	print X, Y, w, a*w*w + b*w + c, w*w + ql*ql + qu*qu
	return f.times(w).plus(l.times(ql)).plus(u.times(qu)).times(state.R)

