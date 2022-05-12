import * as THREE from './libs/three.module.js'
import { OrbitControls } from './libs/controls/OrbitControls.js';
import { GLTFLoader } from './libs/loaders/GLTFLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null;

let spotLight = null, ambientLight = null;

let idleAction = null;
let mixer = null;
let currentTime = Date.now();

const mapUrl = "images/checker_large.gif";

const SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

async function loadGLTF(gltfModelUrl)
{
    const gltfLoader = new GLTFLoader();

    try
    {
        const result = await gltfLoader.loadAsync(gltfModelUrl, onProgress, onError);

        const object = result.scene.children[0];
        
        object.scale.set( 0.05, 0.05, 0.05 );
        object.position.y = -4;
        object.rotation.z = 3.14;

        object.traverse(model =>{
            if(model.isMesh)
                model.castShadow = true;     
                model.receiveShadow = true;
        });

        scene.add(object);

        mixer = new THREE.AnimationMixer(scene); 
        var idleAction = mixer.clipAction( result.animations[ 1 ] ); 
        idleAction.play();
    }
    catch(err)
    {
        console.error(err);
    }
}

function animate()
{
    const now = Date.now();
    const deltat = now - currentTime;
    currentTime = now;

    if(mixer)
        mixer.update(deltat*0.001);
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    renderer.render( scene, camera );

    animate();

    orbitControls.update();
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    //renderer.shadowMap.enabled = true;
    renderer.setSize(canvas.width, canvas.height);
    
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-30, 15, 40);
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement);

    //root = new THREE.Object3D; //
        
    spotLight = new THREE.SpotLight (0xffffff, 1.5);
    spotLight.position.set(0, 40, 50);
    //root.add(spotLight); //

    ambientLight = new THREE.AmbientLight ( 0xffffff, 0.3);
    //root.add(ambientLight); //

    const map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide}));

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.02;

    //scene.add(root); //
    scene.add( spotLight );
    scene.add( ambientLight );
    scene.add( floor );
}


function main()
{
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    loadGLTF('./models/Soldier.glb');

    update();
}

function resize()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    camera.aspect = canvas.width / canvas.height;

    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
    main();
    resize(); 
};

window.addEventListener('resize', resize, false);
