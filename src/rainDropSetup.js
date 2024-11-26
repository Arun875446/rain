import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
const canvas = document.querySelector(".webgl");

const scene = new THREE.Scene();
const group = new THREE.Group();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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
const raindropMaterial = new THREE.MeshBasicMaterial({
  color: 0x0077ff,
  wireframe: false,
  transparent: true,
  opacity: 0.8, // Gives it a glassy look
});

// Create the mesh
const raindrop = new THREE.Mesh(raindropGeometry, raindropMaterial);

group.add(raindrop);
scene.add(group);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.lookAt(group.position);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
