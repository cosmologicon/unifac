import pygame
import vista, state

class Button(object):
	font = None
	def __init__(self, text, rect):
		self.text = text
		self.rect = pygame.Rect(rect)
		if Button.font is None:
			Button.font = pygame.font.Font(None, 22)
		self.img = pygame.Surface(self.rect.size).convert_alpha()
		self.img.fill((0,0,255,100))
		t = self.font.render(text, True, (255, 255, 255))
		self.img.blit(t, t.get_rect(center = self.img.get_rect().center))
	
	def within(self, screenpos):
		return self.rect.collidepoint(screenpos)

	def click(self):
		click(self.text)

	def draw(self):
		vista.screen.blit(self.img, self.rect)

class ModuleButton(Button):
	def __init__(self, *args, **kwargs):
		Button.__init__(self, *args, **kwargs)
		self.img1 = self.img
		self.img0 = self.img1.copy()
		mask = self.img1.copy()
		mask.fill((0,0,0,200))
		self.img0.blit(mask, (0, 0))

	def think(self, dt):
		self.img = self.img1 if state.state.active[self.text] else self.img0

def click(buttonname):
	if state.state.handlebutton(buttonname):
		return
	print("unhandled button: %s" % buttonname)

