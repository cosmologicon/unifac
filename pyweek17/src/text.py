import pygame, numpy
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
import settings

fonts = {}
def getfont(fontname, size):
	key = fontname, size
	if key not in fonts:
		fonts[key] = pygame.font.Font(fontname, size)
	return fonts[key]

renders = {}
def getrender(text, fontname, size, color):
	key = text, fontname, size, color
	if key not in renders:
		renders[key] = getfont(fontname, size).render(text, True, color)
	return renders[key]

surfs = {}
def getsurf(sw, sh):
	size = sw, sh
	if size not in surfs:
		surfs[size] = pygame.Surface((sw, sh)).convert_alpha()
	return surfs[size]

class Texture(object):
	def __init__(self, text, fontname, size, color, bcolor):
		render = getrender(text, fontname, size, color)
		self.rw, self.rh = render.get_size()
		self.d = round(0.05 * size) if bcolor else 0
		self.rw += self.d
		self.rh += self.d
		sw = 4
		while sw < max(self.rw, self.rh):
			sw <<= 1
		sh = sw
		self.sw = sw
		self.sh = sh
		surf = getsurf(sw, sh)
		surf.fill((0, 0, 0, 0))
		if bcolor:
			brender = getrender(text, fontname, size, bcolor)
			surf.blit(brender, (0, 0))
			surf.blit(brender, (2 * self.d, 0))
			surf.blit(brender, (0, 2 * self.d))
			surf.blit(brender, (2 * self.d, 2 * self.d))

		surf.blit(render, (self.d, self.d))
		data = numpy.hstack([
			numpy.reshape(pygame.surfarray.pixels3d(surf), [sw * sh, 3]),
			numpy.reshape(pygame.surfarray.pixels_alpha(surf), [sw * sh, 1])
		])
		self.texture = glGenTextures(1)
		glPixelStorei(GL_UNPACK_ALIGNMENT,1)
		glBindTexture(GL_TEXTURE_2D, self.texture)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
		glTexImage2D(GL_TEXTURE_2D, 0, 4, sw, sh, 0, GL_RGBA, GL_UNSIGNED_BYTE, data)

	def draw(self, (x, y), hanchor, vanchor):
		x0 = round(x - hanchor * self.rw)
		y0 = round(y - self.sh + (1 - vanchor) * self.rh)
		glBindTexture(GL_TEXTURE_2D, self.texture)
		glBegin(GL_QUADS)
		glTexCoord(1, 0)
		glVertex(x0, y0, 0)
		glTexCoord(0, 0)
		glVertex(x0, y0 + self.sh, 0)
		glTexCoord(0, 1)
		glVertex(x0 + self.sw, y0 + self.sh, 0)
		glTexCoord(1, 1)
		glVertex(x0 + self.sw, y0, 0)
		glEnd()


textures = {}
def gettexture(text, fontname, size, color, bcolor):
	key = text, fontname, size, color, bcolor
	if key not in textures:
		textures[key] = Texture(text, fontname, size, color, bcolor)
	return textures[key]


def setup():
	glMatrixMode(GL_PROJECTION)
	glLoadIdentity()
	glTranslate(-1, -1, 0)
	glScale(2.0/settings.sx, 2.0/settings.sy, 1)
#	glDisable(GL_DEPTH_TEST)
	glDisable(GL_CULL_FACE)
	glDisable(GL_LIGHTING)
	glEnable(GL_TEXTURE_2D)
	glEnable(GL_BLEND)
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

def write(text, fontname, size, color, (x, y), bcolor=None, hanchor=0.5, vanchor=0.5):
	texture = gettexture(text, fontname, size, color, bcolor)
	texture.draw((x, y), hanchor, vanchor)

