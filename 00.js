var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;

  v_color = a_color;
}`;
var fShaderSource = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;

void main() {
  outColor = v_color;
}`;
var vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
var fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
var program = createProgram(gl, vShader, fShader);

var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
var matLocation = gl.getUniformLocation(program, 'u_matrix');

// 00. attribute 상태를 관리하는 vertex array object를 생성한다. 
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

var colorLocation = gl.getAttribLocation(program, 'a_color');
var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
setColors(gl);


var positionBuffer = gl.createBuffer();

gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


gl.useProgram(program);
gl.bindVertexArray(vao);
var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
gl.viewport(0, 0, w, h);
var o = {
    translate:[45,150,0],
    rotation:[rad(40),rad(25),rad(325)],
    scale:[1,1,1],
    colors:[Math.random(), Math.random(), Math.random()]
};

function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    
    var m = m4.projection(w, h, 400);
    m = m4.translate(m, o.translate[0], o.translate[1], o.translate[2]);
    m = m4.xRotate(m, o.rotation[0]);
    m = m4.yRotate(m, o.rotation[1]);
    m = m4.zRotate(m, o.rotation[2]);
    m = m4.scale(m, o.scale[0], o.scale[1], o.scale[2]);
    setAlphabetF(gl);

    gl.uniformMatrix4fv(matLocation, false, m);

    gl.drawArrays(gl.TRIANGLES, 0, 16*6);
    requestAnimationFrame(render);
}
//render();
requestAnimationFrame(render);
