var settings = {
	sx: null,
	sy: null,
	fonts: {},
	easymode: window.location.href.indexOf("EASY") > -1,
}

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
		title: {
			size: 5*s0,
			font: "Boogaloo",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "black",
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
			bcolor: "black",
			width: sx*0.5,
			boxcolor: "#fca",
			boxbcolor: "#f80",
		},
		chattip: {
			size: s0*4,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "white",
			bcolor: "black",
		},
		iteminfo: {
			size: s0*2,
			font: "Maiden Orange",
			hanchor: 0.5,
			vanchor: 0,
			color: "white",
			bcolor: "black",
			width: sx*0.5,
			boxcolor: "#fca",
			boxbcolor: "#f80",
		},
		itemname: {
			size: s0*4,
			font: "Mouse Memoirs",
			hanchor: 0,
			vanchor: 0.5,
			color: "white",
			bcolor: "black",
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
			bcolor: "black",
		},
		backintime: {
			size: s0*3.3,
			font: "Mouse Memoirs",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "#aac",
			bcolor: "black",
		},
		saved: {
			size: s0*2,
			font: "Unkempt",
			hanchor: 0.5,
			vanchor: 0.5,
			color: "#f9f",
			bcolor: "black",
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




