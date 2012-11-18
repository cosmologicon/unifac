// cat ../../lepidopterist/data/dialogue.txt | sed 's ^ \t[ ;s- -, "-;s- -", "-;s $ "], ' > dialogue.js

var dialogue = [
	[1, "m", "Do you know what it's like to know your purpose in life?"],
	[1, "m", "To know that you were born for one thing and one thing only?"],
	[1, "m", "I know my purpose. My name is Mortimer, and I..."],
	[1, "m", "...am a butterfly collector."],

	[2, "e", "My goodness, young man! That was impressive butterfly collecting!"],
	[2, "e", "You remind me of myself as a lad."],
	[2, "m", "You were watching me? Who are you?"],
	[2, "e", "Maj. Gen. Elmer Wrightscoptch (Ret.), at your service."],
	[2, "e", "I am the President of the Royal Lepidopteral Society."],
	[2, "e", "I need someone for an extremely important and dangerous butterfly-collecting quest."],
	[2, "e", "What say you?"],
	[2, "m", "Yes at last my dreams have come true!"],
	[2, "e", "Brilliant! You can begin by training at our dojo. Come with me."],
	[2, "s", "Greetings, Mortimer. I am the master of this dojo."],
	[2, "s", "Let's see what you can do."],

	[3, "s", "Well done. Excellent form."],
	[3, "s", "I declare you ready for field work."],
	[3, "e", "I can now reveal to you the nature of your quest."],
	[3, "e", "You're embarking on a journey to find a map to the greatest treasure in all of lepidoptery..."],
	[3, "e", "The Lost Butterfly Garden of Verdania!"],
	[3, "m", "Sounds brilliant! What is it?"],
	[3, "e", "An enchanted realm where every type of butterfly roams freely, ripe for the collecting!"],
	[3, "e", "It's been lost for ages, but with the map, we can revisit it!"],
	[3, "e", "We have reason to believe that half of the map is located..."],
	[3, "e", "in the Bucolic Meadow of Doom, a few miles from here in Northamptonford-upon-Lynshire."],
	[3, "e", "Your mission is to go there, and retrieve the piece of the map."],
	[3, "e", "And collect some butterflies while you're at it!"],
	[3, "m", "I won't let you down!"],

	[4, "m", "I'm back from the Bucolic Meadow of Doom!"],
	[4, "m", "I got that half of the legendary map!"],
	[4, "s", "Mortimer, thank goodness you've returned! Terrible news!"],
	[4, "s", "President Wrightscoptch has been kidnapped by a rival organisation..."],
	[4, "s", "The Royal Society of Lepidopterists!"],
	[4, "m", "Wait... isn't that us?"],
	[4, "s", "No you fool! We're the Royal Lepidopteral Society!"],
	[4, "s", "There rages an ancient rivalry between us and the Royal Society of Lepidopterists."],
	[4, "s", "Born of a dispute over who invented the greatest advance in butterfly collecting ever."],
	[4, "m", "What advance?"],
	[4, "s", "The idea of sticking butterflies onto poster board with a pin!"],
	[4, "m", "That's it?"],
	[4, "s", "That's a big deal!"],
	[4, "s", "Before that, everyone just threw their butterflies into a desk drawer."],
	[4, "s", "It was a huge mess."],
	[4, "s", "First they claim credit for that, and now they kidnap our president!"],
	[4, "m", "I'm going after him! Where can I find them?"],
	[4, "s", "Their palace is on the other side of a field you'll have to cross."],
	[4, "m", "A field, you say? Might this field have any butterflies on it?"],
	[4, "s", "Probably. But you don't have to catch the butterflies just to cross the..."],
	[4, "m", "I'll do it! And I'll catch a bunch of butterflies on my way!"],
	[4, "s", "Sure, whatever."],

	[5, "m", "I'm Mortimer, from the Royal Lepidopteral Society. Unhand our president!"],
	[5, "v", "Certainly... on one condition."],
	[5, "v", "Give us your half of the map to the Lost Butterfly Garden of Verdania!"],
	[5, "e", "Don't do it Mortimer! They have the other half of the map!"],
	[5, "v", "What do you care anyway?"],
	[5, "v", "According to legend, only the Chosen One may enter the Lost Garden."],
	[5, "m", "The Chosen One?"],
	[5, "v", "He who would unite the clans of lepidoptery,"],
	[5, "v", "and usher in a golden age of butterfly collecting!"],
	[5, "m", "Oh, that Chosen One."],
	[5, "e", "Mortimer! Get out of here! Save yourself!"],
	[5, "m", "Nothing doing. I'm here to rescue you!"],
	[5, "v", "And how do you plan to do that?"],
	[5, "m", "The only way I know how to do anything...."],
	[5, "m", "by catching butterflies!"],

	[6, "v", "My word.... Young man, that was some fine netmanship."],
	[6, "v", "Perhaps we resorted to drastic measures prematurely."],
	[6, "v", "Very well. We will release Elmer."],
	[6, "e", "You know, Victoria, we needn't feud so."],
	[6, "e", "You have half the map, and so do we."],
	[6, "e", "Working together, we could at last locate the Lost Garden."],
	[6, "v", "An intriguing proposition.... Yes, we have a deal."],
	[6, "v", "Mortimer, thank you dearly for bringing us back together after so long."],
	[6, "e", "I think I speak for both of us when I say,"],
	[6, "e", "Will you do us the honour of visiting the Lost Garden?"],
	[6, "m", "Of course I will! The honour is all mine!"],

	[7, "m", "What splendour! What beauty!"],
	[7, "m", "I could live my whole life here collecting and collecting!"],
	[7, "m", "What's that sound?"],
	[7, "m", "Why are all the butterflies flying away?!"],
	[7, "m", "Oh no, the cliff wall is collapsing!"],
	[7, "m", "I've got to get out of here!"],
	[7, "e", "Mortimer! You've returned! What did you see in the Lost Garden?"],
	[7, "m", "Well.... it was nice while it lasted."],
	[7, "e", ". . ."],
	[7, "m", "I'm afraid it's under 100 feet of rock now."],
	[7, "m", "It was probably all that jumping around I was doing. Terribly sorry."],
	[7, "e", "You... imbecile!"],
	[7, "e", "I hereby banish you for life from the Royal Lepidopteral Society!"],
	[7, "e", "Get out!"],
	[7, "v", "And don't try to join the Royal Society of Lepidopterists, either."],
	[7, "m", "Oh well. I was getting sick of butterflies anyway."],
	[7, "m", "I think I'll take up collecting seashells. Now there's a jolly good hobby!"],
]

function getdialogue(level) {
	var lines = []
	dialogue.forEach(function (line) {
		if (line[0] == level) {
			lines.push([line[1], line[2]])
		}
	})
	return lines
}

// cat ../../lepidopterist/data/tips.txt | sed 's ^ \t[ ;s- -, -;s- Tip: -, "-;s $ "], '

var tips = [
	[1, 1, "Control using the arrow keys and space bar"],
	[1, 2, "Keys used to perform actions are shown in the corner. Up, left, right and space bar."],
	[1, 2, "The bars in the corner tell you how many times you can perform an action."],
	[1, 2, "If you have enough bars, you can double jump. Just jump when you're already in the air."],
	[1, 8, "Your game is automatically saved whenever you finish a level."],
	[1, 8, "The more different species you collect, the more actions you learn."],
	[2, 8, "Sometimes it's a good idea to revisit stages, to get more money or catch species you missed."],
	[2, 8, "If you stay in the air long enough, your bars will refill. They also refill when you touch the ground."],
	[2, 8, "Bars on the right refill more quickly than bars on the left. Keep the levels high to maximise efficiency."],
	[2, 8, "Actions won't work if you hit too many keys at once. Take it easy. Try to perform one action per second."],
	[2, 4, "Some actions require you to press two keys at the same time."],
	[2, 4, "To perform a combo, perform more than one action in a row without touching the ground."],
	[3, 4, "You get bonuses for setting combo and height records. They don't add to your level score, but you can spend them to upgrade abilities."],
	[3, 8, "Any action involving the space bar will catch butterflies."],
	[3, 8, "Press Tab to hide the ability names in the corner."],
	[3, 8, "If the time expires while you're still in the air, you can continue until you touch the ground."],
]

// Try to pick a tip that hasn't been seen yet
function gettip() {
	// tips that are valid for your completion level
	var vtips = tips.filter(function (tip) { return tip[0] <= record.unlocked && record.unlocked <= tip[1] })
	// choose an unseen tip if possible
	for (var j = 0 ; j < vtips.length ; ++j) {
		var tip = vtips[j][2]
		if (!record.seentips[tip]) {
			record.seentips[tip] = 1
			return tip
		}
	}
	// All valid tips have been seen - show an old tip
	return UFX.random.choice(vtips)
}

function wordwrap(text, twidth, con) {
	twidth = twidth || settings.sx
	con = con || context
	var texts = [text], n = 0, s
	while (context.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
		var t = texts[n], a = t.lastIndexOf(" ")
		while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
		texts[n++] = t.substr(0, a)
		texts.push(t.substr(a+1))
	}
	return texts
}


