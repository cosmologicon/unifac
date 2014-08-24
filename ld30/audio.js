var audio = {
	init: function () {
		this.context = new webkitAudioContext()
		this.master = this.context.createGain()
		this.master.connect(this.context.destination)
		this.sines = {}
		this.spikes = {}


		var buffersize = 2 * this.context.sampleRate
		var nbuffer = this.context.createBuffer(1, buffersize, this.context.sampleRate)
		var output = nbuffer.getChannelData(0)
		for (var j = 0 ; j < buffersize ; ++j) output[j] = UFX.random(-1, 1)

		this.wind = [0, 0, 0, 0]
		for (var j = 0 ; j < this.wind.length ; ++j) {
			var wind = this.wind[j] = {
				source: this.context.createBufferSource(),
				bandpass: this.context.createBiquadFilter(),
				gain: this.context.createGain(),
			}
			wind.source.buffer = nbuffer
			wind.source.loop = true
			wind.source.start(0)
			wind.bandpass.type = "lowpass"
			wind.source.connect(wind.bandpass)
			wind.bandpass.connect(wind.gain)
			wind.gain.connect(this.master)
			wind.gain.gain.value = 0.75
			wind.bandpass.frequency.value = 60
		}
		this.nextwindupdate = 1
	},
	think: function (dt) {
		this.t = this.context.currentTime
		while (this.t > this.nextwindupdate) {
			this.nextwindupdate += 1
			if (this.t > this.nextwindupdate) continue
			var j = this.nextwindupdate % this.wind.length
			this.wind[j].gain.gain.linearRampToValueAtTime(UFX.random(0.5, 1), this.t + this.wind.length)
			this.wind[j].bandpass.frequency.linearRampToValueAtTime(UFX.random(40, 80), this.t + this.wind.length)
		}
	},
	getsine: function (freq) {
		if (!this.sines[freq]) {
			this.sines[freq] = {
				source: this.context.createOscillator(),
				gain: this.context.createGain(),
			}
			this.sines[freq].source.type = "sine"
			this.sines[freq].source.connect(this.sines[freq].gain)
			this.sines[freq].gain.connect(this.master)
			this.sines[freq].source.start(0)
			this.sines[freq].source.frequency.setValueAtTime(freq, this.t)
		}
		return this.sines[freq]
	},
	getspike: function (freq) {
		if (!this.spikes[freq]) {
			this.spikes[freq] = {
				sine: this.context.createOscillator(),
				tri: this.context.createOscillator(),
				sgain: this.context.createGain(),
				tgain: this.context.createGain(),
			}
			this.spikes[freq].sine.type = "sine"
			this.spikes[freq].sine.connect(this.spikes[freq].sgain)
			this.spikes[freq].tri.type = "sawtooth"
			this.spikes[freq].tri.connect(this.spikes[freq].tgain)
			this.spikes[freq].sgain.connect(this.master)
			this.spikes[freq].tgain.connect(this.master)
			this.spikes[freq].sine.start(0)
			this.spikes[freq].sine.frequency.setValueAtTime(2*freq, this.t)
			this.spikes[freq].tri.start(0)
			this.spikes[freq].tri.frequency.setValueAtTime(freq, this.t)
		}
		return this.spikes[freq]
	},
	playsine: function (freq, duration) {
		freq = freq || 220
		duration = duration || 1
		var s = this.getsine(freq)
		s.gain.gain.setValueAtTime(1, this.t)
		s.gain.gain.linearRampToValueAtTime(0, this.t + duration)
	},
	playspike: function (freq, duration) {
		freq = freq || 220
		duration = duration || 1
		var s = this.getspike(freq)
		s.sgain.gain.setValueAtTime(0.5, this.t)
		s.sgain.gain.linearRampToValueAtTime(0, this.t + duration)
		s.tgain.gain.setValueAtTime(0, this.t)
		s.tgain.gain.linearRampToValueAtTime(0.1, this.t + duration*2/3)
		s.tgain.gain.linearRampToValueAtTime(0, this.t + duration)
	},
}

