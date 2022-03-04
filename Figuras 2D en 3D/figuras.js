/*
    Tarea 2
    Constanza Gómez Sánchez
    04/03/2022
*/
"use strict";

import * as shaderUtils from "../common/shaderUtils.js";

const mat4 = glMatrix.mat4;
let projectionMatrix, modelViewMatrix;
let shaderVertexPositionAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        out vec4 fragColor;

        void main(void) {
        // Return the pixel color: always output white
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`;

function main()
{
    let canvas = document.getElementById("webglcanvas");

    let gl = initWebGL(canvas);
    initGL(gl, canvas);
    initViewport(gl, canvas);

    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);

    let square = createSquare(gl);
    let triangle = createTriangle(gl);
    let diamond = createDiamond(gl);
    let pacMan = createPacMan(gl);

    //square position
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, 0.6, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, square);

    //triangle position
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [1, 0.6, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, triangle);

    //diamond position
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, -0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, diamond);

    //pacMan position
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [1.0, -0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, pacMan);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL or it is not enabled by default.";

    try
    {
        gl = canvas.getContext("webgl2");
    }
    catch(e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if(!gl)
    {
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas)
{
    // clear the background (with black)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Create a model view matrix with object at 0, 0, -3.333
    modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);

    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

function bindShaderAttributes(gl, shaderProgram)
{
    // Obtain handles to each of the variables defined in the GLSL shader code so that they can be initialized
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, obj)
{
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

    gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);

    // draw the object
    gl.drawArrays(obj.primtype, 0, obj.nVerts);
}

/* createSquare: creates our square figure
* @param gl
* @return our square vertices points
*/
function createSquare(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = [
        0.5, 0.5, 0.0,
        -0.5, 0.5, 0.0,
        0.5, -0.5, 0.0,
        -0.5, -0.5, 0.0 
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let square = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};

    return square;
}

/* createTriangle: creates our triangle figure
* @param gl
* @return our triangle vertices points
*/
function createTriangle(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        0.0, 0.5, 0.0,
        0.5, -0.5,  0.0,
        -0.5, -0.5,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let triangle = {buffer:vertexBuffer, vertSize:3, nVerts:3, primtype:gl.TRIANGLES};

    return triangle;
}

/* createDiamond: creates our diamond figure
* @param gl
* @return our diamond vertices points
*/
function createDiamond(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        0.0, 0.5, 0.0,
        -0.5, 0.0, 0.0,
        0.5, 0.0, 0.0,
        0.0, -0.5, 0.0 
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let diamond = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};

    return diamond;
}

/* createPacMan: creates our PacMan figure
* @param gl
* @return our PacMan vertices points
*/
function createPacMan(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Creates vertex array with center of circle
    let verts = [
        0.0, 0.0, 0.0
    ];

    //Declare variables to build our pacman
    let radio = 0.5;
    let mouth = Math.PI / 7;
    let angle = (Math.PI - mouth) / (320 + 1)

    //Get coordinates of X and Y, give a value of = to X and save to Array
    for(var i=0; i < 320; ++i)
    {
        verts.push(Math.cos(2 * angle * i + mouth) * radio + 0.0);
        verts.push(Math.sin(2 * angle * i + mouth) * radio + 0.0);
        verts.push(0.0);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let pacMan = {buffer:vertexBuffer, vertSize:3, nVerts:320, primtype:gl.TRIANGLE_FAN};

    return pacMan;
}

main();