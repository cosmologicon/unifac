var dialogue = {
	intro: [
		"Once upon a time, God created the Heavens and the Earth.",
		"And God was like, \"Yeah that's pretty good.\"",
		"God constructed a garden in the East and populated it with creatures in His own image.",
		"And God was like, \"Yeah that's pretty good.\"",
		"But the creatures knew nothing of Good and Evil, and so they weren't very interesting.",
		"And lo the Lord God got bored, and decided to make things more interesting.",
		"Fortunately, He just happened to know someone who was up to the task.",
	],
	0: [
		"g What do you think of My Creation? Is it not perfect?",
		"d Yes yes yes. A bit TOO perfect if you ask me.",
		"g Well that's why you're here. Where shall We begin?",
	],

	9: [
		"g Okay you've had your fun. I think it's time to stop toying with these mortals.",
		"d What?! No! I haven't even shown you Lust!",
		"g Begone!",
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


