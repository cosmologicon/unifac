var dialogue = {
	intro: [
		"Once upon a time, God created the Heavens and the Earth.",
		"And God was like, \"Yeah that's pretty good.\"",
		"God constructed a garden in the East and populated it with creatures in His own image.",
		"And God was like, \"Yeah that's pretty good.\"",
	],
	0: [
		"g What do you think of My Creation?",
		"d Yes yes it's perfect. A bit TOO perfect if you ask me.",
		"g Well what do you recommend?",
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


