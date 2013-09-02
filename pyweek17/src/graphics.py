import pygame, math, numpy, random
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from OpenGL.arrays import vbo
from collections import namedtuple
import scene, settings, state
from vec import vec




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
	for i in range(3):
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
	) for _ in range(100)]
	colors = []
	for x, y, z in ps:
		color = 0.4
		for hx, hy, hz, hr, hc in hills:
			d2 = (x-hx)**2 + (y-hy)**2 + (z-hz)**2
			color += hc * hr * math.exp(-d2 / (hr * hr))
		color = min(max(color, 0), 1)
		color = random.uniform(0.2, 0.5)
		color = 0.4
		colors.append((color, color, color))
	vertexdata, colordata, normaldata = [], [], []
	for face in faces:
		for j in face:
			vertexdata += ps[j]
			colordata += colors[j]
			p = vec(*ps[j])
			dp = vec(math.sin(17*p.y), math.sin(19*p.z), math.sin(21*p.x)).times(0.1)
			normaldata += p.plus(dp).norm()
			
	moon = makedrawable(GL_TRIANGLES, vertexdata, colordata, normaldata)

def inittower():
	global tower
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (2, -2.5), (1, 1.6), (0.4, 1.8), (0.4, 4), (1.2, 4.7), (0, 6)

	for k in range(len(ps)-1):
		r0, z0 = ps[k]
		r1, z1 = ps[k+1]
		nr, nz = r1 - r0, z1 - z0
		n = math.sqrt(nr * nr + nz * nz)
		nr, nz = nz/n, -nr/n
		for j in range(12):
			A0, A1 = math.tau * j / 12, math.tau * (j+1) / 12
			S0, C0, S1, C1 = math.sin(A0), math.cos(A0), math.sin(A1), math.cos(A1)
			vertexdata += [r0*S0, r0*C0, z0, r1*S0, r1*C0, z1, r1*S1, r1*C1, z1, r0*S1, r0*C1, z0]
			colordata += ([0, 0.4, 0.6] if j % 2 else [0, 0.5, 0.5]) * 4
			normaldata += [nr*S0, nr*C0, nz, nr*S0, nr*C0, nz, nr*S1, nr*C1, nz, nr*S1, nr*C1, nz]
	tower = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initplatform():
	global platform
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (3.5, -2.5), (3, 4.4), (2.2, 4.4), (2.2, 3.8), (0, 3.8)

	for k in range(len(ps)-1):
		r0, z0 = ps[k]
		r1, z1 = ps[k+1]
		nr, nz = r1 - r0, z1 - z0
		n = math.sqrt(nr * nr + nz * nz)
		nr, nz = nz/n, -nr/n
		for j in range(12):
			A0, A1 = math.tau * j / 12, math.tau * (j+1) / 12
			S0, C0, S1, C1 = math.sin(A0), math.cos(A0), math.sin(A1), math.cos(A1)
			vertexdata += [r0*S0, r0*C0, z0, r1*S0, r1*C0, z1, r1*S1, r1*C1, z1, r0*S1, r0*C1, z0]
			colordata += [0.2, 0, 0] * 4
			normaldata += [nr*S0, nr*C0, nz, nr*S0, nr*C0, nz, nr*S1, nr*C1, nz, nr*S1, nr*C1, nz]
	platform = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def inithelmet():
	global helmet
	vertexdata = []
	colordata = []
	normaldata = []

	def p(A, B, r):
		return r * math.cos(A) * math.sin(B), r * math.cos(B), -r * math.sin(A) * math.sin(B)

	for k in range(4):
		A0 = k * math.tau / 16
		A1 = (k+1) * math.tau / 16
		for j in range(8):
			B0 = j * math.tau / 16
			B1 = (j + 1) * math.tau / 16
			vertexdata += p(A0, B0, 2.7)
			vertexdata += p(A0, B1, 2.7)
			vertexdata += p(A1, B1, 2.7)
			vertexdata += p(A1, B0, 2.7)
			normaldata += p(A0, B0, 1)
			normaldata += p(A0, B1, 1)
			normaldata += p(A1, B1, 1)
			normaldata += p(A1, B0, 1)
			colordata += [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4]
	helmet = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initwire():
	global wire
	vertexdata = []
	colordata = []
	normaldata = []

	r = 0.1
	for j in range(6):
		A0, A1 = math.tau * j / 6, math.tau * (j+1) / 6
		S0, C0, S1, C1 = math.sin(A0), math.cos(A0), math.sin(A1), math.cos(A1)
		vertexdata += [-1, r*S0, r*C0, 1, r*S0, r*C0, 1, r*S1, r*C1, -1, r*S1, r*C1]
		colordata += [0.5, 0.5, 0] * 4
		normaldata += [0, S0, C0, 0, S0, C0, 0, S1, C1, 0, S1, C1]

	wire = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)


def init():
	global vertexbuff
	initstars()	
	initmoon()
	inittower()
	initplatform()
	inithelmet()
	initwire()
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
	if obj.noff is not None:
		glEnableClientState(GL_NORMAL_ARRAY)
		glNormalPointer(GL_FLOAT, 0, vertexbuff + obj.noff)
	else:
		glDisableClientState(GL_NORMAL_ARRAY)
	glDrawArrays(obj.dtype, 0, obj.n)
#	glDisableClientState(GL_COLOR_ARRAY)
#	glDisableClientState(GL_VERTEX_ARRAY)
#	vertexbuff.unbind()


