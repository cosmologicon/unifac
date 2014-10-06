import pygame
import settings

played = set()

def pause():
	pass

def resume():
	pass

def think(dt):
	pass

def draw():
	pass

def playfirst(dname):
	if dname in played:
		return
	played.add(dname)
	print "playing %s" % dname
	pass

def clear(dname):
	pass

