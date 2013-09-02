import pygame, math, numpy, random, datetime
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
	nstar = int(settings.sx * settings.sy / 200)
	vertexdata = []
	colordata = []
	for star in range(nstar):
		x, y, z = vec.randomunit()
		if random.random() < 0.4:
			for _ in range(10):
				if random.random() < 0.9:
					z *= 0.7
		vertexdata += tuple(vec(x, y, z).norm(5000))
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
	for i in range(5):
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

	noise = dict(((x, y, z), random.uniform(-1, 1)) for x in range(12) for y in range(12) for z in range(12))
	def noiseat(x, y, z):
		x %= 12
		y %= 12
		z %= 12
		ix, iy, iz = int(x), int(y), int(z)
		fx, fy, fz = x - ix, y - iy, z - iz
		fx *= fx * (3 - fx * 2)
		fy *= fy * (3 - fy * 2)
		fz *= fz * (3 - fz * 2)
		jx, jy, jz = (ix + 1) % 12, (iy + 1) % 12, (iz + 1) % 12
		val = 0
		for bx in (0, 1):
			for by in (0, 1):
				for bz in (0, 1):
					val += (noise[([ix,jx][bx], [iy,jy][by], [iz,jz][bz])]
						* [1-fx,fx][bx]
						* [1-fy,fy][by]
						* [1-fz,fz][bz]
					)
		return val

	colors = []
	for x, y, z in ps:
		color = (0.4
			+ 0.1 * noiseat(x * 2.3 + 7.2, y * 2.3 + 4.3, z * 2.3 + 2.2) / 2.3
			+ 0.1 * noiseat(x * 4.3 + 7.2, y * 4.3 + 4.3, z * 4.3 + 2.2) / 4.3
			+ 0.1 * noiseat(x * 8.3 + 7.2, y * 8.3 + 4.3, z * 8.3 + 2.2) / 8.3
		)
		colors.append((color, color, color))
	vertexdata, colordata, normaldata = [], [], []
	for face in faces:
		for j in face:
			vertexdata += ps[j]
			colordata += colors[j]
			p = vec(*ps[j])
			x, y, z = p
			dp = vec(
				noiseat(x * 4.3 + 7.2, -z * 4.3 + 4.3, -y * 4.3 + 2.2),
				noiseat(z * 4.3 + 17.2, y * 4.3 + 14.3, -x * 4.3 + 12.2),
				noiseat(y * 4.3 + 117.2, x * 4.3 + 114.3, z * 4.3 + 112.2)
			).times(0.1)
			normaldata += p.plus(dp).norm()
			
	moon = makedrawable(GL_TRIANGLES, vertexdata, colordata, normaldata)

# add a radial component
def addradcomp(vdata, cdata, ndata, ps, colors, edges=None, m=12):
	n = len(ps) - 1
	pnorms = []
	for k in range(n):
		r0, z0 = ps[k]
		r1, z1 = ps[k+1]
		pnorms.append(vec(z1 - z0, 0, -(r1 - r0)).norm())
	if edges:
		bnorms, tnorms = [pnorms[0]], []
		for k, sharp in enumerate(edges):
			if sharp:
				bnorms.append(pnorms[k+1])
				tnorms.append(pnorms[k])
			else:
				norm = pnorms[k].plus(pnorms[k+1]).norm()
				bnorms.append(norm)
				tnorms.append(norm)
		tnorms.append(pnorms[-1])
	else:
		bnorms = tnorms = pnorms
	for k in range(n):
		r0, z0 = ps[k]
		r1, z1 = ps[k+1]
		nr0, _, nz0 = bnorms[k]
		nr1, _, nz1 = tnorms[k]
		for j in range(m):
			A0, A1 = math.tau * j / m, math.tau * (j+1) / m
			S0, C0, S1, C1 = math.sin(A0), math.cos(A0), math.sin(A1), math.cos(A1)
			vdata.extend([r0*S0, r0*C0, z0, r1*S0, r1*C0, z1, r1*S1, r1*C1, z1, r0*S1, r0*C1, z0])
			ndata.extend([nr0*S0, nr0*C0, nz0, nr1*S0, nr1*C0, nz1, nr1*S1, nr1*C1, nz1, nr0*S1, nr0*C1, nz0])
		cdata.extend(colors[k % len(colors)] * (4 * m))



def inittower():
	global tower
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (2, -2.5), (1, 1.6), (0.4, 1.8), (0.4, 4), (1.2, 4.7), (0, 6)

	addradcomp(vertexdata, colordata, normaldata, ps, [(0.2, 0.4, 0.5)])
	tower = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initplatform():
	global platform
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (3.5, -2.5), (3, 4.4), (2.2, 4.4), (2.2, 3.8), (0, 3.8)
	addradcomp(vertexdata, colordata, normaldata, ps, [(0.4, 0.2, 0.2)])
	platform = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initdish():
	global dish
	vertexdata = []
	colordata = []
	normaldata = []
	ps = [(1.9, -0.6), (1.3, 1), (0.9, 2.1), (0.8, 3.2), (1.8, 3.5), (2.7, 4.3), (3.2, 5.2),
		(1.9, 4.3), (0.3, 3.9), (0.3, 5.1), (0.6, 5.5), (0.3, 6), (0, 6)]
	c0, c1, c2 = (0.4, 0.4, 0.5), (0.4, 0.6, 0.4), (0.3, 0.3, 0.4)
	colors = [c0, c1, c0, c0, c0, c0, c2, c2, c0, c1, c1, c1]
	edges = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0]
	addradcomp(vertexdata, colordata, normaldata, ps, colors, edges, m=20)
	dish = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initblock():
	global block
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (0, -1), (1, -1), (1, 1), (0, 1)
	colors = [(1,1,1)]
	addradcomp(vertexdata, colordata, normaldata, ps, colors, m=4)
	block = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

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

def initsatellite():
	global satellite
	vertexdata = []
	colordata = []
	normaldata = []
	ps = (0, -1), (1.5, -0.5), (1.5, 0.5), (0, 1)
	colors = [(0.6, 0.6, 0.6)]
	addradcomp(vertexdata, colordata, normaldata, ps, colors, m=4)
	m = 6
	for k in range(m):
		y0, y1 = 1.5 + k * 0.6, 2.1 + k * 0.6
		vertexdata += [1, y0, 0, 1, y1, 0, -1, y1, 0, -1, y0, 0]
		vertexdata += [y0, -1, 0, y1, -1, 0, y1, 1, 0, y0, 1, 0]
		vertexdata += [-1, -y0, 0, -1, -y1, 0, 1, -y1, 0, 1, -y0, 0]
		vertexdata += [-y0, 1, 0, -y1, 1, 0, -y1, -1, 0, -y0, -1, 0]
	c0, c1 = (0.4, 0.4, 0.4), (0.6, 0.6, 0.6)
	colordata += (c0 + c1 + c1 + c0) * (m * 4)
	normaldata += [0, 0, 1] * (4 * m * 4)
	satellite = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)
	

def init():
	global vertexbuff
	for x, f in list(globals().items()):
		if x.startswith("init") and x != "init":
			f()
	vertexbuff = vbo.VBO(numpy.array(vbodata, dtype="f"), usage=GL_STATIC_DRAW)
	

def quit():
#	glDeleteBuffers(1, vertexbuff)
#	glDeleteBuffers(1, indexbuff)
	pass


def draw(obj, f=1):
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
	if f >= 1:
		glDrawArrays(obj.dtype, 0, obj.n)
	else:
		glDrawArrays(obj.dtype, 0, max(int(obj.n * f), 1))
#	glDisableClientState(GL_COLOR_ARRAY)
#	glDisableClientState(GL_VERTEX_ARRAY)
#	vertexbuff.unbind()


def screenshot():
	data = glReadPixels(0, 0, settings.sx, settings.sy, GL_RGB, GL_UNSIGNED_BYTE)
	data = numpy.fromstring(data, dtype=numpy.uint8).reshape((settings.sy, settings.sx, 3))
	data = numpy.transpose(data, (1, 0, 2))[:,::-1,:]
	surf = pygame.Surface((settings.sx, settings.sy)).convert_alpha()
	pygame.surfarray.pixels3d(surf)[:] = data
	pygame.image.save(surf, "screenshot-%s.png" % datetime.datetime.now().strftime("%Y%m%d%H%M%S"))




