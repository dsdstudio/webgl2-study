let canvas = document.getElementById('c');
let gl = canvas.getContext('webgl2');
if (!gl) console.error('webgl init failed');

let vShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;

uniform mat3 u_matrix;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  v_texCoord = a_texCoord;
}`;
let fShaderSource = `#version 300 es
precision mediump float;

uniform sampler2D u_image;

uniform float u_kernel[9];
uniform float u_kernelWeight;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
  vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

  vec4 colorSum =
    texture(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
    texture(u_image, v_texCoord + onePixel * vec2(0, -1)) * u_kernel[1] +
    texture(u_image, v_texCoord + onePixel * vec2(1, -1)) * u_kernel[2] +
    texture(u_image, v_texCoord + onePixel * vec2(-1, 0)) * u_kernel[3] +
    texture(u_image, v_texCoord + onePixel * vec2(0, 0)) * u_kernel[4] +
    texture(u_image, v_texCoord + onePixel * vec2(1, 0)) * u_kernel[5] +
    texture(u_image, v_texCoord + onePixel * vec2(-1, 1)) * u_kernel[6] +
    texture(u_image, v_texCoord + onePixel * vec2(0, 1)) * u_kernel[7] +
    texture(u_image, v_texCoord + onePixel * vec2(1, 1)) * u_kernel[8];
  outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}`;
let vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSource);
let fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSource);
let program = createProgram(gl, vShader, fShader);



let w = canvas.clientWidth, h = canvas.clientHeight;
// projection * translate * rot*scale*position

let models = (() => {
    var arr = []
    for (let i = 0, n =1000; i<n; i++) arr.push({p: {x:w * Math.random(), y: h * Math.random()},
                                                scale:Math.random() * 0.1,
                                                angle:Math.random() * 360,
                                                speed: 2,
                                                center:function() {
                                                    return {x: image.width * this.scale * 0.5, y:image.height * this.scale * 0.5}
                                                }})
                                                
    return arr
})()
let image;
loadTexture('t0.png').then(function(img) {
    image = img;
    render(image);
});
var angle = 1;
function render() {
    resizeCanvasToDisplaySize(gl.canvas);

    gl.useProgram(program);

    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    var texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    var matLocation = gl.getUniformLocation(program, 'u_matrix');
    var imgLocation = gl.getUniformLocation(program, 'u_image');

    var kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
    var kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight');

    var edgeDetectKernel = [
        -1, -1, -1,
        -1, 8, -1,
        -1,-1,-1
    ];

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setRect(gl, 0, 0, image.width, image.height);

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,0.0,
        1.0,0.0,
        0.0,1.0,
        0.0,1.0,
        1.0,0.0,
        1.0,1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordAttributeLocation);

    var size=2,
        type=gl.FLOAT,
        normalize=false,
        stride=0,
        offset=0;
    gl.vertexAttribPointer(texCoordAttributeLocation, size,type,normalize,stride,offset);

    var texture = createAndSetupTexture(gl);
    var mipLevel = 0,
        internalFormat = gl.RGBA,
        srcFormat = gl.RGBA,
        srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D,
                  mipLevel,
                  internalFormat,
                  srcFormat,
                  srcType,
                  image);

    gl.bindVertexArray(vao);

    // 뷰포트 
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    // canvas 클리어 
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // 이미지를 texture 0 번에 할당 
    gl.uniform1i(imgLocation, 0);

    gl.uniform1fv(kernelLocation, edgeDetectKernel);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel));
    models.forEach((model, index) => {
        model.angle += model.speed
        let m = m3.projection(w, h);
        m = m3.translate(m, model.p.x, model.p.y);
        m = m3.translate(m, -model.center().x, -model.center().y);
        m = m3.rotate(m, rad(model.angle));
        m = m3.translate(m, -model.center().x, -model.center().y);
        m = m3.scale(m, model.scale, model.scale);
        gl.uniformMatrix3fv(matLocation, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    })
    requestAnimationFrame(render);
}

function computeKernelWeight(kernel) {
    var weight = kernel.reduce((p, c) => {
        return p + c;
    });
    return weight <= 0 ? 1 : weight;
}

window.addEventListener('resize', (e) => {
    render(image);
}, false);
