import pygame, math, numpy
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from OpenGL.arrays import vbo
from collections import namedtuple
import scene, settings, random




drawable = namedtuple("drawable", "dtype n voff coff noff".split())
vbodata = []
def makedrawable(dtype, vdata, cdata, ndata):
	n = len(vdata) / 3
	voff = len(vbodata) * 4
	vbodata.extend(vdata)
	if cdata:
		coff = len(vbodata) * 4
		vbodata.extend(cdata)
	else:
		coff = None
	if ndata:
		noff = len(vbodata) * 4
		vbodata.extend(ndata)
	else:
		noff = None
	return drawable(dtype, n, voff, coff, noff)

def initstars():
	global stars
	nstar = 10000
	vertexdata = []
	colordata = []
	for star in range(nstar):
		x, y, z = random.uniform(-5000, 5000), random.uniform(-5000, 5000), random.uniform(-5000, 5000)
		if random.random() < 0.7:
			z *= 0.2
		if random.random() < 0.7:
			z *= 0.2
		if random.random() < 0.7:
			z *= 0.2
		vertexdata += [x, y, z]
		c = random.uniform(0.5, 1)
		colordata += [c, c, c]
	stars = makedrawable(GL_POINTS, vertexdata, colordata, None)


def initmoon():
	global moon
	# start with an octahedron
	ps = [(1,0,0), (0,1,0), (0,0,1), (-1,0,0), (0,-1,0), (0,0,-1)]
	faces = [(0,1,2), (1,3,2), (3,4,2), (4,0,2), (1,0,5), (3,1,5), (4,3,5), (0,4,5)]
	avgcache = {}
	def avg(j, k):
		key = j, k
		if key not in avgcache:
			(x0,y0,z0), (x1,y1,z1) = ps[j], ps[k]
			x = (x0 + x1) * 0.5
			y = (y0 + y1) * 0.5
			z = (z0 + z1) * 0.5
			d = math.sqrt(x ** 2 + y ** 2 + z ** 2)
			avgcache[key] = len(ps)
			ps.append((x/d, y/d, z/d))
		return avgcache[key]

	# subdivide this many times
	for i in range(4):
		newfaces = []
		for j1, j2, j3 in faces:
			j4 = avg(j2, j3)
			j5 = avg(j3, j1)
			j6 = avg(j1, j2)
	
			newfaces.extend([
				(j1, j6, j5),
				(j6, j2, j4),
				(j5, j6, j4),
				(j5, j4, j3),
			])
		faces = newfaces

	hills = [(
		random.uniform(-2, 2),
		random.uniform(-2, 2),
		random.uniform(-2, 2),
		random.uniform(0.3, 0.6),
		random.uniform(-0.1, 0.1),
	) for _ in range(10000)]
	colors = []
	for x, y, z in ps:
		color = 0.4
		for hx, hy, hz, hr, hc in hills:
			d2 = (x-hx)**2 + (y-hy)**2 + (z-hz)**2
			color += hc * hr * math.exp(-d2 / (hr * hr))
		color = min(max(color, 0), 1)
		colors.append((color, color, color))
	vertexdata, colordata = [], []
	for face in faces:
		for j in face:
			vertexdata += ps[j]
			colordata += colors[j]
	moon = makedrawable(GL_TRIANGLES, vertexdata, colordata, None)



def init():
	global vertexbuff
	initstars()	
	initmoon()
	vertexbuff = vbo.VBO(numpy.array(vbodata, dtype="f"), usage=GL_STATIC_DRAW)
	

def quit():
#	glDeleteBuffers(1, vertexbuff)
#	glDeleteBuffers(1, indexbuff)
	pass


def draw(obj):
	vertexbuff.bind()

	glEnableClientState(GL_VERTEX_ARRAY)
	glVertexPointer(3, GL_FLOAT, 0, vertexbuff + obj.voff)
	if obj.coff is not None:
		glEnableClientState(GL_COLOR_ARRAY)
		glColorPointer(3, GL_FLOAT, 0, vertexbuff + obj.coff)
	glDrawArrays(obj.dtype, 0, obj.n)
#	glDisableClientState(GL_COLOR_ARRAY)
#	glDisableClientState(GL_VERTEX_ARRAY)
#	vertexbuff.unbind()


