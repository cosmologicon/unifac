from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from vec import vec

u = vec(0, 0, 1)
f = vec(1, 0, 0)
p = vec(1, 0, 1).norm()

def move(dx, dy, dr, dA):
	global u, f, p
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


def look():
	eye = p.plus(f.times(1))
	gluLookAt(*(eye + p + u))

	b = f.cross(u)
	a = p.cross(b)
	
	lightpos = p.plus(a).plus(b.times(6))

	glLight(GL_LIGHT0, GL_POSITION, lightpos)


