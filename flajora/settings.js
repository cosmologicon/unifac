var settings = {
	sx: null,
	sy: null,
	fonts: {},
}

var qopts = {}
window.location.search.slice(1).split("&").forEach(function (qstr) {
    var a = qstr.split("=")
    if (a.length == 1) qopts[a[0]] = true
    if (a.length == 2) qopts[a[0]] = JSON.parse(decodeURIComponent(a[1]))
})

settings.EASY = qopts.EASY === true ? 2.5 : qopts.EASY
settings.RESET = qopts.RESET


// Size of objects and text for any canvas size
UFX.maximize.onadjust = function (canvas) {
	var sx = settings.sx = canvas.width
	var sy = settings.sy = canvas.height
	var s0 = Math.min(0.04 * sy, 0.025 * sx)
	settings.tstyles = {
		open: {
			size: 3*s0,
			font: "Alfa Slab One",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "white",
		},
		subopen: {
			size: 5*s0,
			font: "Alfa Slab One",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "white",
		},
		title: {
			size: 5*s0,
			font: "Boogaloo",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "blue",
			shadow: "black",
		},
		subtitle: {
			size: 2*s0,
			font: "Boogaloo",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "blue",
			shadow: "black",
		},
		timer: {
			size: 3*s0,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 1,
			color: "white",
			bcolor: "black",
		},
		bubble: {
			size: 13,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 1,
			color: "black",
			width: 140,
		},
		chat: {
			size: s0*2,
			font: "Maiden Orange",
			hanchor: 0.5,
			vanchor: 0,
			color: "white",
			shadow: "black",
			width: sx*0.5,
			boxcolor: "#a84",
			boxbcolor: "#f80",
		},
		chattip: {
			size: s0*4,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "yellow",
			shadow: "black",
		},
		iteminfo: {
			size: s0*2,
			font: "Maiden Orange",
			hanchor: 0.5,
			vanchor: 0,
			color: "white",
			shadow: "black",
			width: sx*0.65,
			boxcolor: "#84a",
			boxbcolor: "#80f",
		},
		itemname: {
			size: s0*4,
			font: "Mouse Memoirs",
			hanchor: 0,
			vanchor: 0.5,
			color: "white",
			shadow: "black",
		},
		gobacktip: {
			size: s0*2,
			font: "Mouse Memoirs",
			hanchor: 1,
			vanchor: 1,
			color: "#ccf",
			bcolor: "black",
		},
		place: {
			size: s0*3.5,
			font: "Mystery Quest",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "orange",
			shadow: "black",
		},
		backintime: {
			size: s0*3.3,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "#77b",
			shadow: "black",
		},
		saved: {
			size: s0*2,
			font: "Unkempt",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "black",
			shadow: "#a8a",
		},
		fail: {
			size: 3*s0,
			font: "Kavoon",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "#400",
			width: sx*0.8,
		},
	}
}

var mechanics = {
	walkspeed: 12,
	runspeed: 30,
	chatradius: 3,
}




