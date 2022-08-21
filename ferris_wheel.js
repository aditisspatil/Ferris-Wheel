// Ferris Wheel
// Aditi Patil (asp270)


"use strict";

var gl;
var wheel_1 = [];
var wheel_11 = [];
var wheel_2 = [];
var wheel_22 = [];
var diagonals = [];
var stray_lines = [];
var steady_lines = [];

var carts = [];
var cart = [];
var cart_axis = [];

var buffer;;


var theta = 0.0;
var thetaLoc;
var transLoc;
var flagLoc;
var matrixLoc
var th = 0.05;

var wheel_speed = 0.1;
var camera_speed = 0.05
var n_vertices = 15;
var cart_vertices = 5;


var speed = 100;
var direction = false;

var cameraAngleRadians = degToRad(0);
var fieldOfViewRadians = degToRad(60);
var viewProjectionMatrix;
var cam_radius = 0.5

const x = 0.6;
const r = 0.6;
const r_2  = 0.3;
const r_max = r;

window.onload = function init()
{
  var canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );
  
    reload();

    // Load the data into the GPU
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wheel_1), gl.STATIC_DRAW);
  
    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
    // gl.enable(gl.DEPTH_TEST);
  
  
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    transLoc = gl.getUniformLocation(program, "u_translation");
    flagLoc = gl.getUniformLocation(program, "flag");
    matrixLoc = gl.getUniformLocation(program, "u_matrix");

    render();


    document.getElementById("vel").onchange = function(event) {
      theta = 0
      wheel_speed = event.target.value;
      reload();
      render();
    };

    document.getElementById("carts").onchange = function(event) {
      n_vertices = event.target.value;
      reload();
      render();
    };

};

function init() {
  wheel_1 = [];
  wheel_11 = [];
  wheel_2 = [];
  wheel_22 = [];
  diagonals = [];
  stray_lines = [];
  steady_lines = [];

  carts = [];
  cart = [];
  cart_axis = [];
}

function reload() {
  init()
  cart = create_cart(vec2(0,0));

  for (let i = 0; i < n_vertices; i++) {
    let x = r * Math.cos(2 * Math.PI * i / n_vertices);
    let y = r * Math.sin(2 * Math.PI * i / n_vertices);
    let v1 = vec3(x,y, 0);
    let v2 = vec3(x,y, th);
    wheel_1.push(v1);
    wheel_11.push(v2);
    stray_lines.push(v1);
    stray_lines.push(v2);

    x = r_max * Math.cos(2 * Math.PI * i / n_vertices);
    y = r_max * Math.sin(2 * Math.PI * i / n_vertices);
    diagonals.push(vec3(0,0,0));
    diagonals.push(vec3(x,y,0));
    diagonals.push(vec3(0,0,0));
    diagonals.push(vec3(x,y,th));

    cart_axis.push(vec2(x,y));


    x = r_2 * Math.cos(2 * Math.PI * i / n_vertices);
    y = r_2 * Math.sin(2 * Math.PI * i / n_vertices);
    let v3 = vec3(x,y, 0);
    let v4 = vec3(x,y, th);
    wheel_2.push(v3);
    wheel_22.push(v4);

    // let c = create_cart(vec3(x,y, 0));
    // carts.push(c)
  }
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta  -= wheel_speed;
    cameraAngleRadians -= wheel_speed;
    gl.uniform1f(thetaLoc, theta);
    gl.uniform2fv(transLoc, vec2(0,0));
    gl.uniform1f(flagLoc, 0.0);


    prepare_camera();

    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wheel_1), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_LOOP, 0, wheel_1.length);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(wheel_11), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_LOOP, 0, wheel_1.length);

    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wheel_2), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_LOOP, 0, wheel_2.length);


    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(wheel_22), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_LOOP, 0, wheel_22.length);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(diagonals), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, diagonals.length);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(stray_lines), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, stray_lines.length);


    for (let i =0 ; i < cart_axis.length; i++) {
      gl.uniform1f(flagLoc, 1.0);
      gl.uniform2fv(transLoc, cart_axis[i]);
      const new_cart = cart;
      gl.bufferData(gl.ARRAY_BUFFER, flatten(new_cart), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, new_cart.length);
    }

    setTimeout(
        function () {requestAnimationFrame(render);},
        speed
    );
}

function prepare_camera() {
  var radius = 0.6;
  var fPosition = [0, 0, 0];
    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute a matrix for the camera
    var cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius*4);
   
    // Get the camera's position from the matrix we computed
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];
   
    var up = [0, 0.2, 0];
   
    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
   
    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  // var angle = 90;
  // angle = 55;
  var x = Math.cos(cameraAngleRadians) * 0.6;
  var z = Math.sin(cameraAngleRadians) * 0.6;
  var matrix = m4.translate(viewProjectionMatrix, x, 0, z);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLoc, false, matrix);


  // create a viewProjection matrix. This will both apply perspective
  // AND move the world so that the camera is effectively the origin
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
}

function create_cart(origin) {
var cart = [];
const radius = 0.05;
const cart_vert = 5;

  for (let i = 0; i < cart_vert; i++) {
    var x = radius * Math.cos(2 * Math.PI * i / cart_vert);
    var y = radius * Math.sin(2 * Math.PI * i / cart_vert);
    var z = 0;
    var point = vec3(x,y,0);
    var point = rotate_point(160, point);
    point[1] -= radius;
    x = point[0] + origin[0];
    y = point[1] + origin[1];
    z = point[2]
    cart.push(vec3(x,y,z));
    cart.push(vec3(x,y,th));
  }

  cart.push(cart[0]);
  cart.push(cart[1]);

  return cart;
}

function rotate_point( angle, point ) {
  var s = Math.sin(angle);
  var c = Math.cos(angle);

  var x = point[0];
  var y = point[1];
  point[0] = -s*y + c*x;
  point[1] =  s*x + c*y;
  return point;
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}




var m4 = {

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },

  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
  },

  vectorMultiply: function(v, m) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
      dst[i] = 0.0;
      for (var j = 0; j < 4; ++j) {
        dst[i] += v[j] * m[j * 4 + i];
      }
    }
    return dst;
  },

  lookAt: function(cameraPosition, target, up) {
    var zAxis = normalize(
        subtractVectors(cameraPosition, target));
    var xAxis = normalize(cross(up, zAxis));
    var yAxis = normalize(cross(zAxis, xAxis));
 
    return [
       xAxis[0], xAxis[1], xAxis[2], 0,
       yAxis[0], yAxis[1], yAxis[2], 0,
       zAxis[0], zAxis[1], zAxis[2], 0,
       cameraPosition[0],
       cameraPosition[1],
       cameraPosition[2],
       1,
    ];
  }

};

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}