var settings = {
	sx: null,
	sy: null,
	fonts: {},
}

// Size of objects and text for any canvas size
UFX.maximize.onadjust = function (canvas) {
	var sx = settings.sx = canvas.width
	var sy = settings.sy = canvas.height
	var s0 = Math.min(0.04 * sy, 0.025 * sx)
	settings.tstyles = {
		open: {
			size: Math.min(0.2 * sy, 0.13 * sx),
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "white",
		},
		timer: {
			size: 3*s0,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 1,
			color: "white",
			bcolor: "black"
		},
	}
}

var mechanics = {
	walkspeed: 12,
	runspeed: 30,
}




