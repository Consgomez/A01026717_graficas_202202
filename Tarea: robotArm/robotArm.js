"use strict";

import * as THREE from "../libs/three.js/three.module.js";
import {addMouseHandler} from "./sceneHandlers.js"

let renderer = null, scene = null, camera = null, armMain = null, shoulderMain = null;

/**
 * Main functions gets canvas and calls createScene() and update()
 */
function main()
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

/**
 * Runs the update loop: updates the objects in the scene
 */
function update()
{
    requestAnimationFrame(function() {update(); });
    renderer.render(scene, camera);
}

/**
 * Creates the scene with the lighting, ambient light and components
 */
function createScene(canvas)
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.2, 0.2, 0.2);

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    //armGroup = new THREE.Object3D;

    const light = new THREE.DirectionalLight(0xffffff, 1.0);

    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    const getTexture = "../images/pastel.jpeg";
    const texture = new THREE.TextureLoader().load(getTexture);
    const material = new THREE.MeshPhongMaterial({map: texture});

    const gui = new dat.GUI();

    //crear partes del brazo
    const hombro = new THREE.Object3D;
    const muneca = new THREE.Object3D;
    const codo = new THREE.Object3D;
    const brazo = new THREE.Object3D;
    const antebrazo = new THREE.Object3D;
    const mano = new THREE.Object3D;

    //Create the sphere geometry
    let geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    let armGeometry = new THREE.BoxGeometry(0.7, 1, 0.7);
    let wristGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);

    //Agregar cada componente a su geometry correspondiente
    let shoulderMain = new THREE.Mesh(geometry, material);
    let armMain = new THREE.Mesh(armGeometry, material);
    let elbowMain = new THREE.Mesh(geometry, material);
    let arm = new THREE.Mesh(armGeometry, material);
    let wristMain = new THREE.Mesh(geometry, material);
    let handMain = new THREE.Mesh(wristGeometry, material);
    
    //Hombro-brazo
    shoulderMain.position.set(0, 0.6, 0);
    brazo.add(shoulderMain);
    brazo.add(armMain);
    brazo.position.set(0, 1.5, 2);

    //Codo
    brazo.add(codo);
    codo.add(elbowMain);
    codo.position.set(0, -0.6, 0);

    //Brazo
    codo.add(antebrazo);
    antebrazo.add(arm);
    antebrazo.position.set(0, -0.6, 0);

    //Muñeca
    antebrazo.add(muneca);
    muneca.add(wristMain);
    muneca.position.set(0, -0.6, 0);

    //Mano
    muneca.add(mano);
    mano.add(handMain);
    mano.position.set(0, -0.3, 0);

    scene.add(brazo);

    //Agregar conntroles de GUI
    const controls = gui.addFolder('Robot Arm');
    controls.add(brazo.rotation, 'x', -3, 3).name("shoulder X");
    controls.add(brazo.rotation, 'z', -Math.PI * 2, Math.PI * 2).name("shoulder Z");
    controls.add(codo.rotation, 'x', -1.8, 0).name("elbow X");
    controls.add(antebrazo.rotation, 'y', 0, 1).name("forearm Y");
    controls.add(muneca.rotation, 'x', 0, 1.5).name("wrist X");
    controls.add(mano.rotation, 'x', -1, 1).name("hand X");
    controls.add(mano.rotation, 'z', -1, 1).name("hand Z");

    controls.open();

    addMouseHandler(canvas, brazo);

    brazo.updateMatrixWorld();
}

main();