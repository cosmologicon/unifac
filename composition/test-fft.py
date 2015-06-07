from __future__ import division
import wave, numpy, os, math
tau = 2 * math.pi

#w = wave.open("/home/christopher/Desktop/piano-studio-octave1.wav")
w = wave.open("/home/christopher/Desktop/guitar-classical-E-octave1.wav")

n = w.getnframes()
frate = w.getframerate()
data = w.readframes(-1)
data = [ord(data[2*i]) + ord(data[2*i+1]) * 256 for i in range(n)]
data = [(x if x < 32768 else x - 65536) / 32768 for x in data]

if False:
	ts = [i / frate for i in range(n)]
	freq = 100
	omega = tau * freq
	data = [math.sin(omega * t) for t in ts]

# output the FFT
if False:
	ft0 = map(abs, numpy.fft.fft(data))
	for i in range(5000):
		freq = i * frate / n
		print freq, ft0[i]
	exit()
	

if False:
	ft0 = map(abs, numpy.fft.fft(data))
	# Identify the fundamental frequency
	k = 40
	for i in range(5000):
		if not k < i < n - k:
			continue
		window = ft0[i-k:i+k+1]
		val = ft0[i]
		if val != max(window):
			continue
		if val < 2 * sorted(window)[k]:
			continue
		freq = i * frate / n
		dnote = math.log(freq / 440) / (math.log(2) / 12)
		print i, dnote, freq, val
	exit()

freq0 = 440 * 2 ** (-17/12)

wsize = 4000
dw = 500
w0 = 0

if True:
	# python test-fft.py > temp.txt
	# plot "temp.txt" using 1:2 with lines, "temp.txt" using 1:3 with lines, "temp.txt" using 1:4 with lines, "temp.txt" using 1:5 with lines, "temp.txt" using 1:6 with lines, "temp.txt" using 1:7 with lines, "temp.txt" using 1:8 with lines, "temp.txt" using 1:9 with lines
	while w0 + wsize <= n:
		ft = [abs(x) for x in numpy.fft.fft(data[w0:w0+wsize])]
	#	ftsum = math.sqrt(sum(x**2 for x in ft))
	#	ft = [x/ftsum for x in ft]
		def power(freq):
			return ft[int(round(freq * wsize / frate))] / 500
		t0 = (w0 + wsize / 2) / frate
		print t0, " ".join(str(power(freq0 * k)) for k in range(1, 10))
		w0 += dw
	exit()

def power(freq, t):
	w0 = int(t * frate)
	ft = [abs(x) for x in numpy.fft.fft(data[w0:w0+wsize])]
	return ft[int(round(freq * wsize / frate))] / 500

ts = [0, 0.05, 0.1, 0.15, 0.2, 0.4, 0.6, 0.8, 0.9, 1, 1.1, 1.2, 1.4]
print "[%s]" % ", ".join(map(str, ts))
for i in range(1, 19):
	freq = freq0 * i
	pows = [round(power(freq, t*3.2), 3) for t in ts]
	print "	[%s]," % ", ".join(map(str, pows))



	

