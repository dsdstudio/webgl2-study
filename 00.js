var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_matrix;
out vec3 v_normal;

void main() {
  vec4 position = u_matrix * a_position;
  gl_Position = position;

  v_normal = a_normal;
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

var matLocation = gl.getUniformLocation(program, 'u_matrix');

// 00. attribute 상태를 관리하는 vertex array object를 생성한다. 
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

var colorLocation = gl.getUniformLocation(program, 'u_color');
var reverseLightDirectionLocation = gl.getUniformLocation(program, 'u_reverseLightDirection');
var normalLocation = gl.getAttribLocation(program, 'a_normal');
var normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

gl.enableVertexAttribArray(normalLocation);
gl.vertexAttribPointer(normalLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
setNormals(gl);


// 포지션 버퍼
var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
// 버퍼 할당은enable vertexattribarr - bindBuffer 이후에 해야 할당이 됨,
setAlphabetF(gl);
// vertexAttribPointer는 아무때나 실행되도 된다능


var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
var o = {
    translate:[-150,0,-360],
    rotation:[rad(190),rad(40),rad(30)],
    scale:[1,1,1],
    colors:[Math.random(), Math.random(), Math.random()]
};

var cameraAngleInRadians = rad(0);
var cameraHeight = 0;
document.getElementById('cameraAngle').addEventListener('input', function(e) {
    var cameraAngle = e.target.value;
    cameraAngleInRadians = rad(cameraAngle);
    document.getElementById('cameraAngleText').innerHTML = cameraHeight;
});
document.getElementById('cameraHeight').addEventListener('input', function(e) {
    cameraHeight = e.target.value;
    document.getElementById('cameraHeightText').innerHTML = cameraHeight;
});

gl.viewport(0, 0, w, h);
gl.clearColor(0,0,0,0);

function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    var numFs = 5;
    var radius = 200;
    var fPosition = [radius, 0, 0];

    var aspect = w/h;
    var zNear = 1, zFar = 2000;
    var projectionMatrix = m4.perspective(rad(60), aspect, zNear, zFar);
    var cameraMatrix = m4.yRotation(cameraAngleInRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, cameraHeight, radius * 1.5);

    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14]
    ];

    var up = [0, 1, 0];
    cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]);
    gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));

    for (var i = 0; i<numFs; ++i) {
        var angle = i * Math.PI * 2 / numFs;
        var x = Math.cos(angle) * radius;
        var z = Math.sin(angle) * radius;
        var matrix = m4.translate(viewProjectionMatrix, x, 0, z);
        gl.uniformMatrix4fv(matLocation, false, matrix);

        gl.drawArrays(gl.TRIANGLES, 0, 16*6);
    }    
    requestAnimationFrame(render);
}

//render();
requestAnimationFrame(render);
