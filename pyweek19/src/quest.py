import dialog, state, gamescene, buildscene, scene, starmap, bosses

class Quest(object):
	def complete(self):
		state.state.quests.remove(self)
	def home(self):
		return scene.top() is buildscene
	def addquest(self, quest):
		state.state.quests.append(quest)
	def addinterest(self, iname, pos = None):
		state.state.interests.add(iname)
		if pos is not None:
			obj = getattr(state.state, iname)
			obj.x, obj.y = pos
	def removeinterest(self, iname):
		state.state.interests.remove(iname)

# Get to the mothership
class IntroQuest(Quest):
	def __init__(self):
		dialog.play("cometomother")
		self.addinterest("mother")

		self.addinterest("supply", pos = starmap.ps["supply"])
		state.state.ships.append(state.state.supply)
		state.state.boss = bosses.Boss1(starmap.ps["supply"])
		state.state.ships.append(state.state.boss)

	def think(self, dt):
		if self.home():
			dialog.clear("cometomother")
			dialog.playfirst("hookupweapon")
		if not self.home() and "drill" in state.state.hookup:
			dialog.play("howtodrill")
			self.complete()

class Baron1Quest(Quest):
	def __init__(self):
		dialog.playfirst("meetthebaron")
		self.addinterest("baron", pos = starmap.ps["baron1"])
		state.state.ships.append(state.state.baron)
		self.lasttalk = 0
		
	def think(self, dt):
		if self.lasttalk:
			self.lasttalk = max(self.lasttalk - dt, 0)
		else:
			dx, dy = state.state.you.x - state.state.baron.x, state.state.you.y - state.state.baron.y
			if dx ** 2 + dy ** 2 < 2 ** 2:
				self.lasttalk = 10
				if state.state.bank < 100:
					dialog.play("wheresmymoney")
				else:
					state.state.bank -= 100
					state.state.baron.fadeable = True
					dialog.play("findthesupply")
					addquest(Boss1Quest)

class Boss1Quest(Quest):
	def __init__(self):
		self.addinterest("supply", pos = starmap.ps["supply"])
		state.state.ships.append(state.state.supply)
		self.boss = bosses.Boss1(starmap.ps["supply"])

	def think(self, dt):
		if not self.boss.hp:
			dialog.play("endact1")
			self.complete()




