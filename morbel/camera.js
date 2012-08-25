
var camera = {
    x0: 0,
    y0: 100,
    zoom: 1,
    xmin: -settings.sx,
    xmax: settings.sx,
    
    think: function (dt) {
        this.xmin = this.x0 - settings.sx / (2.0 * this.zoom)
        this.xmax = this.x0 + settings.sx / (2.0 * this.zoom)
        
        explore(this.xmin - 100, this.xmax + 100)
    },

}


