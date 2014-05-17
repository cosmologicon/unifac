# reference implementation

from __future__ import division
from pygame import *
from math import *
from random import *

perm = [151,160,137,91,90,15,
 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
 190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
 88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
 77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
 102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
 135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
 5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
 223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
 129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
 251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
 49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
 138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]

grads = [
	[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],
	[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
]

# Get the gradient at the given lattice point
def grad3((x, y, z)):
	g = perm[(int(z)) % 256]
	g = perm[(int(y)+g) % 256]
	g = perm[(int(x)+g) % 256]
	return grads[g%12]

def scalar3((x, y, z)):
	g = perm[(int(z)) % 256]
	g = perm[(int(y)+g) % 256]
	g = perm[(int(x)+g) % 256]
	return (g - 128) / 128

def dot((x0, y0, z0), (x1, y1, z1)):
	return x0 * x1 + y0 * y1 + z0 * z1

def fade(t):
	return t * t * t * (t * (t * 6 - 15) + 10)

def mix(a, b, t):
	return (1 - t) * a + t * b

def classicnoise((xin, yin, zin)):
	X, Y, Z = floor(xin), floor(yin), floor(zin)
	x, y, z = xin - X, yin - Y, zin - Z
	u, v, w = fade(x), fade(y), fade(z)
	n000 = dot(grad3((X, Y, Z)), (x, y, z))
	n001 = dot(grad3((X, Y, Z+1)), (x, y, z-1))
	n010 = dot(grad3((X, Y+1, Z)), (x, y-1, z))
	n011 = dot(grad3((X, Y+1, Z+1)), (x, y-1, z-1))
	n100 = dot(grad3((X+1, Y, Z)), (x-1, y, z))
	n101 = dot(grad3((X+1, Y, Z+1)), (x-1, y, z-1))
	n110 = dot(grad3((X+1, Y+1, Z)), (x-1, y-1, z))
	n111 = dot(grad3((X+1, Y+1, Z+1)), (x-1, y-1, z-1))

	nx00 = mix(n000, n100, u)
	nx01 = mix(n001, n101, u)
	nx10 = mix(n010, n110, u)
	nx11 = mix(n011, n111, u)

	nxy0 = mix(nx00, nx10, v)
	nxy1 = mix(nx01, nx11, v)

	return mix(nxy0, nxy1, w)

def scalarnoise((xin, yin, zin)):
	X, Y, Z = floor(xin), floor(yin), floor(zin)
	x, y, z = xin - X, yin - Y, zin - Z
	u, v, w = fade(x), fade(y), fade(z)
	n000 = scalar3((X, Y, Z))
	n001 = scalar3((X, Y, Z+1))
	n010 = scalar3((X, Y+1, Z))
	n011 = scalar3((X, Y+1, Z+1))
	n100 = scalar3((X+1, Y, Z))
	n101 = scalar3((X+1, Y, Z+1))
	n110 = scalar3((X+1, Y+1, Z))
	n111 = scalar3((X+1, Y+1, Z+1))

	nx00 = mix(n000, n100, u)
	nx01 = mix(n001, n101, u)
	nx10 = mix(n010, n110, u)
	nx11 = mix(n011, n111, u)

	nxy0 = mix(nx00, nx10, v)
	nxy1 = mix(nx01, nx11, v)

	return mix(nxy0, nxy1, w)


def simplexnoise((xin, yin, zin)):
	s = (xin + yin + zin) / 3
	i, j, k = floor(xin + s), floor(yin + s), floor(zin + s)
	t = (i + j + k) / 6
	X0, Y0, Z0 = i - t, j - t, k - t
	x0, y0, z0 = xin - X0, yin - Y0, zin - Z0
	if x0 >= y0:
		if y0 >= z0:
			i1, j1, k1, i2, j2, k2 = 1, 0, 0, 1, 1, 0
		elif x0 >= z0:
			i1, j1, k1, i2, j2, k2 = 1, 0, 0, 1, 0, 1
		else:
			i1, j1, k1, i2, j2, k2 = 0, 0, 1, 1, 0, 1
	else:
		if y0 < z0:
			i1, j1, k1, i2, j2, k2 = 0, 0, 1, 0, 1, 1
		elif x0 < z0:
			i1, j1, k1, i2, j2, k2 = 0, 1, 0, 0, 1, 1
		else:
			i1, j1, k1, i2, j2, k2 = 0, 1, 0, 1, 1, 0

	x1, x2, x3 = x0 - i1 + 1/6, x0 - i2 + 1/3, x0 - 1/2
	y1, y2, y3 = y0 - j1 + 1/6, y0 - j2 + 1/3, y0 - 1/2
	z1, z2, z3 = z0 - k1 + 1/6, z0 - k2 + 1/3, z0 - 1/2
	p0 = x0, y0, z0
	p1 = x1, y1, z1
	p2 = x2, y2, z2
	p3 = x3, y3, z3

	q0 = i, j, k
	q1 = i + i1, j + j1, k + k1
	q2 = i + i2, j + j2, k + k2
	q3 = i + 1, j + 1, k + 1

	def contrib(t):
		return 0 if t <= 0 else t ** 4

	n0 = contrib(0.5 - dot(p0, p0)) * dot(grad3(q0), p0)
	n1 = contrib(0.5 - dot(p1, p1)) * dot(grad3(q1), p1)
	n2 = contrib(0.5 - dot(p2, p2)) * dot(grad3(q2), p2)
	n3 = contrib(0.5 - dot(p3, p3)) * dot(grad3(q3), p3)

	return 32 * (n0 + n1 + n2 + n3)

if False:
	h = 0.0001
	n = 20000000
	for k in range(n):
		x0, y0, z0 = [uniform(0, 256) for _ in range(3)]
		dndx = (classicnoise((x0 + h, y0, z0)) - classicnoise((x0 - h, y0, z0))) / (2 * h)
		dndy = (classicnoise((x0, y0 + h, z0)) - classicnoise((x0, y0 - h, z0))) / (2 * h)
		ca = atan2(dndy, dndx)
		dndx = (simplexnoise((x0 + h, y0, z0)) - simplexnoise((x0 - h, y0, z0))) / (2 * h)
		dndy = (simplexnoise((x0, y0 + h, z0)) - simplexnoise((x0, y0 - h, z0))) / (2 * h)
		sa = atan2(dndy, dndx)
		print x0, y0, z0, classicnoise((x0, y0, z0)), ca, simplexnoise((x0, y0, z0)), sa

	exit()
	
if False:
	for j in range(32):
		alpha = j / 32 * pi
		S, C = sin(alpha), cos(alpha)
		ctotal = 0
		stotal = 0
		c2total = 0
		s2total = 0
		c3total = 0
		s3total = 0
		for k in range(n):
			x0, y0, z0 = [uniform(0, 256) for _ in range(3)]
			n0 = classicnoise((x0, y0, z0))
			n1 = classicnoise((x0+h*C, y0+h*S, z0))
			grad = (n1 - n0) / h
			ctotal += abs(grad)
			c2total += grad * grad
			c3total += abs(grad) < 0.01
			n0 = simplexnoise((x0, y0, z0))
			n1 = simplexnoise((x0+h*C, y0+h*S, z0))
			grad = (n1 - n0) / h
			stotal += abs(grad)
			s2total += grad * grad
			s3total += abs(grad) < 0.01
		print j, alpha, degrees(alpha), ctotal / n, sqrt(c2total / n), c3total / n, stotal / n, sqrt(s2total / n), s3total / n

	exit()


screen = display.set_mode((854, 480))

def scalarfractal((x, y, z)):
	return sum(scalarnoise((x * f, y * f, z * f)) / f for f in (1, 1.77, 3.04, 5.55, 11.09, 19.9, 33.3))
def scalarclassic((x, y, z)):
	return sum(classicnoise((x * f, y * f, z * f)) / f for f in (1, 1.77, 3.04, 5.55, 11.09, 19.9, 33.3))

for px in range(854):
	for py in range(480):
		x, y = px * 0.03, py * 0.03
		z = 0.47
		n = scalarclassic((x, y, z)) if px < 854/2 else scalarfractal((x, y, z))
		c = int(128 + 120 * n)
#		c = 200 if n > 0 else 50
		c = min(max(c, 0), 255)
		screen.set_at((px, py), (c, c, c))
	if px % 10 == 0:
		display.flip()

font.init()
f = font.Font(None, 32)
screen.blit(f.render("classic noise", True, (255, 128, 0)), (10, 10))
screen.blit(f.render("scalar noise", True, (255, 128, 0)), (854/2 + 10, 10))

display.flip()

image.save(screen, "noise-compare.png")

event.pump()
def isquit(event):
	return event.type in (QUIT,)
while not any(map(isquit, event.get())):
	pass



