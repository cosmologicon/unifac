UFX.scenes.play = {
	start: function () {
		state.init()
		this.mode = "play"
		this.buildoff = [0, 0]
		this.vplatform = new VirtualPlatform(0, 0, settings.psize)
		var stone = UFX.texture.stone({
			size: 512,
			scale: 16,
		})
		this.backdrop = document.createElement("canvas")
		this.backdrop.width = this.backdrop.height = 512
		UFX.draw(this.backdrop.getContext("2d"), "[ drawimage0", stone, "] fs rgba(0,0,0,0.7) f0")
		camera.focus = state.you
		camera.think(1)
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (this.mode == "play") {
			if (kstate.down.up && state.you.kjump < state.njump) {
				state.you.leap()
			}
			if (state.you.hanging && !kstate.pressed.up) {
				state.you.hanging = 0
			}
			if (state.you.parent && kstate.down.down) {
				state.you.drop()
			}
			state.you.hmove((kstate.pressed.right ? 1 : 0) - (kstate.pressed.left ? 1 : 0))
			if (kstate.down.space) {
				if (state.nearhouse(state.you)) {
					state.talk(state.nearhouse(state.you))
				} else if (state.canbuild) {
					this.mode = "build"
					this.vplatform.x = Math.floor(state.you.x) + this.buildoff[0]
					this.vplatform.y = Math.floor(state.you.y) + this.buildoff[1]
				}
			}
			if (state.canwarp && kstate.down.tab) {
				while (true) {
					var h = UFX.random.choice(Object.keys(HouseNames))
					if (!state.done["know" + h] || !state.done["rescue" + h]) continue
					state.lastlanding = state.houses[h].parent
					state.resetfall()
					break
				}
			}
			if (DEBUG && kstate.down.F4 && state.you.parent) {
				state.removeplatform(state.you.parent)
				state.you.drop()
			}
			if (DEBUG && kstate.down.F5) {
				this.vplatform.dx = settings.psize -= 1
			}
			if (DEBUG && kstate.down.F6) {
				this.vplatform.dx = settings.psize += 1
			}
			if (DEBUG && kstate.down.F7 && state.you.parent) {
				state.you.parent.ischeck = !state.you.parent.ischeck
			}
			if (DEBUG && kstate.down.F11) {
				state.dump()
			}
			if (DEBUG && kstate.down.F9) {
				state.sun = true
				state.canwarp = true
				state.canbuild = true
				for (h in HouseNames) state.done["know" + h] = true
				for (h in HouseNames) state.done["rescue" + h] = true
				state.njump = 3
				state.jhang = 3
			}
		} else if (this.mode == "build") {
			if (kstate.down.left) this.buildoff[0] -= 1
			if (kstate.down.right) this.buildoff[0] += 1
			if (kstate.down.up) this.buildoff[1] += 1
			if (kstate.down.down) this.buildoff[1] -= 1
			this.vplatform.x = Math.floor(state.you.x) + this.buildoff[0]
			this.vplatform.y = Math.floor(state.you.y) + this.buildoff[1]
			if (!kstate.pressed.space) {
				if (state.canplace(this.vplatform)) {
					var p = new Platform(this.vplatform.x, this.vplatform.y, this.vplatform.dx)
					state.platforms.push(p)
					state.newplatforms.push(p)
					state.sortplatforms()
					state.gp -= settings.pcost
				}
				this.mode = "play"
			}
		} else if (this.mode == "fly") {
			if (kstate.down.left) state.you.x -= 1
			if (kstate.down.right) state.you.x += 1
			if (kstate.down.up) state.you.y += 1
			if (kstate.down.down) state.you.y -= 1
			if (kstate.down.np4) state.you.x -= 5
			if (kstate.down.np6) state.you.x += 5
			if (kstate.down.np2) state.you.y -= 5
			if (kstate.down.np8) state.you.y += 5
		}

		if (DEBUG && kstate.down.F3) this.mode = this.mode == "fly" ? "play" : "fly"


		if (this.mode == "fly") {
			state.you.think(0)
			state.you.parent = null
		} else {
			state.you.think(dt)
			if (!state.you.parent && state.you.vy < 0) {
				state.forplatforms(state.you.y - 1, state.you.oldy + 1, function (platform) {
					if (platform.catches(state.you)) state.you.land(platform)
				})
			}
			if (state.you.y < state.lastlanding.y - settings.maxfall) {
				state.you.takedamage(1)
				state.resetfall()
			}
			var px = state.you.x, py = state.you.y + 0.3, pr = 0.2
			state.effects = state.effects.filter(function (e, j) {
				e.think(dt)
				return e.alive
			})
			state.splats = state.splats.filter(function (e, j) {
				e.think(dt)
				return e.alive
			})
			state.monsters = state.monsters.filter(function (m) {
				if (!m.alive) return false
				m.think(dt)
				if (m.hits(px, py, pr)) {
					if (!state.you.tmercy) {
						state.you.takedamage(1)
					}
				}
				return true
			})
		}

		if (this.mode == "build") this.vplatform.think(dt)
		camera.think(dt)
		
		state.checksectors()
		if (state.you.hp <= 0) UFX.scene.swap("death")
	},
	draw: function () {
		var x0 = -camera.x0*camera.z/2, y0 = camera.y0*camera.z/2
		UFX.draw("fs #600 f0 [ t", x0, y0)
		var i0 = Math.floor(-x0 / 512), i1 = 1 + Math.floor((-x0 + canvas.width) / 512)
		var j0 = Math.floor(-y0 / 512), j1 = 1 + Math.floor((-y0 + canvas.height) / 512)
		for (var i = i0 ; i < i1 ; ++i) {
			for (var j = j0 ; j < j1 ; ++j) {
				UFX.draw("drawimage", this.backdrop, 512*i, 512*j)
			}
		}
		UFX.draw("]")
		if (state.you.y > 140) {
			var alpha = Math.min(Math.max((state.you.y - 140) / 20, 0), 1)
			UFX.draw("fs rgba(220,220,255," + alpha + ") f0")
		}

		context.save()
		camera.transform()
		function draw(obj) {
			if (!camera.visible(obj.x, obj.y, obj.r || 0.5)) return
			context.save()
			obj.draw()
			context.restore()
		}
		state.forplatforms(camera.ymin, camera.ymax, draw)
		state.buildings.forEach(draw)
		state.monsters.forEach(draw)
		draw(state.you)
		if (this.mode == "build") {
			draw(this.vplatform)
		}
		state.effects.forEach(draw)
		state.splats.forEach(draw)
		context.restore()

		if (!state.sun) {
			var sx2 = canvas.width / 2, sy2 = canvas.height / 2, r = settings.rmask * camera.z
			var r1 = UFX.random(0.5, 0.52)
			var r2 = UFX.random(0.7, 0.72)
			var c = state.you.tmercy ? Math.floor(128 * state.you.tmercy / settings.tmercy) : 0
			var grad = UFX.draw.radgrad(sx2, sy2, 0, sx2, sy2, r,
				0, "rgba(" + c + ",0,0,0.5)",
				r1, "rgba(" + c + ",0,0,0.5)",
				r2, "rgba(" + c + ",0,0,0.55)",
				1, "rgba(" + c + ",0,0,1)")
			UFX.draw("fs", grad, "f0")
		}

		var r0 = 0.4 * Math.min(canvas.width, canvas.height) / camera.z
		UFX.draw("[ t", canvas.width/2, canvas.height/2, "z", 0.01*camera.z, 0.01*camera.z)
		for (var h in state.houses) {
			if (!state.done["know" + h]) continue
			var house = state.houses[h]
			var dx = house.x - camera.x0, dy = house.y - camera.y0
			var r = Math.sqrt(dx * dx + dy * dy), D = r / r0
			if (D < 1) continue
			var theta = Math.atan2(-dx, -dy)
			UFX.draw("[ r", theta, "t 0", 100*r0, "( m 0 200 l -50 0 l 50 0 ) fs #006 f ss #666 lw 5 s",
				"t 0 -50 r", -theta, "fs white ss black textalign center font 60px~'Pirata~One' sh black 2 2 0 ft0", HouseNames[h], "]")
		}
		UFX.draw("]")

		if (state.nearhouse(state.you)) {
			var t = "House~of~" + HouseNames[state.nearhouse(state.you).name] + "~(Space:~talk)"
			UFX.draw("fs white font 22px~'Sansita~One' textalign center",
				"[ t", canvas.width / 2, canvas.height * 0.7, "ft0", t, "]")
		}
				
		var texts = []
		texts.push("Depth: " + (170 - Math.floor(state.you.y)) + " fathoms")
		texts.push("Health: " + state.you.hp + "/" + state.you.maxhp)
		if (state.jhang) {
			texts.push("GP: " + (state.gp > 100000 ? "unlimited" : state.gp))
		}
		texts.push("Left/right or A/D: move")
		texts.push("Down or S: drop")
		if (state.jhang) {
			texts.push("Up or W: Slash (hold to glide)")
		} else {
			texts.push("Up or W: Jump")
		}
		if (state.canbuild) {
			texts.push("Hold Space + use arrows: Build (cost " + settings.pcost + "GP)")
		}
		if (state.canwarp) {
			texts.push("Tab: warp to random House.")
		}

		if (DEBUG) {
			texts = texts.concat([
				UFX.ticker.getrates(),
				"pos: " + Math.floor(state.you.x) + ", " + Math.floor(state.you.y),
				"F3: toggle fly mode",
				"F4: destroy parent",
				"F5/F6: adjust psize " + settings.psize,
				"F7: toggle checkpoint",
				"F11: dump state",
			])
		}
		var h = Math.floor(canvas.height / 30)
		UFX.draw("fs white textalign left font", h + "px~'Sansita~One'")
		texts.forEach(function (text, j) {
			UFX.draw("[ t 4", h * 1.3 * (j + 1), "ft0", text.replace(/ /g, "~"), "]")
		})
	},
}

