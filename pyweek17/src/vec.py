import math
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
	def norm(self):
		return self.times(1/self.length())

