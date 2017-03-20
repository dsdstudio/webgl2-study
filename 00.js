var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;
out vec4 v_color;

void main() {
  vec4 position = u_matrix * a_position;
  gl_Position = position;

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


// 포지션 버퍼
var positionBuffer = gl.createBuffer();
gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 버퍼 할당은enable vertexattribarr - bindBuffer 이후에 해야 할당이 됨,
setAlphabetF(gl);
// vertexAttribPointer는 아무때나 실행되도 된다능

gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
var o = {
    translate:[-150,0,-360],
    rotation:[rad(190),rad(40),rad(30)],
    scale:[1,1,1],
    colors:[Math.random(), Math.random(), Math.random()]
};

function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    var aspect = w/h;
    var zNear = 1, zFar = 2000;
    var m = m4.perspective(rad(60), aspect, zNear, zFar);
    m = m4.translate(m, o.translate[0], o.translate[1], o.translate[2]);
    m = m4.xRotate(m, o.rotation[0]);
    m = m4.yRotate(m, o.rotation[1]);
    m = m4.zRotate(m, o.rotation[2]);
    m = m4.scale(m, o.scale[0], o.scale[1], o.scale[2]);

    gl.uniformMatrix4fv(matLocation, false, m);

    gl.drawArrays(gl.TRIANGLES, 0, 16*6);
    requestAnimationFrame(render);
}

//render();
requestAnimationFrame(render);
