function createShader(gl, t, s) {
    var shader = gl.createShader(t);
    gl.shaderSource(shader, s);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if ( success ) return shader;

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl) {
    var program = gl.createProgram();
    var t0 = [].slice.call(arguments, 1);
    for (var i=0,n=t0.length;i<n;i++) gl.attachShader(program, t0[i]);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if ( success ) return program;

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createAndSetupTexture(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}
function loadTexture(imgUrl) {
    var p = new Promise(function(resolve, reject) {
        var img = new Image();
        img.src = imgUrl;
        img.onload = function() {
            resolve(img);
        };
        img.onerror = function() {
            reject(arguments);
        };
    });
    return p;
}

function setRect(gl,x,y,w,h) {
    var x1 = x;
    var x2 = x + w;
    var y1 = y;
    var y2 = y + h;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1,y1,
        x2,y1,
        x1,y2,
        x1,y2,
        x2,y1,
        x2,y2
    ]), gl.STATIC_DRAW);
}


function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    var width  = canvas.clientWidth  * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width = width, canvas.height = height;
        return true;
    }
    return false;
}

function randInt(range) { return Math.floor(Math.random() * range); }
function rad(angle) { return angle*Math.PI/180; }
function createRegularTriangleBuffer(gl, x, y, radius, n) {
    // 원의 반지름음 0.5라 가정
    var buf = [], r = radius || 0.5, c = Math.cos, s = Math.sin;
    var angleStep = 360 / n;
    // 중점
    var center = { x:x, y:y };
    var startAngle = 90;
    var i = n;
    buf.push(0.0, 0.0, 0.0);

    while(i--) {
        buf.push(center.x + c(rad(startAngle)) * r, center.y + s(rad(startAngle)) * r, 0.0);
        startAngle += angleStep;
    }
    
    buf.push(center.x + c(rad(startAngle)) * r, center.y + s(rad(startAngle)) * r, 0.0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buf), gl.STATIC_DRAW);
}

var m3 = {
    identity: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    projection: function(w, h) {
        return [
            2/w, 0, 0,
            0, -2/h, 0,
            -1, 1, 1
        ];
    },
    translation: function(tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx,ty, 1
        ];
    },
    rotation: function(radians) {
        var c = Math.cos(radians), s = Math.sin(radians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ];
    },
    scaling: function(sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ];
    },
    multiply: function multiply(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22
        ];
    },
    translate:function(m, tx, ty) {
        return m3.multiply(m, m3.translation(tx, ty));
    },
    rotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.rotation(angleInRadians));
    },
    scale: function(m, sx, sy) {
        return m3.multiply(m, m3.scaling(sx, sy));
    }
};
