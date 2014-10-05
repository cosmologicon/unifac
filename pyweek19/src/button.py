import pygame
import vista

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

def click(buttonname):
	print buttonname

