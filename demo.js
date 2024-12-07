
import { initBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";

let cubeRotation = 0.0;
let deltaTime = 0;

main();

function main() {
  const canvas = document.querySelector("#gl-canvas");
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is up & running
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  // Set clear color to black, full opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear color buffer w/specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

// Vertex shader - provides the clip space coordinates
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader - compute the color of each pixel of the primitive being drawn
const fsSource = `
    precision mediump float;
    varying lowp vec4 vColor;
    uniform vec4 uSquareColor;

    void main(void) {
      gl_FragColor = uSquareColor;
      gl_FragColor = vColor;
    }
  `;

  //Initialize a shader program; where all lighting for vertices is established
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const squareColor = [1.0, 1.0, 1.0, 1.0];
  const uSquareColorLocation = gl.getUniformLocation(shaderProgram, 'uSquareColor');
  gl.useProgram(shaderProgram);
  gl.uniform4fv(uSquareColorLocation, squareColor);

const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
  },
};

  // Debugging: log uniform locations
  console.log('Projection Matrix Location:', programInfo.uniformLocations.projectionMatrix);
  console.log('Model-View Matrix Location:', programInfo.uniformLocations.modelViewMatrix);

// Here's where we call the routine that builds all the objects we'll be drawing.
const buffers = initBuffers(gl);

// Draw the scene
let then = 0;

// Draw the scene repeatedly
function render(now) {
  now *= 0.001; // convert to seconds
  deltaTime = now - then;
  then = now;

  drawScene(gl, programInfo, buffers, cubeRotation);
  cubeRotation += deltaTime;

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log("Unable to initialize the shader program:", gl.getProgramInfoLog(shaderProgram));
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling shader (${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'}):`, gl.getShaderInfoLog(shader))
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}