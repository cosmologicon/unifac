import dialog, state, gamescene, buildscene, scene

class Quest(object):
	def complete(self):
		state.state.quests.remove(self)
	def home(self):
		return scene.top() is buildscene
	def addquest(self, quest):
		state.state.quests.append(quest)
	def addinterest(self, iname):
		state.state.interests.add(iname)
	def removeinterest(self, iname):
		state.state.interests.remove(iname)

# Get to the mothership
class StartQuest(Quest):
	def think(self, dt):
		dialog.playfirst("cometomother")
		self.addinterest("mother")
		if self.home():
			dialog.clear("cometomother")
			dialog.playfirst("hookupweapon")
		if not self.home() and "drill" in state.state.hookup:
			dialog.playfirst("howtodrill")
			self.complete()



