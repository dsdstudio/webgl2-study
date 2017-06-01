var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_matrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

out vec3 v_normal;

void main() {
  gl_Position = u_worldViewProjection * a_position;

  v_normal = mat3(u_world) * a_normal;
}`;
var fShaderSource = `#version 300 es
precision mediump float;
in vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);

  float light = dot(normal, u_reverseLightDirection);

  outColor = u_color;

  outColor.rgb *= light;
}`;
var vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
var fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
var program = createProgram(gl, vShader, fShader);

var worldViewProjectionLocation = gl.getUniformLocation(program, 'u_worldViewProjection');
var worldLocation = gl.getUniformLocation(program, 'u_world');

// 00. attribute 상태를 관리하는 vertex array object를 생성한다. 
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// 포지션 버퍼
var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
// 버퍼 할당은enable vertexattribarr - bindBuffer 이후에 해야 할당이 됨,
setAlphabetF(gl);
// vertexAttribPointer는 아무때나 실행되도 된다능

var colorLocation = gl.getUniformLocation(program, 'u_color');
var reverseLightDirectionLocation = gl.getUniformLocation(program, 'u_reverseLightDirection');
var normalLocation = gl.getAttribLocation(program, 'a_normal');
var normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

gl.enableVertexAttribArray(normalLocation);
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
setNormals(gl);


var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
var o = {
    translate:[-150,0,-360],
    rotation:[rad(190),rad(40),rad(30)],
    scale:[1,1,1],
    colors:[Math.random(), Math.random(), Math.random()]
};

var cameraAngleInRadians = 0;
var cameraHeight = 0;
document.addEventListener('mousemove', function(e) {
    var angle = (e.clientX/w) * 720;
    var height = (e.clientY/h) * 300;
    cameraAngleInRadians = rad(angle);
    cameraHeight = height;
});
gl.viewport(0, 0, w, h);

function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    cameraAngleInRadians += 0.01;
    var numFs = 5;
    var radius = 200;

    var aspect = w/h;
    var zNear = 1, zFar = 2000;
    var projectionMatrix = m4.perspective(rad(60), aspect, zNear, zFar);

    var cameraPosition = [100,cameraHeight,200];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var worldMatrix = m4.yRotation(cameraAngleInRadians);
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);


    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]);
    gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));

    gl.drawArrays(gl.TRIANGLES, 0, 16*6);
    for (var i = 0; i<numFs; ++i) {
        var angle = i * Math.PI * 2 / numFs;
        var x = Math.cos(angle) * radius;
        var z = Math.sin(angle) * radius;

//        var matrix = m4.translate(viewProjectionMatrix, x, 0, z);
    }    
    requestAnimationFrame(render);
}

//render();
requestAnimationFrame(render);
