var canvas = document.getElementById('c');
var gl = canvas.getContext('webgl2');
if(!gl) console.error('webgl initialize failed');
var vShaderSource = `#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;
uniform vec2 u_resolution;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
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

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.useProgram(program);
gl.bindVertexArray(vao);
var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
var arr = [];
console.log(w,h);
for ( var i = 0; i < 50; i++ ) {
    var x=randInt(w), y=randInt(h), angle = randInt(360);
    angle=0;
    arr.push({
        w:randInt(50), h:randInt(50),
        x:x, y:y,
        translate:[0, 0],
        colors:[Math.random(), Math.random(), Math.random()],
        angle:angle,
        rotation:rad(angle),
        scale:[1, 1]
    });
}

function render() {
    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var i = arr.length, o;
    while(i--) {
        o = arr[i];
        var m = m3.projection(w, h);
        m = m3.translate(m, o.translate[0], o.translate[1]);
        m = m3.rotate(m, o.rotation);
        m = m3.scale(m, o.scale[0], o.scale[1]);
        
        setRect(gl, o.x, o.y, o.w, o.h);
        gl.uniform4f(colorLocation, o.colors[0], o.colors[1], o.colors[2], 1);
        gl.uniformMatrix3fv(matLocation, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        o.angle += 0.1;
        o.rotation = rad(o.angle);
    }
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
