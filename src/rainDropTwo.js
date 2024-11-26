import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import GUI from "lil-gui";

const canvas = document.querySelector(".webgl");

const gui = new GUI({
  width: 300,
  title: "Tweaks",
  closeFolders: true,
});
gui.close();

const rainTweaks = gui.addFolder("rainTweaks");
const nameTweaks = gui.addFolder("nameTweaks");

const scene = new THREE.Scene();
const group = new THREE.Group();

const debugObject = {
  color: "#A7C7E7",

// Light Blue: #A7C7E7 (represents a light, water-like shade)
// Grayish Blue: #5B7D91 (gives a more cloudy, rainstorm look)
// Clear Water: #B0D0D3 (a translucent, clear look for raindrops)
};

const debugObject2 = {
  color: "black",
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const fontLoader = new FontLoader();
fontLoader.load("/fonts/vindey.json", (font) => {
  const textGeometry = new TextGeometry("Arun", {
    font: font,
    size: 0.5,
    depth: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  const textMaterial = new THREE.MeshPhysicalMaterial();
  textMaterial.flatShading = true;
  textMaterial.color = new THREE.Color(debugObject2.color);

  nameTweaks.add(textMaterial, "transmission").min(0).max(1).step(0.0001);
  nameTweaks.add(textMaterial, "ior").min(1).max(10).step(0.0001);
  nameTweaks.add(textMaterial, "thickness").min(0).max(1).step(0.0001);

  nameTweaks.addColor(debugObject2, "color").onChange(() => {
    textMaterial.color.set(debugObject2.color);
  });

  const text = new THREE.Mesh(textGeometry, textMaterial);

  text.scale.set(2, 2, 2);
  group.add(text);

  textGeometry.center();
});
// Define the profile for the raindrop
const points = [];
points.push(new THREE.Vector2(0, 1.5)); // Top of the drop (pointy tip)
points.push(new THREE.Vector2(0.3, 1)); // Slope outward
points.push(new THREE.Vector2(0.6, 0.5)); // Curve outward
points.push(new THREE.Vector2(0.7, 0)); // Widest part
points.push(new THREE.Vector2(0.4, -0.8)); // Taper to the bottom
points.push(new THREE.Vector2(0, -1)); // Bottom of the raindrop

// Create the lathe geometry by revolving the points around the Y-axis
const raindropGeometry = new THREE.LatheGeometry(points, 32);

// Material
const raindropMaterial = new THREE.MeshPhysicalMaterial();
raindropMaterial.color = new THREE.Color(debugObject.color);
raindropMaterial.flatShading = false;
raindropMaterial.side = THREE.DoubleSide;
raindropMaterial.opacity = 0.5;
raindropMaterial.transparent = true;
raindropMaterial.metalness = 0;
raindropMaterial.roughness = 0;
raindropMaterial.transmission = 1;
raindropMaterial.ior = 4;
raindropMaterial.thickness = 0;

rainTweaks.addColor(debugObject, "color").onChange(() => {
  raindropMaterial.color.set(debugObject.color);
});

rainTweaks.add(raindropMaterial, "transmission").min(0).max(1).step(0.0001);
rainTweaks.add(raindropMaterial, "ior").min(1).max(10).step(0.0001);
rainTweaks.add(raindropMaterial, "thickness").min(0).max(1).step(0.0001);

for (let i = 0; i < 110; i++) {
  // Create the mesh
  const raindrop = new THREE.Mesh(raindropGeometry, raindropMaterial);

  raindrop.position.x = (Math.random() - 0.5) * 25;
  raindrop.position.y = (Math.random() - 0.5) * 20;
  raindrop.position.z = (Math.random() - 0.5) * 20;

  // diamond.rotation.x = Math.random() * Math.PI;
  // diamond.rotation.y = Math.random() * Math.PI;

  const scale = Math.random();
  raindrop.scale.set(0.4, 0.4, 0.4);
  // diamond.scale.set(0.2,3,0.2);
  group.add(raindrop);
  scene.add(group);

  const clock = new THREE.Clock();
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    raindrop.position.y -= 0.1; // Make raindrops fall downward
    if (raindrop.position.y < -10) {
      raindrop.position.y = 10; // Reset raindrop position when it goes below the screen
    }
    window.requestAnimationFrame(tick);
  };

  tick();
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
camera.lookAt(group.position);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const rgbeLoader = new RGBELoader();
rgbeLoader.load("./textures/environmentMap/sky.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

window.addEventListener("resize", () => {
  (sizes.width = window.innerWidth), (sizes.height = window.innerHeight);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
});

window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
