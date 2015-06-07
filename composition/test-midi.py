from __future__ import division
from collections import defaultdict
import midi  # https://github.com/vishnubob/python-midi

pattern = midi.read_midifile("/home/christopher/Downloads/greenhill.mid")
pattern.make_ticks_abs()
resolution = pattern.resolution
basenames = "C C# D D# E F F# G G# A A# B".split()
notenames = { n: basenames[n%12] + str(n//12-1) for n in range(12, 96) }
notes = []
for jtrack, track in enumerate(pattern):
	actives = {}
	for event in track:
		isonevent = isinstance(event, midi.events.NoteOnEvent)
		isoffevent = isinstance(event, midi.events.NoteOffEvent)
		if isonevent and event.velocity:
			actives[event.pitch] = event.tick
		elif isonevent or isoffevent:
			t = actives[event.pitch] / resolution
			measure = int(t / 4)
			beat = t % 4
			duration = (event.tick - actives[event.pitch]) / resolution
			notes.append([jtrack, event.pitch, measure, beat, duration])
			del actives[event.pitch]

# notes.sort(key = lambda note: (note[1], note[0]))
chordnotes = defaultdict(list)
for jtrack, pitch, measure, beat, duration in notes:
	if jtrack == 2 and beat == 0 and duration == 4:
		chordnotes[measure].append(pitch)

for pow2 in (2, 1, 0.5, 0.25):
	relatives = []
	for jtrack, pitch, measure, beat, duration in notes:
		if measure > 24:
			continue
		if jtrack != 1:
			continue
		if beat * pow2 % 1 != 0:
			continue
		relative = (pitch - max(chordnotes[measure])) % 12
		relatives.append(relative)
	print [relatives.count(x) for x in range(12)]

