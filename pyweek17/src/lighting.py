from OpenGL.GL import *
import settings, state


lights = GL_LIGHT0, GL_LIGHT1, GL_LIGHT2, GL_LIGHT3, GL_LIGHT4, GL_LIGHT5, GL_LIGHT6

# Call this at the beginning of the scene or at least the beginning of the game
def init():

	glLightModelfv(GL_LIGHT_MODEL_AMBIENT, [0,0,0,1])

	# LIGHT 0: normal lighting conditions
	glLight(GL_LIGHT0, GL_AMBIENT, [0.3,0.3,0.3,1])
	glLight(GL_LIGHT0, GL_DIFFUSE, [1,1,1,1])
	glLight(GL_LIGHT0, GL_SPECULAR, [0,0,0,1])

	# LIGHT 1: disabled structure
	glLight(GL_LIGHT1, GL_AMBIENT, [0.1,0.1,0.1,1])
	glLight(GL_LIGHT1, GL_DIFFUSE, [0.5,0.5,0.5,1])
	glLight(GL_LIGHT1, GL_SPECULAR, [0,0,0,1])

	# LIGHT 2: overlapped structure/invalid position
	glLight(GL_LIGHT2, GL_AMBIENT, [0.2,0.1,0.1,1])
	glLight(GL_LIGHT2, GL_DIFFUSE, [1,0.3,0.3,1])
	glLight(GL_LIGHT2, GL_SPECULAR, [0,0,0,1])

	# LIGHT 3: damaged structure	

	# LIGHT 4: selected structure
	glLight(GL_LIGHT4, GL_AMBIENT, [1,1,0.5,1])
	glLight(GL_LIGHT4, GL_DIFFUSE, [0,0,0,1])
	glLight(GL_LIGHT4, GL_SPECULAR, [0,0,0,1])

	# LIGHT 5: moon surface (depends on level)
	glLight(GL_LIGHT5, GL_AMBIENT, [0.2,0.24,0.24,1])
	glLight(GL_LIGHT5, GL_DIFFUSE, [0.7,0.8,0.8,1])
	glLight(GL_LIGHT5, GL_SPECULAR, [0,0,0,1])
	
	# LIGHT 6: glowing
	glLight(GL_LIGHT6, GL_AMBIENT, [1,1,1,1])
	glLight(GL_LIGHT6, GL_DIFFUSE, [0.3,0.3,0.3,1])
	glLight(GL_LIGHT6, GL_SPECULAR, [0,0,0,1])

def setpos(lightpos):
	for l in lights:
		glLight(l, GL_POSITION, lightpos)

def setlight(light):
	for l in lights:
		if l == light:
			glEnable(l)
		else:
			glDisable(l)

def normal():
	setlight(GL_LIGHT0)

def invalid():
	setlight(GL_LIGHT2)

def disabled():
	setlight(GL_LIGHT1)

def select():
	setlight(GL_LIGHT4)

def moon():
	setlight(GL_LIGHT5)

def glow():
	setlight(GL_LIGHT6)
