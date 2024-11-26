import * as THREE from "three";
const canvas = document.querySelector(".webgl");
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import GUI from "lil-gui";

const gui = new GUI({
  width: 300,
  closeFolders: true,
  title: "raindrops",
});

const raindropTweaks = gui.addFolder("raindropTweaks");
const scene = new THREE.Scene();

const group = new THREE.Group();
// Snowflake Geometry

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
camera.lookAt(group.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

const points = [];
points.push(new THREE.Vector2(0, 1.5)); // Top of the drop (pointy tip)
points.push(new THREE.Vector2(0.3, 1)); // Slope outward
points.push(new THREE.Vector2(0.6, 0.5)); // Curve outward
points.push(new THREE.Vector2(0.7, 0)); // Widest part
points.push(new THREE.Vector2(0.4, -0.8)); // Taper to the bottom
points.push(new THREE.Vector2(0, -1)); // Bottom of the raindrop

// Create the lathe geometry by revolving the points around the Y-axis
const raindropGeometry = new THREE.LatheGeometry(points, 32);

const debugObject = {
  color: "#B0D0D3",

  // Light Blue: #A7C7E7 (represents a light, water-like shade)
  // Grayish Blue: #5B7D91 (gives a more cloudy, rainstorm look)
  // Clear Water: #B0D0D3 (a translucent, clear look for raindrops)
};
// Material
const raindropMaterial = new THREE.MeshPhysicalMaterial();

raindropMaterial.color = new THREE.Color(debugObject.color);
raindropMaterial.wireframe = false;
raindropMaterial.opacity = 0.5;
raindropMaterial.transparent = true;
raindropMaterial.side = THREE.DoubleSide;

raindropMaterial.metalness = 0;
raindropMaterial.roughness = 0;

raindropMaterial.transmission = 1;
raindropMaterial.ior = 6.613;
raindropMaterial.thickness = 0;

raindropTweaks.add(raindropMaterial, "wireframe");
raindropTweaks.add(raindropMaterial, "transmission").min(0).max(1).step(0.0001);
raindropTweaks.add(raindropMaterial, "ior").min(1).max(10).step(0.0001);
raindropTweaks.add(raindropMaterial, "thickness").min(0).max(1).step(0.0001);
raindropTweaks.addColor(debugObject, "color").onChange(() => {
  raindropMaterial.color.set(debugObject.color);
});

for (let i = 0; i < 150; i++) {
  const raindrop = new THREE.Mesh(raindropGeometry, raindropMaterial);

  raindrop.position.x = (Math.random() - 0.5) * 20;
  raindrop.position.y = (Math.random() - 0.5) * 20;
  raindrop.position.z = (Math.random() - 0.5) * 20;

  // raindrop.rotation.x = Math.random() * Math.PI;
  // raindrop.rotation.y = Math.random() * Math.PI;

  const scale = Math.random();
  raindrop.scale.set(scale, scale, scale);
  raindrop.scale.set(0.5, 0.5, 0.5);
  group.add(raindrop);
  scene.add(group);

  const clock2 = new THREE.Clock();
  const tick2 = () => {
    const elapsedTime = clock2.getElapsedTime();
    raindrop.position.y -= 0.1; // Make raindrops fall downward
    if (raindrop.position.y < -10) {
      raindrop.position.y = 10; // Reset raindrop position when it goes below the screen
    }

    window.requestAnimationFrame(tick2);
  };

  tick2();
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

scene.add(group);

renderer.setSize(sizes.width, sizes.height);

const rgbeLoader = new RGBELoader();
rgbeLoader.load("./textures/environmentMap/sky.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

window.addEventListener("resize", () => {
  (sizes.width = window.innerWidth), (sizes.height = window.innerHeight);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
