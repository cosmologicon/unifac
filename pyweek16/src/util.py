import uuid, os.path, random, datetime
import settings, data

def getlogin():
	if settings.resetlogin: return None
	fname = data.filepath(settings.loginfile)
	if os.path.exists(fname):
		return open(fname).read()
	return None
def savelogin(username):
	fname = data.filepath(settings.loginfile)
	open(fname, "w").write(username)

usednames = set()
def randomname():
	while True:
		r = str(uuid.uuid4())
		if r not in usednames:
			return r

def rotateleft(w, h, colors):
	if (w, h) == (1, 1):
		return colors[1], colors[2], colors[3], colors[0]

def rotateright(w, h, colors):
	if (w, h) == (1, 1):
		return colors[3], colors[0], colors[1], colors[2]

def rotate(w, h, colors, dA):
	if dA == 1:
		return rotateright(w, h, colors)

def randomcolors(w, h):
	if (w, h) == (1, 1):
		rs = (0, 0, 0, 1), (0, 0, 1, 1), (0, 1, 0, 1), (0, 1, 1, 1)
	r = random.choice(rs)
	for _ in range(random.choice(range(4))):
		r = rotateright(w, h, r)
	return r

def screenshotname():
	return data.filepath(datetime.datetime.now().strftime("screenshot-%Y%m%d%H%M%S.png"))


