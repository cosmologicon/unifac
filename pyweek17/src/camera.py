from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import settings
from vec import vec

u = vec(0, 0, 1)
f = vec(1, 0, 0)
p = vec(1, 0, 1).norm()
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
	return p.plus(f.times(1))

def look():
	glMatrixMode(GL_PROJECTION)
	glLoadIdentity()
	gluPerspective(settings.fov, float(settings.sx) / settings.sy, 0.01, 10000)

	gluLookAt(*(eye() + p + u))

	b = f.cross(u)
	a = p.cross(b)
	
	lightpos = p.plus(a).plus(b.times(6))

	glLight(GL_LIGHT0, GL_POSITION, lightpos)


def screentoworld((px, py)):
	# distance from the eye to the plane of vision that goes through the origin
	d = eye().rej(u).length()
	#f = / (semath.sin(settings.fov))
	r = eye().length()
	x = (float(px) / settings.sx - 0.5) * r
	y = (float(py) / settings.sy - 0.5) * r
	return x, y


