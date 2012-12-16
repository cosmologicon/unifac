var dialogue = {
	intro: [
		"Once upon a time, God created the Heavens and the Earth.",
		"And God was like, \"Yeah that's pretty good.\"",
		"God constructed a garden in the East and populated it with creatures in His own image.",
		"And God was like, \"Yeah that's pretty good.\"",
		"But the creatures knew nothing of Good and Evil, and so they weren't any fun.",
		"And lo the Lord God got bored, and decided to find out how to make things more interesting.",
		"Fortunately, He just happened to know an expert.",
	],
	0: [
		"g What do you think of My Creation? Is it not perfect?",
		"d Yes yes yes. A bit TOO perfect if you ask me.",
		"g Well that's why you're here. Where shall We begin?",
		"d How about we add some sin to the equation?",
		"i Select a sin from the menu and click on a creature to apply it.",
	],
	1: [
		"g Well, you killed them.",
		"d I told You this would be fun. What's next? Greed? Consumption? Ego?",
		"d Nothing says good old-fashioned self-destruction like the sins of excess.",
		"i Scroll using the arrow keys or WASD or right-click",
	],
	2: [
		"g I think I'm getting the hang of this. What about some Wrath?",
		"d Not really my style, but I suppose no list of sins would be complete without it.",
		"d You want Wrath? You've got it.",
		"i You can zoom in and out with your mouse wheel.",
	],
	4: [
		"g You know, there was a time when if you wanted someone dead, you just smote them.",
		"d How inelegant. Wouldn't You rather imbue them with sin and let them destroy themselves?",
		"d Where's Your sense of style?",
		"g Well excuse Me for being practical.",
	],

	6: [
		"g Okay you've had your fun. I think it's time for you to stop toying with these mortals.",
		"d What?! No! We haven't even gotten to Lust!",
		"g Begone!",
		"d Noooooooooooo......",
		"g Heh heh heh....",
		"g My turn.",
	],
}

function wordwrap(text, twidth, con) {
	con = con || context
	twidth = twidth || con.canvas.width
	var texts = [text], n = 0, s
	while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
		var t = texts[n], a = t.lastIndexOf(" ")
		while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
		texts[n++] = t.substr(0, a)
		texts.push(t.substr(a+1))
	}
	return texts
}


