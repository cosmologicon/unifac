var dialogue = {
	intro: [
		"Once upon a time, God created the Heavens and the Earth.",
		"And God was like, \"Yeah that's pretty good.\"",
		"God constructed a garden and populated it with creatures in His own image.",
		"And God was like, \"Yeah that's pretty good.\"",
		"But the creatures knew nothing of Good and Evil, and so they weren't any fun.",
		"And lo the Lord God got bored, and decided to find out how to make things more interesting.",
		"Fortunately, He just happened to know an expert.",
	],
	0: [
		"g What do you think of My Creation? Is it not perfect?",
		"d Yes yes yes. A bit TOO perfect if you ask me.",
		"g Well that's why you're here. Where shall We begin?",
		"d Let's add some sin to the equation.",
		"i Select a sin from the menu and click on a creature to apply it.",
		"t Select a sin from the menu and tap on a creature to apply it.",
	],
	1: [
		"g Well, you've officially invented disobedience, the first sin, and introduced the world to death.",
		"d I told You this would be fun. What's next? Greed? Consumption? Ego?",
		"d Nothing says good old-fashioned self-destruction like the sins of excess.",
		"i Scroll using the arrow keys or WASD or right-click",
		"t Scroll by dragging the screen",
	],
	2: [
		"g I think I'm getting the hang of this. What about some Wrath?",
		"d Not really my style, but I suppose no list of sins would be complete without it.",
		"d You want Wrath? You've got it.",
		"i You can zoom in and out with your mouse wheel.",
		"t You can zoom by pinching.",
	],
	4: [
		"g There was a time when if you wanted someone dead, you would just smite them.",
		"d How inelegant. Far more poetic to provide them with the tools of their own destruction.",
		"d Where's Your sense of style?",
		"g Well excuse Me for being practical.",
		"i You can use the number keys to select sins from the menu.",
	],
	6: [
		"g You've had your fun. It's time for you to stop toying with these mortals.",
		"d What?! But we haven't even gotten to Lust!",
		"g Begone!",
		"d Noooooooooooo......",
		"g Heh heh heh....",
		"g My turn.",
	],
	666: [
		"g I think you should know, I've decided to allow sin to continue in the world.",
		"d Having that much fun with it, eh? I knew You'd come around.",
		"g Perhaps a little. But more than that, I've never seen these creatures so satisfied.",
		"g It's almost as if they thrive off misery.",
		"g I'm also shutting down the Garden. These people are just not ready for Paradise.",
		"d What fools these mortals be.",
		"i Thanks for playing.",
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


