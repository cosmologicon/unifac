from websocket import create_connection
import pygame, json, random, time
import shared

socket = create_connection(shared.clientpath)
response = socket.recv()
you = shared.Goofball(json.loads(response))

pygame.display.init()
screen = pygame.display.set_mode((shared.sx, shared.sy))

goofballs = { you.name: you }

def worldtoscreen(x, y):
	return [int(shared.sx/2 + x - you.x), int(shared.sy/2 + y - you.y)]
def drawrect((x,y,w,h), color):
	x, y = worldtoscreen(x, y)
	screen.fill(color, (x, y, w, h))
def drawgoofball(goofball):
	x, y = worldtoscreen(goofball.x, goofball.y)
	pygame.draw.circle(screen, goofball.color, (x, y), goofball.r)

rects = [((0,0,shared.ax,shared.ay),(0,50,100))]
for _ in range(40):
	w, h = random.randint(100, 400), random.randint(100, 400)
	x, y = random.randint(0, shared.ax-w), random.randint(0, shared.ay-h)
	color = tuple(random.randint(0, 80) for _ in range(3))
	rects.append(((x,y,w,h), color))

dtavg = 0
pygame.font.init()
font = pygame.font.Font(None, 22)

while True:
	pygame.event.pump()
	k = pygame.key.get_pressed()
	dx = k[pygame.K_RIGHT] - k[pygame.K_LEFT]
	dy = k[pygame.K_DOWN] - k[pygame.K_UP]
	if k[pygame.K_ESCAPE]:
		break
	t0 = time.time()
	socket.send(json.dumps([dx, dy]))
	response = socket.recv()
	dt = time.time() - t0
	dtavg = 0.95 * dtavg + 0.05 * dt
	for name, state in json.loads(response).items():
		if name in goofballs:
			goofballs[name].setstate(state)
		else:
			goofballs[name] = shared.Goofball(state)
	screen.fill((0,0,0))
	for rect, color in rects:
		drawrect(rect, color)
	for goofball in goofballs.values():
		drawgoofball(goofball)
	screen.blit(font.render("ping: %.0fms" % (dtavg * 1000), True, (255,255,255)), (5, 5))
	pygame.display.flip()


