
train = {
	0: [
		"activetile@Welcome recruit, I'm Captain Nayrano. Emtar technology works a bit differently from ours, so here's a crash course. A tile becomes active if all of its contacts are touching contacts of the opposite color.",
		"Left-click on a tile to rotate it left. You can also right-click and middle-click. For keyboard controls, see README.txt.",
		"resource@Start by activating some 1x1 resource tiles. Each one will get you one Credit. Get 5 Credits and I'll give you your next assignment.",
	],
	1: [
		"Not bad. Now let's unlock some nodes. Nodes are any tile larger than 1x1. Larger nodes are harder to unlock, so I recommend starting with a 2x2 node. To unlock a node, you need to activate it and keep it activated for a certain amount of time.",
		"This station is infested with space mold that's attracted to unlocking nodes. It'll rotate the tiles around the node, and you'll have to rotate them back to fix it. Remember to keep the large tile activated!",
		"You'll learn some defensive measures later, but for now, just fix the damage that the mold causes until the node unlocks.",
		"Once you have a node activated, click on it to begin the unlocking procedure. I recommend picking the Group option. Other players can help you, but only the player who first selected the node will get the reward.",
	],
	2: [
		"Now that you have some experience points, you can unlock items, which can be used on 1x1 tiles. The items will help you unlock bigger nodes.",
		"Most of the items can be placed on tiles. You've probably seen some placed by other recruits. For these items you MUST remember that they're only effective when the tile is activated. If the tile becomes deactivated while unlocking a node, try to reactivate it right away.",
		"For keyboard controls, see README.txt.",
	],
	"joinboss": [
		"Ah, you decided to come after all. You wish to join me? No? Very well, but you can't stop progress. Soon I shall hold the power of the gods!",
		"What? You think you can stop me by unlocking the central reactor before my preparations are complete? I'd like to see you try!",
	],
	"last": [
		"This is an urgent request from Captain Nayrano at the deep space Emtar station.",
		"Several of the recruits working on the Emtar tech are showing increasingly erratic and paranoid behavior. I believe this may be linked to the psychological effects mentioned in the recordings found here at the station. I recommend we shut down the project immediately pending further investigation.",
		"I've already asked all workers to report back to headquarters to be taken off duty. I won't expose them to Emtar tech any further. Please send a psych eval unit and increased security as soon as... stand by. One of them is here.",
		"Recruit, you've been doing great work. I'm taking you off duty for a few days. Get some rest.",
		"...",
		"""What? I didn't say anything about "power of the gods". Recruit, can you understand me?""",
		"...",
		"You're suffering from hallucinations. It's extremely important that you listen to me. You need to get away from the Emtar tech.",
		"...",
		"Command? It looks like the recruit is trying to unlock the central reactor. This could be bad. I need to deal with this now. Please hurry!",
	],
}

cutscene = {
	0: [
		"Hear now, stranger, the last and only message of the Emtar.",
		"Our success and ultimate downfall were due to our unique technology. It harnessed the two fundamental opposing components of the universe: the Ameloz wave and the Zolema particle. Many other species have tried to harness them as did we. All others failed. Thus we became the most powerful civilization in the galaxy.",
		"We became respected and feared. There was but one race we ever felt a kinship toward, the Galugen Blea. As a token to them, our only friends, we gave them our technology and taught them to harness the Ameloz and the Zolema. This proved to be a terrible mistake.",
	],
	1: [
		"We gave to the Galugen Blea what so many others had sought so jealously: our knowledge. We came to learn, however, how alone we really are. Most sentient beings possess an innate sense of the disharmony of opposites, a sense only we Emtar lack.",
		"We alone can grasp technology that relies on harmonious opposites. For all others, exposure to our devices takes a psychological toll. Hallucination and paranoia take hold, and the ability to tell ally from enemy is lost. And so it was with the Galugen Blea: our only friend became our nemesis.",
		"They attacked us savagely. What came to be known as the War Between the Stars raged for centuries. In the end, we survived, but it was no victory.",
		"They were our only friends, and we killed them twice. Once by accident, when we destroyed their minds, and once in defense, when we destroyed their bodies.",
	],
	2: [
		"We know now that we were never meant to exist. Our very way of thinking is destructive. We have removed every trace of our history and culture from the galaxy. All that remains is this station. As atonement for our crimes, and to see that we never again turn friends against one another, we have chosen our fate.",
		"We will transform ourselves into weak, unthinking, slime-like creatures, living forever on this station, the last remnant of our once great civilization. Although no longer able to reason or communicate, we will have a programmed desire to protect people from the technology here.",
		"Our last will is simply this: depart this place, and do not pursue the technology you have found here. Forget you ever heard of the Emtar, of the Ameloz and the Zolema, of harmonious opposites. Leave and survive."
	],
}


unlockboss = [
	"Do you see now the potential of this technology? Yes it can destroy battle fleets, but it's so much more: it can destroy minds. By exposing our enemies to this technology, we can make them turn against one another, while seeing us as their trusted friends.",
	"Unfortunately, brainwashing violates the Algol Convention. Those pompous generals would never authorize it. I'll have to take matters into my own hands.",
	"I'm afraid you now know too much, recruit. I tried to warn you but you couldn't stop asking questions. When you're ready to settle this once and for all, meet me back at headquarters, by the central reactor.",
	"The code to access the final boss server is %s. The option to join the final boss server has been added to your main menu. If you want a friend who has not unlocked the final boss to join you, see README.txt to see how to share the code with them.",
]


dnames = {
	"none": "Deselect",
	"shuffle": "Recolor contacts",
	"wall": "Barrier",
	"1laser0": "Laser",
	"2laser0": "Bidirectional Laser",
	"4laser": "Quad Laser",
	"1blaster0": "Blaster",
	"mine": "Mine",
	"adjmine": "Shrapnel Mine",
	"shield": "Shield",
	"1dshield0": "Directional shield",
}

descriptions = {
	"none": "",
	"shuffle": "Color the contacts on a given 1x1 tile to match adjacent tiles.",
	"wall": "Enemies passing over the barrier will be slowed down. When the enemy gets through, the barrier remains but is deactivated.",
	"1laser0": "Rapid fire but weak. Fires up to a range of 4 tiles in a single direction. Once it's placed, it turns with the tile it's on. You can place a laser facing a different direction by repeatedly clicking on the icon on the right.",
	"2laser0": "Rapid fire but weak. Fires up to a range of 2 tiles in two opposite directions. Once it's placed, it turns with the tile it's on. You can place a bidirectional laser facing the other direction by clicking on the icon on the right.",
	"4laser": "Rapid fire but weak. Fires up to a range of 1 tile in any of 4 directions.",
	"1blaster0": "Slow fire but strong. Fires up to a range of 3 tiles a single direction. Once it's placed, it turns with the tile it's on. You can place a blaster facing a different direction by repeatedly clicking on the icon on the right.",
	"mine": "Takes out an enemy that lands on it. The enemy and the mine itself are destroyed, but the tile does not become deactivated.",
	"adjmine": "Takes out an enemy that lands on it, as well as any enemies that land on the 4 adjacent tiles.",
	"shield": "Protects the 4 adjacent tiles from being hurt by enemies. Shields cannot be protected with other shields.",
	"1dshield0": "Protects 3 tiles in a single direction from being hurt by enemies. Shields cannot be protected with other shields.",
}


