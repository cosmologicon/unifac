import pygame, math, numpy, random, datetime, os.path, cPickle, os.path
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
from OpenGL.arrays import vbo
from collections import namedtuple
import scene, settings, state, data
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
	maxstars = 50000
	vertexdata = []
	colordata = []
	for star in range(maxstars):
		x, y, z = vec.randomunit()
		if random.random() < 0.4:
			for _ in range(10):
				if random.random() < 0.9:
					z *= 0.7
		vertexdata += tuple(vec(x, y, z).norm(1000))
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

def initstone():
	global stone
	A, B, C, D = vec(1,1,1).norm(), vec(-1,1,-1).norm(), vec(-1,-1,1).norm(), vec(1,-1,-1).norm()
	a, b, c, d = A.times(-1), B.times(-1), C.times(-1), D.times(-1)
	
	def flatten(*args):
		for arg in args:
			for x in arg:
				yield x
	vertexdata = list(flatten(A,B,C, A,C,D, A,D,B, C,B,D, a,c,b, a,d,c, a,b,d, c,d,b))
	normaldata = list(flatten(d,d,d, b,b,b, c,c,c, a,a,a, D,D,D, B,B,B, C,C,C, A,A,A))

	stone = makedrawable(GL_TRIANGLES, vertexdata, None, normaldata)
	


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
		if len(colors) > n:
			c = colors[k] + colors[k+1] + colors[k+1] + colors[k]
			cdata.extend(c * m)
		else:
			cdata.extend(colors[k % len(colors)] * (4 * m))

def addsphere(vdata, cdata, ndata, (x0, y0, z0), r, colors, n=12, m=12):
	def d(A, B):
		return math.sin(B)*math.cos(A), math.sin(B)*math.sin(A), -math.cos(B)
	for k in range(n):
		for j in range(m):
			for dj,dk in ((0,0), (0,1), (1,1), (1,0)):
				x, y, z = d((j+dj)*math.tau/m, (k+dk)*math.tau/n/2)
				vdata.extend([x0+r*x, y0+r*y, z0+r*z])
				ndata.extend([x, y, z])
		cdata.extend(colors[k % len(colors)] * (4 * m))


def addring(vdata, cdata, ndata, p0, u, r, D, color, m=12, f=None):
	f = f or u.cross(vec(0, 0, 1))
	f = f.norm() if f.length() else vec(1, 0, 0)
	l = f.cross(u)
	def d(A):
		return f.times(math.sin(A)).plus(l.times(math.cos(A)))
	for j in range(m):
		for dj,du,dr in ((0,-0.5,0), (0,0.5,1), (1,0.5,1), (1,-0.5,0)):
			dp = d((j+dj)*math.tau/m)
			# outer ring
			vdata.extend(p0.plus(dp.times(r)).plus(u.times(D*du)))
			ndata.extend(dp)
		for dj,du,dr in ((0,-0.5,0), (0,0.5,1), (1,0.5,1), (1,-0.5,0)):
			dp = d((j+dj)*math.tau/m)
			# top surface
			vdata.extend(p0.plus(dp.times(r*dr)).plus(u.times(D*0.5)))
			ndata.extend(u)
		for dj,du,dr in ((0,-0.5,0), (0,0.5,1), (1,0.5,1), (1,-0.5,0)):
			dp = d((j+dj)*math.tau/m)
			# bottom surface
			vdata.extend(p0.plus(dp.times(r*dr)).plus(u.times(-D*0.5)))
			ndata.extend(u.times(-1))
	cdata.extend(color * (12 * m))

def addtorus(vdata, cdata, ndata, p0, u, f, R, r, A0, A1, color0, color1=None, n=12, m=12):
	color1 = color1 or color0
	l = u.cross(f)
	def pdp(A, B):
		dp0hat = f.times(math.cos(A)).plus(l.times(math.sin(A)))
		dp1hat = dp0hat.times(math.cos(B)).plus(u.times(math.sin(B)))
		return p0.plus(dp0hat.times(R)).plus(dp1hat.times(r)), dp1hat
	for k in range(n):
		for j in range(m):
			for dj,dk in ((0,0), (0,1), (1,1), (1,0)):
				p, dp = pdp(A0+(k+dk)*(A1-A0)/n, (j+dj)*math.tau/m)
				vdata.extend(p)
				ndata.extend(dp)
				cdata.extend(color1 if dk else color0)


def initrelay():
	global relay
	vertexdata = []
	colordata = []
	normaldata = []
	relay = []
	ps = [(2, -1.5), (1.8, 0.2), (1.1, 0.6), (0.9, 1.1), (0.7, 1.9), (0.3, 2), (0.3, 3.6), (0.3, 4.4),
		(0.3, 5.5), (0.7, 5.6), (1, 6.1), (1, 6.9), (1, 7.6), (0, 9)]
	c0, c1, c2 = (0.3, 0.3, 0.3), (0.2, 0.3, 0.2), (0.7, 0.7, 0.7)
	colors = c0, c0, c0, c0, c0, c0, c1, c0, c2, c2, c0, c2, c2
	edges = 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1
	addradcomp(vertexdata, colordata, normaldata, ps, colors, edges)
	relay.append(makedrawable(GL_QUADS, vertexdata, colordata, normaldata))
	c2 = 0.4, 0.4, 1
	colors = c0, c0, c0, c0, c0, c0, c1, c0, c2, c2, c0, c2, c2
	vertexdata, colordata, normaldata = [], [], []
	addradcomp(vertexdata, colordata, normaldata, ps, colors, edges)
	relay.append(makedrawable(GL_QUADS, vertexdata, colordata, normaldata))
	c2 = 1, 0.4, 0.4
	colors = c0, c0, c0, c0, c0, c0, c1, c0, c2, c2, c0, c2, c2
	vertexdata, colordata, normaldata = [], [], []
	addradcomp(vertexdata, colordata, normaldata, ps, colors, edges)
	relay.append(makedrawable(GL_QUADS, vertexdata, colordata, normaldata))

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

	R = 2
	for k in range(4):
		A0 = k * math.tau / 16
		A1 = (k+1) * math.tau / 16
		for j in range(8):
			B0 = j * math.tau / 16
			B1 = (j + 1) * math.tau / 16
			vertexdata += p(A0, B0, R)
			vertexdata += p(A0, B1, R)
			vertexdata += p(A1, B1, R)
			vertexdata += p(A1, B0, R)
			normaldata += p(A0, B0, 1)
			normaldata += p(A0, B1, 1)
			normaldata += p(A1, B1, 1)
			normaldata += p(A1, B0, 1)
			colordata += [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4]
	helmet = makedrawable(GL_QUADS, vertexdata, colordata, normaldata)

def initsatellite():
	global satellite
	vertexdata = []
	colordata0 = []
	normaldata = []
	ps = (0, -1), (1.5, -0.5), (1.5, 0.5), (0, 1)
	colors = [(0.6, 0.6, 0.6)]
	addradcomp(vertexdata, colordata0, normaldata, ps, colors, m=4)
	colordata1 = [x * [0.5, 0.5, 1.5][j%3] for j,x in enumerate(colordata0)]
	colordata2 = [x * [1.5, 0.5, 0.5][j%3] for j,x in enumerate(colordata0)]
	m = 6
	for k in range(m):
		y0, y1 = 1.5 + k * 0.6, 2.1 + k * 0.6
		vertexdata += [1, y0, 0, 1, y1, 0, -1, y1, 0, -1, y0, 0]
		vertexdata += [y0, -1, 0, y1, -1, 0, y1, 1, 0, y0, 1, 0]
		vertexdata += [-1, -y0, 0, -1, -y1, 0, 1, -y1, 0, 1, -y0, 0]
		vertexdata += [-y0, 1, 0, -y1, 1, 0, -y1, -1, 0, -y0, -1, 0]
	c0, c1 = (0.3, 0.5, 0.5), (0.5, 0.7, 0.7)
	colordata0 += (c0 + c1 + c1 + c0) * (m * 4)
	colordata1 += (c0 + c1 + c1 + c0) * (m * 4)
	colordata2 += (c0 + c1 + c1 + c0) * (m * 4)
	normaldata += [0, 0, 1] * (4 * m * 4)


	satellite = [
		makedrawable(GL_QUADS, vertexdata, colordata0, normaldata),
		makedrawable(GL_QUADS, vertexdata, colordata1, normaldata),
		makedrawable(GL_QUADS, vertexdata, colordata2, normaldata),
	]
	
def initbasin():
	global basin
	vdata, cdata0, cdata1, cdata2, ndata, dummy = [], [], [], [], [], []
	addsphere(vdata, cdata0, ndata, (0, 0, 3), 2.5, [(0.8, 0.8, 0.8)], m=24)
	addsphere(dummy, cdata1, dummy, (0, 0, 3), 2.5, [(0.5, 0.5, 1)], m=24)
	addsphere(dummy, cdata2, dummy, (0, 0, 3), 2.5, [(1, 0.5, 0.5)], m=24)
	for cdata in [cdata0, cdata1, cdata2]:
		vd, nd = (vdata, ndata) if cdata is cdata0 else (dummy, dummy)
		addring(vd, cdata, nd, vec(0, 0, 3), vec(0, 0, 1), 2.8, 0.7, (0.3, 0.3, 0.3), m=24)
		addring(vd, cdata, nd, vec(0, 0, 3), vec(0, 1, 0), 2.8, 0.7, (0.3, 0.3, 0.3), m=24)
		addring(vd, cdata, nd, vec(0, 0, 3), vec(1, 0, 0), 2.8, 0.7, (0.3, 0.3, 0.3), m=24)

		for j in range(5):
			A = math.tau*j/5
			S, C = math.sin(A), math.cos(A)
			u = vec(C, S, 0)
			f = vec(-S, C, 0)
			addtorus(vd, cdata, nd, vec(0, 0, 0), u, f, 2.8, 1.1, -0.3, 1.5, (0.3, 0.35, 0.35), (0.2, 0.25, 0.25))

	basin = [
		makedrawable(GL_QUADS, vdata, cdata0, ndata),
		makedrawable(GL_QUADS, vdata, cdata1, ndata),
		makedrawable(GL_QUADS, vdata, cdata2, ndata),
	]

def initmine():
	global mine
	mine = []
	for color in (0.7, 0.7, 0.2), (0.7, 0.5, 0.2), (0.5, 0.2, 0.5):

		vdata, cdata, ndata = [], [], []
		addring(vdata, cdata, ndata, vec(2.41, 0, 0), vec(0, 1, 0), 0.8, 1, color, m=24)
		addring(vdata, cdata, ndata, vec(0, 2.41, 0), vec(-1, 0, 0), 0.8, 1, color, m=24)
		addring(vdata, cdata, ndata, vec(-2.41, 0, 0), vec(0, -1, 0), 0.8, 1, color, m=24)
		addring(vdata, cdata, ndata, vec(0, -2.41, 0), vec(1, 0, 0), 0.8, 1, color, m=24)
	
		vdata = [x * [1, 1, 5][j%3] for j, x in enumerate(vdata)]

		addtorus(vdata, cdata, ndata, vec(0, 0, -0.2), vec(0, 0, 1), vec(1, 0, 0), 2.3, 0.6, 0, math.tau, (0.7, 0.7, 0.7), n=24)

		ps = (2.5, -2), (2.3, 1.7), (2.1, 3.2), (1.9, 3.8), (1.7, 3.6), (1.6, 0.5), (0, 0.5)
		c0, c1 = (0.3, 0.3, 0.3), (0, 0, 0)
		colors = c0, c0, c0, c0, c0, c1, c1
		edges = 0, 0, 0, 0, 0
		addradcomp(vdata, cdata, ndata, ps, colors, edges=edges, m=24)
		mine.append(makedrawable(GL_QUADS, vdata, cdata, ndata))

def inittrashbin():
	global trashbin
	vdata, cdata, ndata = [], [], []

	ps = (1, -1.3), (1.1, 0.5), (1.2, 1.3), (1.7, 2.1), (2.2, 2.3), (2.3, 3.7), (1.8, 3.7), (1.8, 3.4), (0, 3.4)
	c0, c1, c2 = (0.3, 0.3, 0.3), (0.5, 0.4, 0.3), (0, 0, 0)
	colors = c0, c0, c1, c0, c0, c0, c2, c2
	edges = 0, 0, 0, 1, 1, 1, 1
	addradcomp(vdata, cdata, ndata, ps, colors, edges=edges, m=24)
	z, p, d, R, r, n, m = 2, 0.7, 0.6, 2, 0.4, 12, 6
	c0, c1 = (0.5, 0.2, 0.2), (0.35, 0.1, 0.1)
	addtorus(vdata, cdata, ndata, vec(p, 0, z), vec(0, -d, 1).norm(), vec(-1, 0, 0), R, r, 0, math.tau, c0, c1, n=n, m=m)
	addtorus(vdata, cdata, ndata, vec(0, p, z), vec(d, 0, 1).norm(), vec(0, 1, 0), R, r, 0, math.tau, c0, c1, n=n, m=m)
	addtorus(vdata, cdata, ndata, vec(-p, 0, z), vec(0, d, 1).norm(), vec(1, 0, 0), R, r, 0, math.tau, c0, c1, n=n, m=m)
	addtorus(vdata, cdata, ndata, vec(0, -p, z), vec(-d, 0, 1).norm(), vec(0, -1, 0), R, r, 0, math.tau, c0, c1, n=n, m=m)
	trashbin = makedrawable(GL_QUADS, vdata, cdata, ndata)


def initlaunchpad():
	global launchpad
	vdata, cdata, ndata = [], [], []
	ps = (1.2, -2), (0.8, 3.3), (2, 4), (2.3, 5.3), (0, 5.3)
	c0 = (0.3, 0.3, 0.3)
	colors = (c0,)
	addradcomp(vdata, cdata, ndata, ps, colors, m=24)
	z, p, d, R, r, n = 2, 1, 0.5, 2, 0.6, 24
	c0, c1 = (0.3, 0.4, 0.2), (0.1,0.2,0.1)
	R, r, n = 20, 0.4, 16
	p = R - 2.7
	A = 6.5/R
	addtorus(vdata, cdata, ndata, vec(-p, 0, -2), vec(0, -1, 0), vec(1, 0, 0), R, r, 0, A, c0, c1, n=n)
	addtorus(vdata, cdata, ndata, vec(0, p, -2), vec(-1, 0, 0), vec(0, -1, 0), R, r, 0, A, c0, c1, n=n)
	addtorus(vdata, cdata, ndata, vec(p, 0, -2), vec(0, 1, 0), vec(-1, 0, 0), R, r, 0, A, c0, c1, n=n)
	addtorus(vdata, cdata, ndata, vec(0, -p, -2), vec(1, 0, 0), vec(0, 1, 0), R, r, 0, A, c0, c1, n=n)
	launchpad = makedrawable(GL_QUADS, vdata, cdata, ndata)

def initcopter():
	global copter
	copter = []
	for c0 in (0.2, 0.2, 0.4), (0.4, 0.2, 0.2), (0.2, 0.4, 0.2):
		vdata, cdata, ndata = [], [], []
		ps = (0, -0.7), (0.4, -0.7), (0.4, -0.5), (1.1, 0), (0.8, 0.5), (0.4, 0.8), (0, 0.95)
		c1 = (0.5, 0.5, 0.5)
		c2 = [x/2 for x in c0]
		colors = c1, c1, c0, c0, c2, c0
		addradcomp(vdata, cdata, ndata, ps, colors, m=16)
		copter.append(makedrawable(GL_QUADS, vdata, cdata, ndata))

def initbarrel():
	global barrel
	vdata, cdata, ndata = [], [], []
	ps = (2.9, -1.5), (2.9, 1.8), (2.6, 2.1), (2.6, 3), (2.3, 3.3), (2.3, 4), (1.8, 4), (1.8, 3.7), (0, 3.7)
	c0, c1, c2, c3 = (0.4, 0.4, 0.5), (0.25, 0.25, 0.4), (0.2, 0.2, 0.3), (0, 0, 0)
	colors = c2, c2, c1, c1, c0, c0, c0, c3, c3
	addradcomp(vdata, cdata, ndata, ps, colors, m=8)
	barrel = makedrawable(GL_QUADS, vdata, cdata, ndata)

def inithq():
	global hq
	vdata, cdata, ndata = [], [], []
	v0, v1, v2 = vec(0, 1, 0), vec(0.83, -0.5, 0).norm(), vec(-0.83, -0.5, 0).norm()
	for v in v0, v1, v2:
		addring(vdata, cdata, ndata, vec(0, 0, -0.2), v, 3.7, 1, (0.5, 0.5, 0.5), m=32)
		addring(vdata, cdata, ndata, vec(0, 0, -0.2), v, 3.4, 1.5, (0.4, 0.4, 0.4), m=32)
		addring(vdata, cdata, ndata, vec(0, 0, -0.2), v, 3.1, 2, (0.3, 0.3, 0.3), m=32)

	ps = (2.8, -1.5), (2.4, 2.9), (1.2, 3.8), (1.1, 4.5), (2, 5.1), (1.6, 5.1), (1.6, 6.9), (2, 6.9), (0, 7.6)
	c0, c1 = (0.3, 0.4, 0.4), (0.6, 0.8, 0.9)
	colors = c0, c0, c0, c0, c0, c1, c0, c0
	addradcomp(vdata, cdata, ndata, ps, colors, m=6)
	hq = makedrawable(GL_QUADS, vdata, cdata, ndata)

def initspindle():
	global spindle
	spindle = []
	for c in (0.3, 0.3, 0.3), (0.2, 0.2, 0.3), (0.3, 0.2, 0.2):
		vdata, cdata, ndata = [], [], []
		ps = (2.5, -2), (2.5, 0.4), (0.6, 0.4), (0.6, 6), (0, 6)
		addradcomp(vdata, cdata, ndata, ps, (c,), m=16)
		spindle.append(makedrawable(GL_QUADS, vdata, cdata, ndata))

	global piston
	piston = []
	for c in (0.5, 0.5, 0.5), (0.4, 0.4, 0.6), (0.6, 0.4, 0.4):
		vdata, cdata, ndata = [], [], []
		ps = (0, -1.6), (0.7, -1.6), (1, -1.3), (1, -0.2), (1, 0), (1, 0.2), (1, 0.4), (1, 1.3), (0.7, 1.6), (0, 1.6)
		g = 0.2, 0.5, 0.2
		colors = c, c, c, g, c, g, c, c, c
		addradcomp(vdata, cdata, ndata, ps, colors, m=16)
		piston.append(makedrawable(GL_QUADS, vdata, cdata, ndata))

def initmedic():
	global medic
	vdata, cdata, ndata = [], [], []
	c0, c1, c2 = (0.3, 0.3, 0.3), (0.4, 0.4, 0.4), (0, 0, 0)
	colors = c0, c0, c0, c0, c1, c1, c0, c2, c2
	ps = (2.8, -1), (1, 1), (1, 2), (1.2, 2.9), (2.4, 3.8), (2.4, 4.6), (1.8, 4.6), (1.8, 4.3), (0, 4.3)
	edges = 0, 0, 0, 1, 1, 1, 0
	addradcomp(vdata, cdata, ndata, ps, colors, edges=edges, m=28)
	medic = makedrawable(GL_QUADS, vdata, cdata, ndata)

	global wings
	vdata, cdata, ndata = [], [], []
	c0 = (0.2, 0.4, 0.2)
	colors = (c0,)
	ps = (0.2, 0), (0.8, 1.8), (1.3, 2), (0, 3.5)
	addradcomp(vdata, cdata, ndata, ps, colors, m=4)
	nvdata, nndata = [], []
	for j in range(0, len(vdata), 3):
		x, y, z = vdata[j:j+3]
		nvdata += [z, y, 1.4-x]
		x, y, z = ndata[j:j+3]
		nndata += [z, y, -x]
	for j in range(0, len(vdata), 3):
		x, y, z = vdata[j:j+3]
		nvdata += [-y, z, 1.4-x]
		x, y, z = ndata[j:j+3]
		nndata += [-y, z, -x]
	for j in range(0, len(vdata), 3):
		x, y, z = vdata[j:j+3]
		nvdata += [-z, -y, 1.4-x]
		x, y, z = ndata[j:j+3]
		nndata += [-z, -y, -x]
	for j in range(0, len(vdata), 3):
		x, y, z = vdata[j:j+3]
		nvdata += [y, -z, 1.4-x]
		x, y, z = ndata[j:j+3]
		nndata += [y, -z, -x]
	wings = makedrawable(GL_QUADS, nvdata, cdata * 4, nndata)

def initartifact():
	global artifact
	artifact = []
	for c in (0.3, 0.3, 0.3), (0.2, 0.2, 0.3), (0.3, 0.2, 0.2):
		c2 = [x * 0.5 for x in c]
		vdata, cdata, ndata = [], [], []
		ps = (1.8, -1.3), (1.2, 1.2), (2, 1.9), (1.5, 4.8), (1.6, 5.1), (1.1, 7), (0, 7)
		colors = c, c2, c, c2, c, c
		addradcomp(vdata, cdata, ndata, ps, colors, m=8)
		addring(vdata, cdata, ndata, vec(0, 0, 3.5), vec(1, 0, 0), 3.4, 1, (c), m=3, f=vec(0, -1, 0))
		addring(vdata, cdata, ndata, vec(0, 0, 3.5), vec(0, 1, 0), 3.4, 1, (c), m=3, f=vec(1, 0, 0))
		artifact.append(makedrawable(GL_QUADS, vdata, cdata, ndata))

def initsplode():
	global splode
	vdata = [x for _ in range(1000) for x in vec.randomunit(random.random())]
	splode = makedrawable(GL_POINTS, vdata, None, None)

def init():
	global vertexbuff


	global stars, moon, stone, relay, platform, dish, block, helmet, satellite, basin, mine, trashbin, launchpad, copter, barrel, hq, spindle, piston, medic, wings, artifact, splode, vbodata

	fname = data.filepath("graphics.pkl")
	try:
		stars, moon, stone, relay, platform, dish, block, helmet, satellite, basin, mine, trashbin, launchpad, copter, barrel, hq, spindle, piston, medic, wings, artifact, splode, vbodata = cPickle.load(open(fname, "rb"))
	except:
		for x, f in list(globals().items()):
			if x.startswith("init") and x != "init":
				f()
		obj = stars, moon, stone, relay, platform, dish, block, helmet, satellite, basin, mine, trashbin, launchpad, copter, barrel, hq, spindle, piston, medic, wings, artifact, splode, vbodata
		cPickle.dump(obj, open(fname, "wb"))
	vertexbuff = vbo.VBO(numpy.array(vbodata, dtype="f"), usage=GL_STATIC_DRAW)
	vertexbuff.bind()
	

def quit():
#	glDeleteBuffers(1, vertexbuff)
#	glDeleteBuffers(1, indexbuff)
	pass


coloroverride = False
def draw(obj, f=1, coloroverride=None):
	glEnableClientState(GL_VERTEX_ARRAY)
	glVertexPointer(3, GL_FLOAT, 0, vertexbuff + obj.voff)
	if not coloroverride and obj.coff is not None:
		glEnableClientState(GL_COLOR_ARRAY)
		glColorPointer(3, GL_FLOAT, 0, vertexbuff + obj.coff)
	else:
		glDisableClientState(GL_COLOR_ARRAY)
		glColor(*coloroverride)
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

def fill(*color):
	glDisable(GL_LIGHTING)
	glDisable(GL_TEXTURE_2D)
	glColor(*color)
	glBegin(GL_QUADS)
	glVertex(0, 0, 0)
	glVertex(settings.sx, 0, 0)
	glVertex(settings.sx, settings.sy, 0)
	glVertex(0, settings.sy, 0)
	glEnd()


def screenshot():
	sx, sy = pygame.display.get_surface().get_size()
	data = glReadPixels(0, 0, sx, sy, GL_RGB, GL_UNSIGNED_BYTE)
	data = numpy.fromstring(data, dtype=numpy.uint8).reshape((sx, sy, 3))
	data = numpy.transpose(data, (1, 0, 2))[:,::-1,:]
	surf = pygame.Surface((sx, sy)).convert_alpha()
	pygame.surfarray.pixels3d(surf)[:] = data
	pygame.image.save(surf, "screenshot-%s.png" % datetime.datetime.now().strftime("%Y%m%d%H%M%S"))

def setmode(fullscreen=None, resolution=None):
	if fullscreen is not None:
		settings.fullscreen = fullscreen
	if resolution is not None:
		settings.ssize = settings.sx, settings.sy = resolution

	if settings.fullscreen:
		settings.sx, settings.sy = settings.ssize = max(pygame.display.list_modes())
	else:
		settings.sx, settings.sy = settings.ssize = settings.wsize

	fsflag = FULLSCREEN if settings.fullscreen else 0
	pygame.display.quit()
	pygame.display.init()
#	pygame.display.gl_set_attribute(pygame.GL_DEPTH_SIZE, 24)
	pygame.display.set_mode(settings.ssize, DOUBLEBUF | OPENGL | fsflag)
	pygame.display.set_caption(settings.gamename)
	glClearColor(0, 0, 0, 1)
#	glViewport(0, 0, settings.sx, settings.sy)
#	glMatrixMode(GL_PROJECTION)
#	glLoadIdentity()
#	glOrtho(0, settings.sx, 0, settings.sy, -1, 1)
#	glMatrixMode(GL_MODELVIEW)



