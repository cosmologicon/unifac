import math, random
from collections import namedtuple

class vec(namedtuple("vec", "x y z".split())):
	def plus(self, other):
		return vec(self.x + other.x, self.y + other.y, self.z + other.z)
	def minus(self, other):
		return vec(self.x - other.x, self.y - other.y, self.z - other.z)
	def times(self, f):
		return vec(self.x * f, self.y * f, self.z * f)
	def dot(self, other):
		return self.x * other.x + self.y * other.y + self.z * other.z
	def cross(self, other):
		return vec(
			self.y * other.z - other.y * self.z,
			self.z * other.x - other.z * self.x,
			self.x * other.y - other.x * self.y
		)
	def proj(self, other):
		return other.times(self.dot(other) / other.dot(other))
	def rej(self, other):
		return self.plus(other.times(-self.dot(other) / other.dot(other)))
	def length(self):
		return math.sqrt(self.dot(self))
	def norm(self, l=1):
		return self.times(l/self.length())
	# rotation matrix by the given angle
	# http://stackoverflow.com/a/10787529/779948
	def rot(self, A):
		x, y, z = self
		s, c = -math.sin(A), math.cos(A)
		C = 1 - c
		return [
			x*x*C+c, x*y*C+z*s, z*x*C-y*s,
			y*x*C-z*s, y*y*C+c, z*y*C+x*s,
			x*z*C+y*s, z*y*C-x*s, z*z*C+c,
		]
	# rotation matrix to transform self into proj_other self
	def rotto(self, other):
		raise ""
	def apply(self, mat):
		x, y, z = self
		return vec(
			x*mat[0]+y*mat[1]+z*mat[2],
			x*mat[3]+y*mat[4]+z*mat[5],
			x*mat[6]+y*mat[7]+z*mat[8]
		)

	@staticmethod
	def randomunit(l=1):
		while True:
			v = vec(*(random.uniform(-1, 1) for _ in (0,1,2)))
			if v.length() < 1:
				return v.norm(l)
	
"""
Q[0][0] = v2[0] * v2[0] * C + c;
Q[0][1] = v2[1] * v2[0] * C + v2[2] * s;
Q[0][2] = v2[2] * v2[0] * C - v2[1] * s;

Q[1][0] = v2[1] * v2[0] * C - v2[2] * s;
Q[1][1] = v2[1] * v2[1] * C + c;
Q[1][2] = v2[2] * v2[1] * C + v2[0] * s;

Q[2][0] = v2[0] * v2[2] * C + v2[1] * s;
Q[2][1] = v2[2] * v2[1] * C - v2[0] * s;
Q[2][2] = v2[2] * v2[2] * C + c;

v1[0] = v1[0] * Q[0][0] + v1[0] * Q[0][1] + v1[0] * Q[0][2];
v1[1] = v1[1] * Q[1][0] + v1[1] * Q[1][1] + v1[1] * Q[1][2];
v1[2] = v1[2] * Q[2][0] + v1[2] * Q[2][1] + v1[2] * Q[2][2];
"""

if __name__ == "__main__":
	tau = math.pi * 2
	x = vec(1,0,0)
	y = vec(0,1,0)
	z = vec(0,0,1)
	m = y.rot(tau/4)
	print z.apply(m)
	print x.apply(x.rot(tau/4))
	

