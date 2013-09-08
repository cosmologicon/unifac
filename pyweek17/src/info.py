
creds = """Written by Christopher Night
for PyWeek 17

Music by Creative Sound
http://www.creative-sound.org

See README.txt for font and sound effects
sources and license information.
"""

pnames = "Wonderflonium Bombastium Rodinium".split()
pcolors = (255, 255, 255), (128, 128, 255), (255, 128, 128)
mnames = "Ycleptons Octirons Monopoles".split()
mcolors = (255, 255, 0), (255, 128, 0), (255, 0, 255)

levelname = [
	"UMBRIEL",
	"TETHYS",
	"GANYMEDE",
	"EARTH'S MOON",
]

dialogue = [
["""
Don't think of it as exile. We no longer
belong on Earth. The outer moons are our home
now. Still, I can't help but think back to how
it all happened...
""",
"""
The first human mental upgrade was almost three
years ago. The next upgrade followed soon after,
and before long the world was changing every day.
""",
"""
Three years ago, there were all of 10,000 people
living on Mars. Now there are over two billion.
"""],
["""
Of course, less than one percent of us were
unable to get the upgrade. Something about unique
brain configuration. I don't know if I believe
that.
""",
"""
At any rate, those few of us remained human
while everyone around us turned into...
something else.
""",
"""
And not just the people, the entire world.
We very soon came to find ourselves in the
middle of a vast civilization we could not
comprehend or enjoy.
"""],
["""
Did they care about us? Feel bad about us?
Who knows, those are things that humans do.
But they knew we were frustrated, so they
gave us a choice.
""",
"""
Continue living in this world beyond our
understanding, like animals or infants. Or take
to the unused moons, and build worlds we could
call our own.
"""],
["""
Almost all of us chose to leave. So here we
are, building microcosms of the world that was
taken from us.
""",
"""
We, the last humans, claim the moons as our
own. Which is why it's time for us to return
to the moon of the world where we once lived.
""",
"""
We may have given up the Earth - what choice
did we have? But the moons are ours! And if we
won't be given this one, we'll take it!
"""
],


]


"""Don't think of it as exile. After all, we technically chose to come out here, if you can call that a choice. We no longer belong on Earth - the outer moons are our home now. Still, I can't help but think back to how it all happened...."""
"""It's only been a few months since the first upgrade, but it feels like a lifetime. That's sort of the point, I guess. Everything changed. Once the human brain was first modified to be smarter, each upgrade thereafter came faster and faster."""
"""Of course, less than one percent of us were unable to get the upgrade. Something about the way our brain functions. They said our mental pathways were too unique, but who knows if that was just a nice way of putting it. At any rate, we were left behind as the rest of the human race fast became... something else."""
"""After a few weeks, there was an unbridgeable gap between us, the last generation of humans, and them. Infrastructure was springing up around us at an alarming rate. A few months ago, there were all of 10,000 people living on Mars. Today there are over 2 billion."""
"""After they made Mars inhabitable, they did the same to Venus, Europa, and Titan. They've already sent a few spacecraft off to nearby stars. We found ourselves in the middle of an advanced society that was not built for us, that we could not enjoy."""
"""Did they care about us? Feel bad for us? Who knows, those are things humans do. But they knew we were frustrated. They gave us a choice. Continue living in this world beyond our comprehension, like infants or animals. Or take to the unused moons, and build worlds we could call our own. We almost all chose the latter. So here we are, trying to do just that."""



"""
There's something we must tell you. A secret was kept from you. A decision made before the first upgrade. It's time you knew.
You were told that your brain was incompatible with the upgrade. This was a lie. You and several million other humans were chosen at random to serve an important purpopse.
You see, the upgrade was not without risk. Yes, we knew it was physically harmless to the brain, but what would happen to the world? Psychohistory was very primitive at that point. We could not predict the course of events.
We needed a safety option, a last resort if the society we created were to collapse into utter ruin. That last resort was you.

A year ago we asked you to make a difficult choice. Now you must make another.
You can continue to live as you are, in a world of your own making. We will give you the Moon to do with as you please, for the rest of your natural life. You can even have Earth when we leave this solar system in 29 months.
With modern medicine you will live for another 318 years, at which point your brain will deteriorate beyond repair.
Or, you can accept the upgrade and join us, living forever in a vast society as we reach out to the stars.
The choice is yours, last human.
"""


help = {

"controls":
"""
Left click + drag or arrow keys to pan.
Right click + drag or WASD to turn camera.
Hold Shift or press Caps Lock
to reverse this behavior.

Scroll wheel or Ins/Del to zoom
""",

"more controls":
"""
Esc: fast quit
F12: take screenshot
""",

"power":
"""
Each structure requires a constant stream
of either Wonderflonium, Bombastium, or
Rodinium. Make sure you place each structure
near to a structure of the same type, or else
it will not function. Your command center
provides all three kinds of connection.
""",

"satellites":
"""
Wonderflonium, Bombastium, and Rodinium can
only be harvested from orbit. Make sure you
have enough satellites of the correct
type to provide for your power needs.
""",

"satcon":
"""
Satellite Control
You can control only a limited number of
satellites at once. Launchpads and Satellite
Control Dishes will increase this number. If
your control amount falls below the number of
active satellites, their orbits can destabilize.
""",

}


missionnames = [
	"\nUmbriel\nMoon of Uranus",
	"\nTethys\nMoon of Saturn",
	"\nGanymede\nMoon of Jupiter",
	"Showdown at\nEarth's Moon\n ",
]

missionhelp = [
	"""Umbriel: Moon of Uranus\nMission: build 3 Satcon Dishes""",
	"""Tethys: Moon of Saturn\nMission: remove all debris\n\nExtractors operating at double capacity.""",
	"""Ganymede: Moon of Jupiter\nMission: activate the artifact for 30 seconds.\nArtifact requires all three hookups to activate,\nand uses a large amount of power.""",
	"""Earth's Moon\nMission: Keep the artifact alive and active for 30 seconds.\nUnlimited materials available.\nSatellites operating at double capacity.\nThis is the final mission. See README.txt\nfor the final cutscene I left out.""",

]

moonlights = [
	[(0.2, 0.24, 0.24), (0.7, 0.8, 0.8)],
	[(0.2, 0.16, 0.2), (0.5, 0.65, 0.65)],
	[(0.2, 0.16, 0.2), (0.5, 0.65, 0.65)],
	[(0.2, 0.2, 0.2), (0.9, 0.9, 0.9)],
	
]

Rs = [12, 16, 18, 20]

mmults = {
	0: 1,
	1: 2,
	2: 2,
	3: 4,
	None: 1,
}
pmults = {
	0: 1,
	1: 1,
	2: 1,
	3: 2,
	None: 1,
}

m0s = [
	[50, 0, 0],
	[60, 10, 0],
	[60, 40, 0],
#	[200, 200, 200],
	[10000000, 1000000, 1000000],
]

music = {
	0: "013scifi",
	1: "011scifi",
	2: "014action",
	3: "013scifi",
	"menu": "020action",
}

locked = [
	"buildwrelay buildwbasin buildwbooster buildmedic buildbrelay buildbbasin buildbbooster buildr buildrextractor buildcleaner buildrrelay buildrbasin buildrbooster launchrsat".split(),
	"buildwbasin buildwbooster buildmedic buildbbasin buildbboster buildrbasin buildrbooster".split(),
	"buildwbooster buildmedic buildbboster buildrbooster".split(),
	"".split()
]







