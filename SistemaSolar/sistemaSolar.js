"use strict"; 

import * as THREE from '../libs/three.js/three.module.js'
import { OrbitControls } from '../libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null, galaxy = null;

let mars = null, earth = null, mercurio = null, venus = null, jupiter = null, saturno = null, urano = null, neptuno = null, pluton = null;

let marsGroup = null, earthGroup = null, mercuryGroup = null, venusGroup = null, jupiterGroup = null, saturnGroup = null, uranoGroup = null, neptunoGroup = null, plutoGroup = null;

let orbTierra = null, orbJupiter = null;

let sun = null;

let directionalLight = null, spotLight = null, ambientLight = null;

let SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

//TEXTURAS Y BUMPS
let sunTextureUrl = "../images/sistema/2k_sun.jpeg";
let moonTextureUrl = "../images/sistema/moonmap1k.jpg";
let moonBumpUrl = "../images/sistema/moonbump1k.jpg";

let mercuryTextureUrl = "../images/sistema/2k_mercury.jpeg";
let mercuryBumpUrl = "../images/sistema/mercurybump.jpg";

let venusTextureUrl = "../images/sistema/venusmap.jpg";
let venusBumpUrl = "../images/sistema/venusbump.jpg";

let earthTextureUrl = "../images/sistema/2k_earth_daymap.jpeg";
let earthBumpUrl = "../images/sistema/earthbump1k.jpg";

let marsTextureUrl = "../images/sistema/mars_1k_color.jpg";
let marsBumpUrl = "../images/sistema/marsbump1k.jpg";

let jupiterTextureUrl = "../images/sistema/2k_jupiter.jpeg";
let jupiterBumpUrl = "../images/sistema/jupiter-hubble-2015-bump.jpg";

let saturnTextureUrl = "../images/sistema/saturnmap.jpg";
let saturnRingTextureUrl = "../images/sistema/saturnringcolor.jpg";

let uranusTextureUrl = "../images/sistema/uranusmap.jpg";
let uranusBumpUrl = "../images/sistema/mirandabump2.png";
let uranusRingTextureUrl = "../images/sistema/uranusringcolour.jpg";

let neptuneTextureUrl = "../images/sistema/2k_neptune.jpeg";

let plutoTextureUrl = "../images/sistema/plutomap1k.jpg";
let plutoBumpUrl = "../images/sistema/plutobump1k.jpg";

let asteroidTextureUrl = "../images/sistema/asteroid.jpg";

function main()
{
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    update();
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Update the camera controller
    orbitControls.update();
}

function addLight(scene)
{
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 1, -3);
    directionalLight.target.position.set(0,0,0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    spotLight = new THREE.SpotLight (0xaaaaaa);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    scene.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0xffffff, 0.8);
    scene.add(ambientLight);
}

const objetoKosmos = {
    create(textureUrl, bumpUrl, r, w, h, pX)
    {
        const texture = new THREE.TextureLoader().load(textureUrl);
        const bumps = new THREE.TextureLoader().load(bumpUrl);
        const material = new THREE.MeshPhongMaterial({map: texture, bumpMap: bumps, bumpScale: 0.5})
        const geometry = new THREE.SphereGeometry(r, w, h);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = pX;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        return mesh;
    },
    createGroup(posX, planeta)
    {
        const grupo = new THREE.Object3D;
        grupo.position.x = posX;
        grupo.add(planeta);

        return grupo;
    },
    createRing(ringText, r, w, h, rotX, rotY, posX, posY)
    {
        let texture = new THREE.TextureLoader().load(ringText);
        let material = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
        let geometry = new THREE.RingGeometry(r, w, h);

        let mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = rotX;
        mesh.rotation.y = rotY;
        mesh.position.x = posX;
        mesh.position.y = posY;

        return mesh
    },
    createOrbit(posX)
    {
        let group = new THREE.Object3D;
        group.position.x = posX;
        return group;
    },
    createMoon(posX, posY)
    {
        let texture = new THREE.TextureLoader().load(moonTextureUrl);
        let bumps = new THREE.TextureLoader().load(moonBumpUrl);
        let material = new THREE.MeshPhongMaterial({map: texture, bumpMap: bumps, bumpScale: 0.5})
        let geometry = new THREE.SphereGeometry(0.7, 20, 20);
        let moon = new THREE.Mesh(geometry, material);
        moon.position.set(posX, posY, 0);
        moon.castShadow = false;
        moon.receiveShadow = false;
        return moon;
    }
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(0, 0, 100);
    scene.add(camera);
    //Orbit controller
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0,0,0);
    //Main group 
    galaxy = new THREE.Object3D;
    scene.add(galaxy);
    //create lights
    addLight(scene);

    const planeta = Object.create(objetoKosmos);

    //Sol
    let texture = new THREE.TextureLoader().load(sunTextureUrl);
    let material = new THREE.MeshPhongMaterial({map: texture, lightMap: texture});
    let geometry = new THREE.SphereGeometry(23, 20, 20);
    
    sun = new THREE.Mesh(geometry, material);
    sun.position.x = 0;
    sun.castShadow = false;
    sun.receiveShadow = false;

    galaxy.add(sun);

    //MERCURIO
    mercurio = planeta.create(mercuryTextureUrl, mercuryBumpUrl, 1.38, 20, 20, 30);
    mercuryGroup = planeta.createGroup(0, mercurio);
    galaxy.add(mercuryGroup);

    //VENUS
    venus = planeta.create(venusTextureUrl, venusBumpUrl, 1.95, 20, 20, 50);
    venusGroup = planeta.createGroup(0, venus);
    galaxy.add(venusGroup);

    //TIERRA
    earth = planeta.create(earthTextureUrl, earthBumpUrl, 2, 20, 20, 70);
    earthGroup = planeta.createGroup(0, earth);
    orbTierra = planeta.createOrbit(70);
    orbTierra.add(planeta.createMoon(4.5, 2));
    earthGroup.add(orbTierra);
    galaxy.add(earthGroup);

    //Marte
    mars = planeta.create(marsTextureUrl, marsBumpUrl, 1.80, 20, 20, 90);
    marsGroup = planeta.createGroup(0, mars);
    galaxy.add(marsGroup);

    //JUPITER
    jupiter = planeta.create(jupiterTextureUrl, jupiterBumpUrl, 11, 20, 20, 150);
    jupiterGroup = planeta.createGroup(0, jupiter);
    orbJupiter = planeta.createOrbit(150);
    for(let i=0; i < 4; ++i)
    {
        orbJupiter.add(planeta.createMoon(4.5, i));
    }
    jupiterGroup.add(orbJupiter);
    galaxy.add(jupiterGroup);

    //SATURNO
    saturno = planeta.create(saturnTextureUrl, jupiterBumpUrl, 9, 20, 20, 180);
    saturnGroup = planeta.createGroup(0, saturno);
    let saturnRing = planeta.createRing(saturnRingTextureUrl, 11, 17, 20, 200, 10, 180, 0);
    galaxy.add(saturnGroup);
    saturnGroup.add(saturnRing);

    //URANO
    urano = planeta.create(uranusTextureUrl, uranusBumpUrl, 5, 20, 20, 210);
    uranoGroup = planeta.createGroup(0, urano);
    let uranusRing = planeta.createRing(uranusRingTextureUrl, 6, 7, 19, 180, 13, 210, 0);
    galaxy.add(uranoGroup);
    uranoGroup.add(uranusRing);

    //NEPTUNO
    neptuno = planeta.create(neptuneTextureUrl, uranusBumpUrl, 5, 20, 20, 230);
    neptunoGroup = planeta.createGroup(0, neptuno);
    galaxy.add(neptuno);

    //PLUTON
    pluton = planeta.create(plutoTextureUrl, plutoBumpUrl, 1.30, 20, 20, 250);
    plutoGroup = planeta.createGroup(0, pluton);
    galaxy.add(plutoGroup);
}

main();


