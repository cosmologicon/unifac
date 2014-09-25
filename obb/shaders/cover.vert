// Cover the entire canvas.
// Since no information is passed to the fragment shader about position on the screen, this is
// pretty much only useful with uniform.frag to cover the entire canvas.

// For a slightly more useful vertex shader, that actually passes position along to the fragment
// shader, see full.vert.

// The unit square is mapped to the entire canvas. I guess you could pass in something other than
// the unit square, but if you're just trying to cover a rectangular part of the canvas, it might be
// easier just to use gl.scissor.

// (x,y) position, where the visible area is the unit square 0 <= x, y < 1.
attribute vec2 pos;

void main(void) {
    gl_Position = vec4(pos * 2.0 - 1.0, 1.0, 1.0);
}

