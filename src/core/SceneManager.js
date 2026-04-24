import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} not found`);

    this.scene = new THREE.Scene();
    
    // Setup Camera
    const isMobile = window.innerWidth <= 768;
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      1,
      1000
    );
    
    // Zoom out even more on mobile for the 16:9 aspect ratio and safe padding
    const zPos = isMobile ? 320 : 150;
    const yPos = isMobile ? -320 : -150;
    this.camera.position.set(0, yPos, zPos);

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Setup Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.2; 

    // Main group to hold the model
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    this.setupLights();
    this.setupResizeHandler();
    this.animate();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 50, 100);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-50, -50, 50);
    this.scene.add(fillLight);
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  clearModel() {
    while(this.modelGroup.children.length > 0) { 
      this.modelGroup.remove(this.modelGroup.children[0]); 
    }
  }

  addToModel(object) {
    this.modelGroup.add(object);
  }

  setCameraDistance(distance) {
    const isMobile = window.innerWidth <= 768;
    // On mobile, distance maps to both Y and Z to maintain angle
    const factor = isMobile ? 1 : 1; 
    this.camera.position.set(0, -distance, distance);
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
