// Cover the entire canvas

// (x,y) position
attribute vec2 pos;

void main(void) {
    gl_Position = vec4(pos * 2.0 - 1.0, 1.0, 1.0);
}

