/*
    Tarea 3
    Constanza Gómez Sánchez
    15/03/2022
*/
"use strict";

import * as shaderUtils from '../common/shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms
//for octaedro movement
let limit = 0;
let state = 0;
let yPos = 0;

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor * 0.8;
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

function main()
{
    const canvas = document.getElementById("webglcanvas");
    const gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initGL(canvas);

    let escutoide = createEscu(gl, [-4, 0, -4], [1.0, 1.0, 0.2]);
    let dodecaedro = createDodec(gl, [0, 0, -4], [-0.4, 1.0, 0.1]);
    let octaedro = createOctaedro(gl, [4, 0, -4], [0, 1, 0]);
    
    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(gl, shaderProgram);

    update(gl, shaderProgram, [escutoide, dodecaedro, octaedro]);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

/* createEscu: creates our Escutoide figure
* @param gl, translation, rotatinAxis
* @return our Escutoide vertices points
*/
function createEscu(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Tapa abajo (5)
        -1.0, 0.0,  -1.5, //
        -0.31, -0.95,  -1.5, //
        0.81,  -0.59,  -1.5, //
        0.81,  0.59,  -1.5, //
        -0.31, 0.95, -1.5, //

        // Tapa arriba (6)
        -1.0, 0.0,  1.5, //
        -0.5, -0.87,  1.5, //
        0.5,  -0.87,  1.5, //
        1.0,  0.0,  1.5, //
        0.5, 0.87, 1.5, //
        -0.5, 0.87, 1.5, //

        //Cara azul
        -1.0, 0.0,  1.5, //(6)
        -1.0, 0.0,  -1.5, //(5)
        -0.5, -0.87,  1.5, //(6)
        -0.31, -0.95,  -1.5, //(5)

        //Cara verde
        -0.5, -0.87,  1.5, //(6)
        0.5,  -0.87,  1.5, //(6)
        -0.31, -0.95,  -1.5, //(5)
        0.81,  -0.59,  -1.5, //(5)

        //Cara amarilla
        0.5,  -0.87,  1.5, //(6)
        1.0,  0.0,  1.5, //(6)
        0.81,  -0.59,  -1.5, //(5)
        0.81,  0.59,  -1.5, //(5)
        0.81, 0.59, 0.0, //centro
        
        //Cara triangulo aqua
        1.0,  0.0,  1.5, //(6)
        0.5, 0.87, 1.5, //(6)
        0.81, 0.59, 0.0, //centro

        //Cara naranja
        -0.5, 0.87, 1.5, //(6)
        0.5, 0.87, 1.5, //(6)
        -0.31, 0.95, -1.5, //(5)
        0.81,  0.59,  -1.5, //(5)
        0.81, 0.59, 0.0, //centro

        //Cara
        -0.5, 0.87, 1.5, //(6)
        -1.0, 0.0,  1.5, //(6)
        -0.31, 0.95,  -1.5, //(5)
        -1.0, 0.0,  -1.5, //(5)
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], //rojo
        [1.0, 0.5, 1.0, 1.0], //rosa
        [0.0, 0.0, 1.0, 1.0], //azul
        [0.0, 1.0, 0.3, 1.0], //verde
        [1.0, 1.0, 0.0, 1.0], //amarillo
        [0.3, 1.0, 1.0, 1.0], //aqua
        [1.0, 0.5, 0.0, 1.0], //naranja
        [1.0, 0.0, 0.7, 1.0], //rosa f
    ];

    let vertexColors = [];

    faceColors.forEach((color, i) =>{
        let numVert = 0;
        //para cada cara es diferente
        if(i == 0 || i == 4 || i == 6)
        {
            numVert = 5;
        }
        else if(i == 1)
        {
            numVert = 6;
        }
        else if(i == 5)
        {
            numVert = 3;
        }
        else
        {
            numVert = 4;
        }

        for (let j=0; j < numVert; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let escuIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, escuIndexBuffer);

    let escuIndices = [
        0, 3, 4,      0, 3, 1,      1, 2, 3,             // Tapa abajo (5)
        5, 9, 10,     5, 6, 9,      6, 8, 9,    6, 7, 8, //Tapa arriba (6)
        11, 12, 13,   14, 13, 12,                        //azul
        15, 16, 17,   18, 17, 16,                       //verde
        19, 20, 21,   21, 22, 20,   20, 22, 23,         //amarilla
        24, 25, 26,                                     //aqua
        27, 28, 29,   28, 29, 30,   31, 30, 28,         //naranja
        32, 33, 34,   33, 34, 35,                       //rosa f  
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(escuIndices), gl.STATIC_DRAW);
    
    let escu = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:escuIndexBuffer,
            vertSize:3, nVerts:36, colorSize:4, nColors: 36, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(escu.modelViewMatrix, escu.modelViewMatrix, translation);

    escu.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return escu;
}

/* createDodec: creates our Dodecaedro figure
* modelo: https://www.geogebra.org/m/wMCYtgcY
* @param gl, translation, rotatinAxis
* @return our Dodecaedro vertices points
*/
function createDodec(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //top
        0.8, 0.8,  0.8,
        0.8, 0.8, -0.8,
        0.5, 1.3, 0,
        1.3, 0, 0.5,
        1.3, 0, -0.5,

        //arriba 1
        0.8, 0.8, 0.8,
        0.8, -0.8, 0.8,
        0, 0.5, 1.3,
        0, -0.5, 1.3,
        1.3, 0, 0.5,

        // arriba 2
        0.8, 0.8, 0.8,
        -0.8, 0.8, 0.8,
        0, 0.5, 1.3,
        0.5, 1.3, 0,
        -0.5, 1.3, 0,

        // arriba 3
        0.8, 0.8, -0.8,
        -0.8, 0.8, -0.8,
        0, 0.5, -1.3,
        0.5, 1.3, 0,
        -0.5, 1.3, 0,

        //arriba 4
        0.8, 0.8, -0.8, //20
        0.8, -0.8, -0.8, //21
        0, 0.5, -1.3, //22
        0, -0.5, -1.3, //23
        1.3, 0, -0.5, //24

        //arriba 5
        0.8, -0.8, 0.8,
        0.8, -0.8, -0.8,
        0.5, -1.3, 0,
        1.3, 0, 0.5,
        1.3, 0, -0.5,

        //abajo 1
        0.8, -0.8, 0.8,
        -0.8, -0.8, 0.8,
        0, -0.5, 1.3,
        0.5, -1.3, 0,
        -0.5, -1.3, 0,

        //abajo 2
        -0.8, 0.8, 0.8,
        -0.8, -0.8, 0.8,
        0, 0.5, 1.3,
        0, -0.5, 1.3,
        -1.3, 0, 0.5,

        //abajo 3
        -0.8, 0.8, 0.8,
        -0.8, 0.8, -0.8,
        -0.5, 1.3, 0,
        -1.3, 0, 0.5,
        -1.3, 0, -0.5,

        //abajo 4
        -0.8, 0.8, -0.8,
        -0.8, -0.8, -0.8,
        0, 0.5, -1.3,
        0, -0.5, -1.3,
        -1.3, 0, -0.5,

        //abajo 5
        0.8, -0.8, -0.8,
        -0.8, -0.8, -0.8,
        0, -0.5, -1.3,
        0.5, -1.3, 0,
        -0.5, -1.3, 0,

        //tapa abajo
        -0.8, -0.8, 0.8,
        -0.8, -0.8, -0.8,
        -0.5, -1.3, 0,
        -1.3, 0, 0.5,
        -1.3, 0, -0.5
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], //rojo
        [0.0, 1.0, 0.0, 1.0], //verde
        [0.0, 0.0, 1.0, 1.0], //azul
        [1.0, 1.0, 0.0, 1.0], //amarillo
        [1.0, 0.0, 1.0, 1.0], //rosa
        [0.0, 1.0, 1.0, 1.0], 
        [0.3, 0.0, 0.0, 1.0], 
        [1.0, 0.3, 0.0, 1.0], //naranja
        [1.0, 0.0, 1.0, 1.0], 
        [0.0, 1.0, 0.7, 1.0], 
        [0.0, 0.0, 0.5, 1.0], 
        [1.0, 1.0, 1.0, 1.0], //blanco
    ];

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecIndexBuffer);

    let dodecIndices = [
        3, 1, 2,       0, 2, 3,       1, 3, 4,    // top
        9, 7, 8,       7, 9, 5,       6, 8, 9,   // arriba 1
        10, 11, 12,    10, 11, 14,    10, 13, 14,  // arriba 2
        15, 16, 17,    15, 16, 18,    16, 18, 19,  // arriba 3
        20, 22, 23,    20, 23, 24,    21, 23, 24,  // arriba 4
        26, 25, 29,    26, 27, 25,    25, 29, 28, // arriba 5
        32, 33, 34,    32, 31, 34,    30, 33, 32, //abajo 1
        36, 37, 38,    36, 37, 39,    35, 37, 39,//abajo 2
        40, 42, 41,    40, 41, 44,    40, 44, 43,   //abajo 3
        46, 47, 49,    45, 47, 49,    46, 47, 48, //abajo 4
        53, 51, 52,    50, 53, 52,    51, 53, 54, //abajo 5
        55, 56, 57,    55, 56, 59,    55, 58, 59,//tapa abajo
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecIndices), gl.STATIC_DRAW);
    
    let dodec = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 60, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodec.modelViewMatrix, dodec.modelViewMatrix, translation);

    dodec.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodec;
}

/* createOctaedro: creates our Octaedro figure
* modelo: https://www.geogebra.org/m/eCsWzqnj
* @param gl, translation, rotatinAxis
* @return our Octaedro vertices points
*/
function createOctaedro(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       1.0, 0, 0,
        0, 0,  1.0,
        0,  1.0,  0,

       1.0, 0, 0,
       0,  1.0, 0,
        0,  0, -1.0,

       0,  1.0, 0,
       0,  0,  1.0,
        -1.0,  0,  0,

       0, 1.0, 0,
        0, 0, -1.0,
        -1.0, 0,  0,

        -1.0, 0, 0,
        0,  0, 1.0,
        0,  -1.0,  0,

       -1.0, 0, 0,
       0, -1.0,  0,
       0,  0,  -1.0,

        0, -1.0, 0,
        0, 0, 1.0,
        1.0, 0, 0,

        0, -1.0, 0,
        0, 0, -1.0,
        1.0, 0, 0,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],// Caras de arriba
        [0.0, 1.0, 0.7, 1.0], 
        [0.5, 0.0, 1.0, 1.0], 
        [1.0, 0.0, 0.0, 1.0], 
        [0.0, 0.7, 1.0, 1.0],// Caras de abajo
        [1.0, 0.0, 1.0, 1.0], 
        [0.7, 1.0, 0.0, 1.0], 
        [1.0, 0.3, 0.0, 1.0],
    ];

    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let octaedroIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octaedroIndexBuffer);

    let octaedroIndices = [
        0, 1, 2,      3, 4, 5,    
        6, 7, 8,      9, 10, 11,
        12, 13, 14,     15, 16, 17,
        18, 19, 20,     21, 22, 23,
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octaedroIndices), gl.STATIC_DRAW);
    
    let octaedro = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:octaedroIndexBuffer,
            vertSize:3, nVerts:27, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octaedro.modelViewMatrix, octaedro.modelViewMatrix, translation);

    octaedro.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        if(state == 0)
        {
            if(limit < 209)
            {
                yPos = 0.013;
                limit += 1;
            }
            else
            {
                state = 1;
            }
        }
        else 
        {
            if(limit > -209)
            {
                yPos = -0.013;
                limit -= 1;
            }
            else
            {
                state = 0;
            }
        }
    
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, yPos ,0])
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octaedro;
}

function bindShaderAttributes(gl, shaderProgram)
{
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, objs)
{
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(gl, shaderProgram, objs)
{
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
}

main();