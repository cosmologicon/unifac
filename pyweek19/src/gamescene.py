import vista, state

def init():
	pass

def think(dt, events):
	state.state.think(dt)
	vista.think(dt)

def draw():
	state.state.draw()

