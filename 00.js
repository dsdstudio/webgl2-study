var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec4 a_position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * a_position;
}`;
var fShaderSource = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor = u_color;
}`;
var vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
var fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
var program = createProgram(gl, vShader, fShader);

var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
var matLocation = gl.getUniformLocation(program, 'u_matrix');
var colorLocation = gl.getUniformLocation(program, 'u_color');
var positionBuffer = gl.createBuffer();
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.useProgram(program);
gl.bindVertexArray(vao);
var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
gl.viewport(0, 0, w, h);

function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var o = {
        translate:[100,50,0],
        rotation:[0,0,0],
        scale:[1,1,1],
        colors:[Math.random(), Math.random(), Math.random()]
    };
    
    var m = m4.projection(w, h, 400);
    m = m4.translate(m, o.translate[0], o.translate[1], o.translate[2]);
    m = m4.xRotate(m, o.rotation[0]);
    m = m4.yRotate(m, o.rotation[1]);
    m = m4.zRotate(m, o.rotation[2]);
    m = m4.scale(m, o.scale[0], o.scale[1], o.scale[2]);
    setAlphabetF(gl);
    
    gl.uniform4f(colorLocation, o.colors[0], o.colors[1], o.colors[2], 1);
    gl.uniformMatrix4fv(matLocation, false, m);

    gl.drawArrays(gl.TRIANGLES, 0, 18);
    requestAnimationFrame(render);
}
//render();
requestAnimationFrame(render);
