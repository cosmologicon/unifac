import dialog, state

class Quest(object):
	def complete(self):
		state.state.quests.remove(self)
	def home(self):
		return state.state.mother.within((state.state.you.x, state.state.you.y))
	def addquest(self, quest):
		state.state.quests.append(quest)

# Get to the mothership
class StartQuest(Quest):
	def think(self, dt):
		dialog.playfirst("cometomother")
		if self.home():
			dialog.clear("cometomother")
			dialog.playfirst("hookupweapon")
			self.complete()



