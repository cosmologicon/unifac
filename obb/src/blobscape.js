// Managing the blobscape: the procedurally-generated texture atlases used for rendering objects
// (body parts) that use the blob shader

var blobscape = {
	init: function () {
		this.blobspecs = {}
	},

	build: function (shape) {
		var data = this.getdata(shape)
		if (!data.length) throw "unrecognized blob shape " + shape
		data.sort(function (a, b) { return a[2] - b[2] })
		data = [].concat.apply([], data)
		this.blobspecs[shape] = {
			buffer: gl.createBuffer(),
			n: data.length / 14,
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
	},
	
	getdata: function (shape) {
		var data = []
		if (shape == "sphere") {
			var nblob = 2000
			while (data.length < nblob) {
				var xG = UFX.random(-1, 1)
				var yG = UFX.random(-1, 1)
				var zG = UFX.random(-1, 1)
				var rG = UFX.random(0.06, 0.12)
				var dG = Math.sqrt(xG * xG + yG * yG + zG * zG)
				if (dG + rG > 0.8 || dG < 0.0001) continue
				var nx = xG/dG + UFX.random(-0.05, 0.05)
				var ny = yG/dG + UFX.random(-0.05, 0.05)
				var nz = zG/dG + UFX.random(-0.05, 0.05)
				var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = dG
				data.push([xG, yG, zG, rG, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
			}
		} else if (shape == "stalk0") {
			var nblob = 500
			while (data.length < nblob) {
				var xp = UFX.random(-1, 1)
				var yp = UFX.random(-1, 1)
				var rG = UFX.random(0.06, 0.12)
				var dp = Math.sqrt(xp * xp + yp * yp)
				if (dp * 0.15 + rG > 0.15 || dp < 0.0001) continue
				var xG = xp/dp * 0.15
				var yG = UFX.random(-0.866, 0.866)
				var zG = yp/dp * 0.15
				var nx = xp/dp + UFX.random(-0.05, 0.05)
				var ny = 0 + UFX.random(-0.05, 0.05)
				var nz = yp/dp + UFX.random(-0.05, 0.05)
				var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = 0.4  // should be a combination of yG and dp
				data.push([xG, yG, zG, rG, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
			}
		}
		return data
	},
	
	// Draw directly to the screen using the reference blob shader.
	draw0: function (shape, posG, progress) {
		if (!this.blobspecs[shape]) this.build(shape)
		graphics.progs.blob.setprogress(progress == undefined ? 1 : progress)
		graphics.progs.blob.setscenter(posG[0], posG[1])
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.normal, 3, gl.FLOAT, false, 14*4, 4*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.acolor, 3, gl.FLOAT, false, 14*4, 10*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)
	},
	

}


